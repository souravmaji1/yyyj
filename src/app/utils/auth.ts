'use server'

import { cookies, headers } from 'next/headers'
import { redirect } from 'next/navigation'

export async function checkAuth() {
  // Get token directly without headers check
  const token = cookies().get('accessToken')?.value
  
  if (!token) {
    // Use a more direct redirect
    redirect('/auth?mode=login')
  }
  
  // Verify token format
  try {
    const tokenData = JSON.parse(decodeURIComponent(token));
    if (!tokenData) {
      redirect('/auth?mode=login')
    }
  } catch (error) {
    console.error('checkAuth - Failed to parse token:', error);
    // If token is malformed, redirect to login
    redirect('/auth?mode=login')
  }
  
  return token
}

export async function checkPublicRoute() {
  const headersList = await headers()
  const pathname = headersList.get('x-pathname') || ''
  const token = (await cookies()).get('accessToken')?.value
  
  // Only redirect if we're not already on the dashboard
  if (token && !pathname.startsWith('/')) {
    redirect('/')
  }
}

export async function getAuthToken() {
  const token = (await cookies()).get('accessToken')?.value;
  return token;
} 