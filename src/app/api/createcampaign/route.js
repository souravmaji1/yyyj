import { NextResponse } from 'next/server';

async function getAccessToken(clientId, clientSecret, refreshToken) {
  try {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error_description || 'Failed to obtain access token');
    }
    return data.access_token;
  } catch (err) {
    throw new Error(`Access token error: ${err.message}`);
  }
}

export async function POST(request) {
  try {
    const { customerId, refreshToken, campaignDetails, managerCustomerId } = await request.json();
    console.log('Request body:', { customerId, refreshToken, campaignDetails, managerCustomerId });

    // Validate input
    if (!customerId || !campaignDetails) {
      return NextResponse.json(
        { error: 'Missing customer ID or campaign details' },
        { status: 400 }
      );
    }

    if (!/^\d{10}$/.test(customerId)) {
      return NextResponse.json(
        { error: 'Customer ID must be a 10-digit number' },
        { status: 400 }
      );
    }

    if (!campaignDetails.name || campaignDetails.name.length < 3) {
      return NextResponse.json(
        { error: 'Campaign name must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (!['SEARCH', 'DISPLAY', 'VIDEO', 'SHOPPING'].includes(campaignDetails.channelType)) {
      return NextResponse.json(
        { error: 'Invalid channel type. Must be SEARCH, DISPLAY, VIDEO, or SHOPPING' },
        { status: 400 }
      );
    }

    const budgetMicros = campaignDetails.budgetMicros || 100000000;
    if (budgetMicros <= 0) {
      return NextResponse.json(
        { error: 'Budget must be greater than zero' },
        { status: 400 }
      );
    }

    if (!campaignDetails.startDate || !/^\d{4}-\d{2}-\d{2}$/.test(campaignDetails.startDate)) {
      return NextResponse.json(
        { error: 'Valid start date required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    if (!campaignDetails.endDate || !/^\d{4}-\d{2}-\d{2}$/.test(campaignDetails.endDate)) {
      return NextResponse.json(
        { error: 'Valid end date required (YYYY-MM-DD)' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    if (campaignDetails.startDate < today) {
      return NextResponse.json(
        { error: 'Start date cannot be in the past' },
        { status: 400 }
      );
    }

    if (campaignDetails.endDate < campaignDetails.startDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    // Validate ad content (for Search campaigns)
    if (campaignDetails.channelType === 'SEARCH') {
      if (!campaignDetails.adContent || !campaignDetails.adContent.headlines || !campaignDetails.adContent.descriptions) {
        return NextResponse.json(
          { error: 'Ad content (headlines and descriptions) required for Search campaigns' },
          { status: 400 }
        );
      }

      if (campaignDetails.adContent.headlines.length < 3 || campaignDetails.adContent.headlines.some(h => h.length < 3 || h.length > 30)) {
        return NextResponse.json(
          { error: 'At least 3 headlines required, each 3-30 characters' },
          { status: 400 }
        );
      }

      if (campaignDetails.adContent.descriptions.length < 2 || campaignDetails.adContent.descriptions.some(d => d.length < 3 || d.length > 90)) {
        return NextResponse.json(
          { error: 'At least 2 descriptions required, each 3-90 characters' },
          { status: 400 }
        );
      }
    }

    // Load environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const developerToken = process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN;
    const envManagerCustomerId = process.env.NEXT_PUBLIC_GOOGLE_ADS_MANAGER_CUSTOMER_ID;
    const apiVersion = process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION || '21';

    console.log('Environment variables:', {
      clientId: !!clientId,
      clientSecret: !!clientSecret,
      developerToken: !!developerToken,
      envManagerCustomerId: !!envManagerCustomerId,
      apiVersion,
    });

    if (!clientId || !clientSecret || !developerToken) {
      return NextResponse.json(
        { error: 'Server configuration error: Missing required environment variables' },
        { status: 500 }
      );
    }

    // Use managerCustomerId from request or environment
    const effectiveManagerCustomerId = managerCustomerId || envManagerCustomerId;

    // Obtain access token
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    console.log('Access token obtained:', accessToken);

    // Step 1: Create campaign budget
    const budgetResponse = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers/${customerId}/campaignBudgets:mutate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Developer-Token': developerToken,
          'Authorization': `Bearer ${accessToken}`,
          ...(effectiveManagerCustomerId && { 'login-customer-id': effectiveManagerCustomerId }),
        },
        body: JSON.stringify({
          operations: [
            {
              create: {
                name: `Budget for ${campaignDetails.name} #${Math.floor(Math.random() * 10000)}`,
                deliveryMethod: 'STANDARD',
                amountMicros: budgetMicros,
              },
            },
          ],
        }),
      }
    );

    const budgetData = await budgetResponse.json();
    console.log('Budget response:', JSON.stringify(budgetData, null, 2));

    if (!budgetResponse.ok) {
      console.error('Budget creation error details:', JSON.stringify(budgetData.error?.details, null, 2));
      throw new Error(budgetData.error?.message || 'Failed to create campaign budget');
    }

    const campaignBudgetResourceName = budgetData.results[0]?.resourceName;
    if (!campaignBudgetResourceName) {
      throw new Error('No campaign budget resource name returned');
    }

    // Step 2: Create campaign
    const campaignResponse = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers/${customerId}/campaigns:mutate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Developer-Token': developerToken,
          'Authorization': `Bearer ${accessToken}`,
          ...(effectiveManagerCustomerId && { 'login-customer-id': effectiveManagerCustomerId }),
        },
        body: JSON.stringify({
          operations: [
            {
              create: {
                campaignBudget: campaignBudgetResourceName,
                name: campaignDetails.name,
                advertisingChannelType: campaignDetails.channelType,
                status: 'PAUSED',
                startDate: campaignDetails.startDate, // Include start date
                endDate: campaignDetails.endDate, // Include end 
                containsEuPoliticalAdvertising: 2, // string, not boolean
                manualCpc: {
                  enhancedCpcEnabled: false,
                },
                networkSettings: {
                  targetGoogleSearch: true,
                  targetSearchNetwork: true,
                  targetContentNetwork: false,
                  targetPartnerSearchNetwork: false,
                },
              },
            },
          ],
        }),
      }
    );

    const campaignData = await campaignResponse.json();
    console.log('Campaign response:', JSON.stringify(campaignData, null, 2));

    if (!campaignResponse.ok) {
      console.error('Campaign creation error details:', JSON.stringify(campaignData.error?.details, null, 2));
      throw new Error(
        campaignData.error?.details?.[0]?.errors?.[0]?.message ||
        campaignData.error?.message ||
        'Failed to create campaign'
      );
    }

    const campaignResourceName = campaignData.results[0]?.resourceName;
    if (!campaignResourceName) {
      throw new Error('No campaign resource name returned');
    }

    // Step 3: Create ad group
    const adGroupResponse = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers/${customerId}/adGroups:mutate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Developer-Token': developerToken,
          'Authorization': `Bearer ${accessToken}`,
          ...(effectiveManagerCustomerId && { 'login-customer-id': effectiveManagerCustomerId }),
        },
        body: JSON.stringify({
          operations: [
            {
              create: {
                campaign: campaignResourceName,
                name: `Ad Group for ${campaignDetails.name}`,
                status: 'ENABLED',
                type: campaignDetails.channelType === 'SEARCH' ? 'SEARCH_STANDARD' : 'DISPLAY_STANDARD',
                cpcBidMicros: 1000000, // $1.00 default bid
              },
            },
          ],
        }),
      }
    );

    const adGroupData = await adGroupResponse.json();
    console.log('Ad Group response:', JSON.stringify(adGroupData, null, 2));

    if (!adGroupResponse.ok) {
      console.error('Ad Group creation error details:', JSON.stringify(adGroupData.error?.details, null, 2));
      throw new Error(
        adGroupData.error?.details?.[0]?.errors?.[0]?.message ||
        adGroupData.error?.message ||
        'Failed to create ad group'
      );
    }

    const adGroupResourceName = adGroupData.results[0]?.resourceName;
    if (!adGroupResourceName) {
      throw new Error('No ad group resource name returned');
    }

    // Step 4: Create ad (Responsive Search Ad for Search campaigns)
    if (campaignDetails.channelType === 'SEARCH') {
      const adResponse = await fetch(
        `https://googleads.googleapis.com/v${apiVersion}/customers/${customerId}/adGroupAds:mutate`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Developer-Token': developerToken,
            'Authorization': `Bearer ${accessToken}`,
            ...(effectiveManagerCustomerId && { 'login-customer-id': effectiveManagerCustomerId }),
          },
          body: JSON.stringify({
            operations: [
              {
                create: {
                  adGroup: adGroupResourceName,
                  status: 'ENABLED',
                  ad: {
                    finalUrls: [campaignDetails.adContent.finalUrl || 'https://example.com'],
                    responsiveSearchAd: {
                      headlines: campaignDetails.adContent.headlines.map(headline => ({
                        text: headline,
                        pinnedField: null,
                      })),
                      descriptions: campaignDetails.adContent.descriptions.map(description => ({
                        text: description,
                        pinnedField: null,
                      })),
                    },
                  },
                },
              },
            ],
          }),
        }
      );

      const adData = await adResponse.json();
      console.log('Ad response:', JSON.stringify(adData, null, 2));

      if (!adResponse.ok) {
        console.error('Ad creation error details:', JSON.stringify(adData.error?.details, null, 2));
        throw new Error(
          adData.error?.details?.[0]?.errors?.[0]?.message ||
          adData.error?.message ||
          'Failed to create ad'
        );
      }

      const adResourceName = adData.results[0]?.resourceName;
      if (!adResourceName) {
        throw new Error('No ad resource name returned');
      }
    }

    return NextResponse.json(
      {
        message: 'Campaign created successfully',
        campaign: { resourceName: campaignResourceName },
        budget: { resourceName: campaignBudgetResourceName },
        adGroup: { resourceName: adGroupResourceName },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error creating campaign:', err);
    console.error('Stack trace:', err.stack);
    return NextResponse.json(
      { error: `Failed to create campaign: ${err.message}` },
      { status: 500 }
    );
  }
}