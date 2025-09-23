import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { refreshToken, managerId } = await request.json()

    if (!refreshToken || !managerId) {
      return NextResponse.json(
        { message: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get access token using refresh token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        client_secret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      })
    })

    if (!tokenResponse.ok) {
      throw new Error('Failed to get access token')
    }

    const tokenData = await tokenResponse.json()
    const accessToken = tokenData.access_token

    // Fetch customer hierarchy
    const apiVersion = process.env.NEXT_PUBLIC_GOOGLE_ADS_API_VERSION || '20'
    const response = await fetch(
      `https://googleads.googleapis.com/v${apiVersion}/customers/${managerId}/googleAds:searchStream`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'developer-token': process.env.NEXT_PUBLIC_GOOGLE_ADS_DEVELOPER_TOKEN,
          'login-customer-id': managerId
        },
        body: JSON.stringify({
          query: `
            SELECT 
              customer_client.client_customer, 
              customer_client.descriptive_name,
              customer_client.manager,
              customer_client.level,
              customer_client.status
            FROM customer_client
          `
        })
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to fetch customer hierarchy')
    }

    const data = await response.json()
    const customers = []

    // Process the results
    for (const streamResponse of data) {
      if (streamResponse.results) {
        for (const result of streamResponse.results) {
          const clientCustomerId = result.customerClient.clientCustomer.split('/')[1]
          if (result.customerClient.level !== "0") { // Exclude the manager itself
            customers.push({
              id: clientCustomerId,
              name: result.customerClient.descriptiveName || clientCustomerId,
              status: result.customerClient.status,
              level: result.customerClient.level,
              isManager: result.customerClient.manager || false,
            })
          }
        }
      }
    }

    return NextResponse.json({ customers })
  } catch (error) {
    console.error('Error fetching manager accounts:', error)
    return NextResponse.json(
      { message: error.message || 'Failed to fetch manager accounts' },
      { status: 500 }
    )
  }
}