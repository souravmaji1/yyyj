import { NextResponse } from 'next/server';

export async function GET() {
  // ⚠️ IMPORTANT: Replace this with your actual Apple Pay verification file
  // 
  // To get this file:
  // 1. Go to Stripe Dashboard → Settings → Payments → Payment method domains
  // 2. Click on your domain
  // 3. Download the apple-developer-merchantid-domain-association file
  // 4. Replace the content below with the actual file content
  //
  // For now, this is a placeholder that will show the option but may not work
  const verificationContent = `# Apple Pay Domain Verification File
# 
# This file must be accessible at:
# https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
#
# Current placeholder content - REPLACE WITH ACTUAL FILE FROM STRIPE
#
# The actual file will contain your merchant ID and domain verification
# This is required for Apple Pay to work in production
#
# Contact your Stripe account manager or check the Stripe dashboard
# for the correct verification file content`;

  return new NextResponse(verificationContent, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600',
    },
  });
} 