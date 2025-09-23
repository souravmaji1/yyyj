const axios = require('axios');
const { google } = require('googleapis');
const { GoogleAdsApi, enums } = require('google-ads-api');
const { NextResponse } = require('next/server');

const OAuth2 = google.auth.OAuth2;

async function createCampaign(options) {
    const { 
        customerId, 
        refreshToken, 
        campaignDetails, 
        managerCustomerId,
        adContent // New parameter for ad content
    } = options;

    console.log(adContent)
    
    // Load environment variables
    const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const DEVELOPER_TOKEN = process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN;
    const MANAGER_CUSTOMER_ID = managerCustomerId;
    const API_VERSION = process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION || '21';

    if (!CLIENT_ID || !CLIENT_SECRET || !DEVELOPER_TOKEN) {
        throw new Error('Missing required environment variables for Google Ads API authentication');
    }

    // Validate input
    if (!customerId || !/^\d{10}$/.test(customerId)) {
        throw new Error('Customer ID must be a 10-digit number');
    }
    if (!refreshToken) {
        throw new Error('Refresh token is required');
    }
    if (!campaignDetails || !campaignDetails.name || campaignDetails.name.length < 3) {
        throw new Error('Campaign name must be at least 3 characters');
    }
    if (!campaignDetails.budgetMicros || campaignDetails.budgetMicros <= 0) {
        throw new Error('Budget must be greater than zero');
    }
    if (!campaignDetails.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(campaignDetails.startDate)) {
        throw new Error('Valid start date required (YYYY-MM-DD)');
    }
    if (!campaignDetails.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(campaignDetails.endDate)) {
        throw new Error('Valid end date required (YYYY-MM-DD)');
    }
    const today = new Date().toISOString().split('T')[0];
    if (campaignDetails.startDate < today) {
        throw new Error('Start date cannot be in the past');
    }
    if (campaignDetails.endDate < campaignDetails.startDate) {
        throw new Error('End date must be after start date');
    }
    if (!campaignDetails.youtubeVideoUrl || !/^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(campaignDetails.youtubeVideoUrl)) {
        throw new Error('Valid YouTube video URL required');
    }
    if (!campaignDetails.businessName || campaignDetails.businessName.length < 3) {
        throw new Error('Business name must be at least 3 characters');
    }
    
    // Validate ad content
    if (!adContent || !adContent.imageUrl) {
        throw new Error('Image URL is required');
    }
    if (!adContent.headlines || adContent.headlines.length < 3) {
        throw new Error('At least 3 headlines are required');
    }
    if (!adContent.longHeadlines || adContent.longHeadlines.length < 1) {
        throw new Error('At least 1 long headline is required');
    }
    if (!adContent.descriptions || adContent.descriptions.length < 2) {
        throw new Error('At least 2 descriptions are required');
    }

    // Initialize OAuth2 client
    const oauth2Client = new OAuth2(
        CLIENT_ID,
        CLIENT_SECRET,
        'https://developers.google.com/oauthplayground'
    );

    oauth2Client.setCredentials({
        refresh_token: refreshToken
    });

    try {
        // Step 1: Create campaign budget using axios
        console.log('Obtaining access token for budget creation...');
        const tokenResponse = await oauth2Client.getAccessToken();
        const accessToken = tokenResponse.token;

        if (!accessToken) {
            throw new Error('Failed to obtain access token');
        }

        console.log('Successfully obtained access token');

        const headers = {
            'Content-Type': 'application/json',
            'Developer-Token': DEVELOPER_TOKEN,
            'Authorization': `Bearer ${accessToken}`,
            'login-customer-id': MANAGER_CUSTOMER_ID
        };

        console.log('Creating campaign budget...');
        const budgetResponse = await axios({
            method: 'POST',
            url: `https://googleads.googleapis.com/v${API_VERSION}/customers/${customerId}/campaignBudgets:mutate`,
            headers: headers,
            timeout: 30000,
            data: {
                operations: [
                    {
                        create: {
                            name: `Budget for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                            delivery_method: 'STANDARD',
                            amount_micros: campaignDetails.budgetMicros,
                            explicitly_shared: false
                        }
                    }
                ]
            }
        });

        const budgetResult = budgetResponse.data.results?.[0];
        if (!budgetResult || !budgetResult.resourceName) {
            throw new Error('Budget creation succeeded but resourceName not found in response');
        }
        const campaignBudgetResourceName = budgetResult.resourceName;
        console.log(`Budget created: ${campaignBudgetResourceName}`);

        // Step 2: Create campaign using google-ads-api
        console.log('Initializing Google Ads API client for campaign creation...');
        const adsClient = new GoogleAdsApi({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            developer_token: DEVELOPER_TOKEN
        });

        const customer = adsClient.Customer({
            customer_id: customerId,
            refresh_token: refreshToken,
            login_customer_id: MANAGER_CUSTOMER_ID || undefined
        });

        console.log('Creating campaign...');
        const campaignOperations = [
            {
                entity: 'campaign',
                operation: 'create',
                resource: {
                    name: `${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                    advertising_channel_type: enums.AdvertisingChannelType.DEMAND_GEN,
                    status: enums.CampaignStatus.PAUSED,
                    target_spend: {
                        max_cpc_bid_micros: 1000000
                    },
                    campaign_budget: campaignBudgetResourceName,
                    contains_eu_political_advertising: 2, // string, not boolean
                    start_date: campaignDetails.startDate,
                    end_date: campaignDetails.endDate
                }
            }
        ];

        const campaignResponse = await customer.mutateResources(campaignOperations);
        const campaignResourceName = campaignResponse.mutate_operation_responses?.[0]?.campaign_result?.resource_name;
        if (!campaignResourceName) {
            throw new Error('Campaign creation succeeded but resourceName not found in response');
        }

        // Step 3: Create ad group
        console.log('Creating ad group...');
        const adGroupOperations = [
            {
                entity: 'ad_group',
                operation: 'create',
                resource: {
                    name: `Ad Group for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                    campaign: campaignResourceName,
                    status: enums.AdGroupStatus.ENABLED,
                    type: 'DEMAND_GEN_VIDEO_RESPONSIVE',
                    demand_gen_ad_group_settings: {
                        channel_controls: {
                            channel_strategy: 'SELECTED_CHANNELS',
                            selected_channels: {
                                youtube_in_stream: false,
                                youtube_in_feed: false,
                                youtube_shorts: true,
                                discover: false,
                                gmail: false,
                                display: false,
                                maps: false
                            }
                        }
                    }
                }
            }
        ];

        const adGroupResponse = await customer.mutateResources(adGroupOperations);
        const adGroupResourceName = adGroupResponse.mutate_operation_responses?.[0]?.ad_group_result?.resource_name;
        if (!adGroupResourceName) {
            throw new Error('Ad group creation succeeded but resourceName not found in response');
        }

        // Step 4: Create video and image assets
        const videoAssetOperations = [
            {
                entity: 'asset',
                operation: 'create',
                resource: {
                    name: `Video for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                    type: enums.AssetType.YOUTUBE_VIDEO,
                    youtube_video_asset: {
                        youtube_video_id: campaignDetails.youtubeVideoUrl.split('v=')[1] || campaignDetails.youtubeVideoUrl
                    }
                }
            }
        ];
        const videoAssetResponse = await customer.mutateResources(videoAssetOperations);
        const videoAssetResourceName = videoAssetResponse.mutate_operation_responses[0].asset_result.resource_name;

        console.log('Downloading image from URL:', adContent.imageUrl);
        const imageResponse = await axios.get(adContent.imageUrl, { responseType: 'arraybuffer' });
        const imageBuffer = Buffer.from(imageResponse.data, 'binary');
        const imageData = imageBuffer.toString('base64');
        const mimeType = imageResponse.headers['content-type'];

        const imageAssetOperations = [
            {
                entity: 'asset',
                operation: 'create',
                resource: {
                    name: `Image for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                    type: enums.AssetType.IMAGE,
                    image_asset: {
                        data: imageData,
                        mime_type: mimeType
                    }
                }
            }
        ];
        const imageAssetResponse = await customer.mutateResources(imageAssetOperations);
        const imageAssetResourceName = imageAssetResponse.mutate_operation_responses[0].asset_result.resource_name;

        // Step 5: Create ad with custom content
        console.log('Creating DemandGenVideoResponsiveAd with custom content...');
        const adOperations = [
            {
                entity: 'ad_group_ad',
                operation: 'create',
                resource: {
                    ad_group: adGroupResourceName,
                    status: 'PAUSED',
                    ad: {
                        name: `Ad for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                        type: enums.AdType.DEMAND_GEN_VIDEO_RESPONSIVE_AD,
                        final_urls: [campaignDetails.youtubeVideoUrl],
                        demand_gen_video_responsive_ad: {
                            headlines: adContent.headlines.map(text => ({ text })),
                            long_headlines: adContent.longHeadlines.map(text => ({ text })),
                            descriptions: adContent.descriptions.map(text => ({ text })),
                            videos: [
                                { asset: videoAssetResourceName }
                            ],
                            business_name: { text: campaignDetails.businessName },
                            logo_images: [
                                { asset: imageAssetResourceName }
                            ]
                        }
                    }
                }
            }
        ];

        const adResponse = await customer.mutateResources(adOperations);
        const adResourceName = adResponse.mutate_operation_responses?.[0]?.ad_group_ad_result?.resource_name;
        if (!adResourceName) {
            throw new Error('Ad creation succeeded but resourceName not found in response');
        }

        return {
            success: true,
            budgetResourceName: campaignBudgetResourceName,
            campaignResourceName: campaignResourceName,
            adGroupResourceName: adGroupResourceName,
            adResourceName: adResourceName,
            message: 'Campaign created successfully with custom ad content'
        };
    } catch (error) {
        console.error('Error creating campaign:', error.response?.data?.error?.message || error.message);
        console.error('Error details:', JSON.stringify(error.response?.data?.error?.details || error, null, 2));
        throw error;
    }
}

export async function POST(request) {
    try {
        const { 
            customerId, 
            refreshToken, 
            campaignDetails, 
            managerCustomerId,
            adContent // New parameter for ad content
        } = await request.json();

        const result = await createCampaign({
            customerId,
            refreshToken,
            campaignDetails,
            managerCustomerId,
            adContent
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: `Failed to create campaign: ${error.message}` },
            { status: 500 }
        );
    }
}