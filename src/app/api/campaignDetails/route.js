import { NextResponse } from 'next/server';

export async function POST(request) {
  // Enhanced logger with timestamp and request ID
  const requestId = Math.random().toString(36).substring(2, 8);
  const log = (message, data = null) => {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      requestId,
      message,
      ...(data && { data: typeof data === 'string' ? data : JSON.parse(JSON.stringify(data)) })
    };
    console.log(JSON.stringify(logEntry, null, 2));
  };

  try {
    log('API request started');

    // Parse request body with validation
    let requestBody;
    try {
      requestBody = await request.json();
      log('Request body parsed successfully');
    } catch (e) {
      log('Failed to parse request body', { error: e.message });
      return NextResponse.json(
        { success: false, error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    // Validate required parameters
    const requiredParams = ['customerId', 'refreshToken', 'campaignId'];
    const missingParams = requiredParams.filter(param => !requestBody[param]);
    
    if (missingParams.length > 0) {
      log('Missing required parameters', { missingParams });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required parameters',
          missingParams,
          receivedParams: {
            customerId: !!requestBody.customerId,
            refreshToken: !!requestBody.refreshToken,
            campaignId: !!requestBody.campaignId
          }
        },
        { status: 400 }
      );
    }

    const { customerId, refreshToken, managerCustomerId, campaignId } = requestBody;
    log('Extracted parameters', {
      customerId: customerId,
      managerCustomerId: managerCustomerId || 'Not provided',
      campaignId: campaignId
    });

    // Validate campaignId is numeric
    if (isNaN(Number(campaignId))) {
      log('Invalid campaign ID format', { campaignId });
      return NextResponse.json(
        { success: false, error: 'campaignId must be a number' },
        { status: 400 }
      );
    }

    // Load and validate environment variables
    const env = {
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
      developerToken: process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN,
      apiVersion: process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION || 'v21'
    };

    const missingEnvVars = Object.entries(env)
      .filter(([key, value]) => !value && key !== 'apiVersion')
      .map(([key]) => key);

    if (missingEnvVars.length > 0) {
      log('Missing environment variables', { missingEnvVars });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Server configuration error',
          missingEnvVars
        },
        { status: 500 }
      );
    }

    log('Environment variables verified', {
      clientId: !!env.clientId,
      clientSecret: !!env.clientSecret,
      developerToken: !!env.developerToken,
      apiVersion: env.apiVersion
    });

    // Access token retrieval
    let accessToken;
    try {
      log('Attempting to get access token');
      const tokenParams = new URLSearchParams({
        client_id: env.clientId,
        client_secret: env.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token'
      });

      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenParams
      });

      const tokenData = await tokenResponse.json();
      log('OAuth response received', {
        status: tokenResponse.status,
        responseKeys: Object.keys(tokenData)
      });

      if (!tokenResponse.ok) {
        throw new Error(tokenData.error_description || 'Failed to obtain access token');
      }

      accessToken = tokenData.access_token;
      log('Access token obtained successfully');
    } catch (tokenError) {
      log('Access token error', {
        error: tokenError.message,
        stack: tokenError.stack
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Authentication failed',
          details: tokenError.message
        },
        { status: 401 }
      );
    }

    // Google Ads API request
    const campaignQuery = `
      SELECT
        campaign.id,
        campaign.name,
        campaign.status,
        campaign.advertising_channel_type,
        campaign.advertising_channel_sub_type,
        campaign.bidding_strategy_type,
        campaign.start_date,
        campaign.end_date,
        campaign_budget.amount_micros,
        campaign_budget.delivery_method,
        metrics.clicks,
        metrics.impressions,
        metrics.ctr,
        metrics.average_cpc,
        metrics.cost_micros,
        metrics.cost_per_conversion
      FROM campaign
      WHERE campaign.id = ${Number(campaignId)}
      AND segments.date DURING LAST_30_DAYS
    `;

    log('Constructed GAQL query', { query: campaignQuery.trim() });

    const apiUrl = `https://googleads.googleapis.com/${env.apiVersion}/customers/${customerId}/googleAds:search`;
    const headers = {
      'Content-Type': 'application/json',
      'developer-token': env.developerToken,
      'Authorization': `Bearer ${accessToken}`,
      ...(managerCustomerId && { 'login-customer-id': managerCustomerId })
    };

    log('Preparing API request', {
      url: apiUrl,
      headers: Object.keys(headers),
      method: 'POST'
    });

    let apiResponse;
    try {
      apiResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({ query: campaignQuery.trim() })
      });

      const responseData = await apiResponse.json();
      log('API response received', {
        status: apiResponse.status,
        responseSummary: {
          resultsCount: responseData.results?.length || 0,
          fieldMask: responseData.fieldMask,
          requestId: responseData.requestId
        }
      });

      if (!apiResponse.ok) {
        log('API error details', responseData.error);
        throw new Error(
          responseData.error?.message || 
          `API request failed with status ${apiResponse.status}`
        );
      }

      if (!responseData.results || responseData.results.length === 0) {
        log('No results found', { campaignId });
        return NextResponse.json(
          { success: false, error: `No campaign found with ID ${campaignId}` },
          { status: 404 }
        );
      }

      // Process campaign data
      const campaignResult = responseData.results[0];
      const processedCampaign = {
        id: campaignResult.campaign.id,
        name: campaignResult.campaign.name,
        status: campaignResult.campaign.status,
        type: campaignResult.campaign.advertisingChannelType,
        subType: campaignResult.campaign.advertisingChannelSubType,
        strategy: campaignResult.campaign.biddingStrategyType,
        dates: {
          start: campaignResult.campaign.startDate,
          end: campaignResult.campaign.endDate
        },
        budget: {
          amount: campaignResult.campaignBudget?.amountMicros ? 
            parseInt(campaignResult.campaignBudget.amountMicros) / 1000000 : 0,
          delivery: campaignResult.campaignBudget?.deliveryMethod
        },
        metrics: {
          clicks: campaignResult.metrics?.clicks || 0,
          impressions: campaignResult.metrics?.impressions || 0,
          ctr: campaignResult.metrics?.ctr ? (campaignResult.metrics.ctr * 100).toFixed(2) + '%' : '0%',
          avgCpc: campaignResult.metrics?.averageCpc ? 
            '$' + (parseInt(campaignResult.metrics.averageCpc) / 1000000).toFixed(2) : '$0',
          cost: campaignResult.metrics?.costMicros ? 
            '$' + (parseInt(campaignResult.metrics.costMicros) / 1000000).toFixed(2) : '$0',
          conversions: campaignResult.metrics?.conversions || 0,
          conversionRate: campaignResult.metrics?.conversionRate ? 
            (campaignResult.metrics.conversionRate * 100).toFixed(2) + '%' : '0%',
          costPerConversion: campaignResult.metrics?.costPerConversion ? 
            '$' + (parseInt(campaignResult.metrics.costPerConversion) / 1000000).toFixed(2) : '$0'
        }
      };

      log('Successfully processed campaign data');
      return NextResponse.json({
        success: true,
        campaign: processedCampaign,
        metadata: {
          customerId,
          dateRange: 'LAST_30_DAYS',
          apiVersion: env.apiVersion,
          fetchedAt: new Date().toISOString(),
          requestId: responseData.requestId
        }
      });

    } catch (apiError) {
      log('API request failed', {
        error: apiError.message,
        status: apiResponse?.status,
        url: apiUrl,
        headers: Object.keys(headers)
      });

      return NextResponse.json(
        { 
          success: false, 
          error: apiError.message,
          ...(process.env.NODE_ENV !== 'production' && {
            details: {
              query: campaignQuery.trim(),
              apiUrl,
              headers: Object.keys(headers)
            }
          })
        },
        { status: apiError.status || 500 }
      );
    }

  } catch (error) {
    log('Unexpected error in API route', {
      error: error.message,
      stack: error.stack,
      requestInfo: {
        method: request.method,
        url: request.url,
        headers: Object.fromEntries(request.headers.entries())
      }
    });

    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        ...(process.env.NODE_ENV !== 'production' && {
          details: error.message
        })
      },
      { status: 500 }
    );
  }
}