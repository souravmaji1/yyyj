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

async function getSubAccountIds(managerAccountId, accessToken, developerToken, apiVersion) {
  const endpoint = `https://googleads.googleapis.com/v${apiVersion}/customers/${managerAccountId}/googleAds:searchStream`;

  const query = `
    SELECT customer_client.client_customer,customer.id, customer_client.descriptive_name, customer.test_account, customer.manager, customer_client.manager
    FROM customer_client
    WHERE customer_client.manager = FALSE AND customer_client.status = 'ENABLED'
  `;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
      'developer-token': developerToken,
      'login-customer-id': managerAccountId,
    },
    body: JSON.stringify({ query }),
  };

  try {
    const response = await fetch(endpoint, options);
    const data = await response.json();

    console.log(data)

    if (!response.ok) {
      console.error('Sub-account fetch error:', JSON.stringify(data.error?.details, null, 2));
      throw new Error(data.error?.message || `HTTP error! status: ${response.status}`);
    }

    const subAccounts = [];
    for (const streamResponse of data) {
      if (streamResponse.results) {
        for (const result of streamResponse.results) {
          const clientCustomerId = result.customerClient.clientCustomer.split('/')[1];
          subAccounts.push({
            id: clientCustomerId,
            name: result.customerClient.descriptiveName || clientCustomerId,
            isManager: result.customerClient.manager || false,
          });
        }
      }
    }

    console.log(`Sub-accounts for manager ${managerAccountId}:`, JSON.stringify(subAccounts, null, 2));
    return subAccounts;
  } catch (error) {
    console.error(`Error fetching sub-account IDs for manager ${managerAccountId}:`, error);
    return [];
  }
}

async function getCustomerDetails(customerId, accessToken, developerToken, managerCustomerId, apiVersion) {
  try {
    const response = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers/${customerId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Developer-Token': developerToken,
          'Authorization': `Bearer ${accessToken}`,
          ...(managerCustomerId && { 'login-customer-id': managerCustomerId }),
        },
      }
    );

    const data = await response.json();
    if (!response.ok) {
      console.error('Customer details error for', customerId, ':', JSON.stringify(data.error?.details, null, 2));
      return { id: customerId, name: customerId, isManager: false };
    }

    return {
      id: customerId,
      name: data.descriptiveName || customerId,
      isManager: data.manager === true,
    };
  } catch (err) {
    console.error(`Error fetching details for customer ${customerId}:`, err);
    return { id: customerId, name: customerId, isManager: false };
  }
}

export async function POST(request) {
  try {
    const { refreshToken } = await request.json();
    console.log('GetCustomerIds request body:', { refreshToken });

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'Missing refresh token' },
        { status: 400 }
      );
    }

    // Load environment variables
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET;
    const developerToken = process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN;
    const envManagerCustomerId = process.env.NEXT_PUBLIC_GOOGLE_ADS_MANAGER_CUSTOMER_ID;
    const apiVersion = process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION || '20';

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

    // Obtain access token
    const accessToken = await getAccessToken(clientId, clientSecret, refreshToken);
    console.log('Access token obtained:', accessToken);

    // Fetch accessible customer IDs
    const response = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers:listAccessibleCustomers`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Developer-Token': developerToken,
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    const data = await response.json();
    console.log('ListAccessibleCustomers response:', JSON.stringify(data, null, 2));

    if (!response.ok) {
      console.error('ListAccessibleCustomers error details:', JSON.stringify(data.error?.details, null, 2));
      throw new Error(data.error?.message || 'Failed to fetch customer IDs');
    }

    let customerIds = data.resourceNames.map((resourceName) => resourceName.split('/')[1]);
    let customers = [];
    let managerCustomerIds = [];

    // Fetch details for each customer ID
    for (const customerId of customerIds) {
      const customerDetails = await getCustomerDetails(customerId, accessToken, developerToken, envManagerCustomerId, apiVersion);
      if (customerDetails.isManager) {
        managerCustomerIds.push(customerId);
      } else {
        customers.push(customerDetails);
      }
    }

    // Fetch sub-accounts for each manager account
    for (const managerId of managerCustomerIds) {
      const subAccounts = await getSubAccountIds(managerId, accessToken, developerToken, apiVersion);
      customers.push(...subAccounts);
    }

    // Filter out manager accounts and duplicates, sort by name
    customers = customers
      .filter((customer) => !customer.isManager)
      .filter((customer, index, self) => self.findIndex((c) => c.id === customer.id) === index)
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log('Processed customers:', JSON.stringify(customers, null, 2));

    return NextResponse.json(
      {
        message: 'Customer IDs fetched successfully',
        customers,
        managerCustomerIds: managerCustomerIds.length > 0 ? managerCustomerIds : [envManagerCustomerId].filter(Boolean),
      },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error fetching customer IDs:', err);
    console.error('Stack trace:', err.stack);
    return NextResponse.json(
      { error: `Failed to fetch customer IDs: ${err.message}` },
      { status: 500 }
    );
  }
}