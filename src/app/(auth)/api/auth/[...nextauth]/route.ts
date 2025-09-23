import NextAuth from "next-auth";
import { authOptions } from "./auth.config";

// ✅ ADD: Debug environment variables on server side
console.log('[NEXTAUTH_ROUTE] Environment variables check:', {
  hasAppleClientId: !!process.env.APPLE_CLIENT_ID,
  hasAppleClientSecret: !!process.env.APPLE_CLIENT_SECRET,
  hasNextAuthSecret: !!process.env.NEXT_AUTH_SECRET,
  hasNextAuthUrl: !!process.env.NEXTAUTH_URL,
  appleClientId: process.env.APPLE_CLIENT_ID ? `${process.env.APPLE_CLIENT_ID.substring(0, 10)}...` : 'NOT SET',
  nextAuthSecret: process.env.NEXT_AUTH_SECRET ? `${process.env.NEXT_AUTH_SECRET.substring(0, 10)}...` : 'NOT SET'
});

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
