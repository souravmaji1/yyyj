import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import AppleProvider from "next-auth/providers/apple";
import type { NextAuthOptions } from "next-auth";
import { getFcmToken } from "@/src/core/utils/getFcmToken";

// ✅ SIMPLIFY: Remove debugging for production

// Custom typings
declare module "next-auth" {
  interface Session {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    provider?: string;
    user?: any;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    provider?: string;
    user?: any;
    error?: string;
  }
}

export const authOptions: NextAuthOptions = {
  // ✅ ADD: Global PKCE configuration override
  useSecureCookies: process.env.NODE_ENV === 'production',
  
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: "openid email profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile",
        },
      },
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
      httpOptions: {
        timeout: 10000,
      },
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID!,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    }),
    AppleProvider({
      clientId: process.env.APPLE_CLIENT_ID!,
      clientSecret: process.env.APPLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "name email",
          response_mode: "form_post", // ✅ REVERT: Apple OAuth works better with form_post
          response_type: "code id_token",
          // ✅ EXPLICITLY DISABLE: PKCE to prevent cookie issues
          code_challenge: undefined,
          code_challenge_method: undefined,
        },
      },
      checks: [], // ✅ EXPLICITLY DISABLE: PKCE checks to prevent cookie issues
      profile(profile) {
        // ✅ SIMPLIFY: Make Apple profile as simple as Google
        console.log('[APPLE_PROVIDER] 🍎 Apple profile received:', {
          hasSub: !!profile.sub,
          hasName: !!profile.name,
          hasEmail: !!profile.email,
          profileKeys: Object.keys(profile)
        });
        
        const userProfile = {
          id: profile.sub,
          name: profile.name || 'Apple User',
          email: profile.email,
          image: null, // Apple doesn't provide profile pictures
        };
        
        console.log('[APPLE_PROVIDER] 🍎 Processed Apple profile:', {
          id: userProfile.id,
          name: userProfile.name,
          email: userProfile.email,
          hasImage: !!userProfile.image
        });
        
        return userProfile;
      },
      httpOptions: {
        timeout: 15000, // ✅ INCREASE: Apple needs more time
      },
    }),
  ],
  secret: process.env.NEXT_AUTH_SECRET,
  
  // ✅ ADD: Debug environment variables
  debug: true,
  
  // ✅ REMOVE: Custom cookie configuration that's interfering with PKCE
  // Let NextAuth handle cookies automatically
  
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // ✅ ADD: Debug signIn callback for Apple
      if (account?.provider === 'apple') {
        console.log('[SIGNIN_CALLBACK] 🍎 Apple signIn callback triggered:', {
          hasUser: !!user,
          hasAccount: !!account,
          hasProfile: !!profile,
          provider: account.provider,
          userKeys: user ? Object.keys(user) : [],
          accountKeys: account ? Object.keys(account) : [],
          profileKeys: profile ? Object.keys(profile) : []
        });
      }
      
      return true;
    },
    // ✅ ADD: Custom OAuth callback to handle PKCE issues
    async redirect({ url, baseUrl }) {
      console.log('[REDIRECT_CALLBACK] OAuth redirect:', { url, baseUrl });
      return url.startsWith(baseUrl) ? url : baseUrl;
    },
    async jwt({ token, account, user, profile, trigger }) {
      // ✅ ADD: Debug JWT callback entry for Apple
      if (account?.provider === 'apple') {
        console.log('[JWT_CALLBACK] 🍎 Apple JWT callback triggered:', {
          hasToken: !!token,
          hasAccount: !!account,
          hasUser: !!user,
          hasProfile: !!profile,
          trigger,
          tokenKeys: token ? Object.keys(token) : [],
          accountKeys: account ? Object.keys(account) : []
        });
      }
      
      // If this is the initial sign in, we want to update the token
      if (account && user) {
        const loginType = account.provider;
        
        // ✅ FIX: Use correct token type for each provider
        let providerToken;
        let tokenType;
        
        if (loginType === 'google') {
          // Google needs access_token to call their user info API
          providerToken = account.access_token;
          tokenType = 'access_token';
        } else if (loginType === 'apple') {
          // Apple works with id_token
          providerToken = account.id_token;
          tokenType = 'id_token';
        } else {
          // Facebook and others - use id_token as fallback
          providerToken = account.id_token;
          tokenType = 'id_token';
        }
        
        if (!providerToken) {
          console.error("No provider token available for", loginType);
          token.error = "No authentication token available";
          return token;
        }

        const fcmToken = await getFcmToken();

                  try {          
            // ✅ FIX: Use hardcoded URL since environment variables don't work server-side in NextAuth
            const apiUrl = 'https://api.intelli-verse-x.ai/api/user/auth/social-login';
            
            // ✅ SIMPLIFY: Remove debugging for production
            
            const requestBody = {
              token: providerToken, // Now sending correct token type for each provider
              loginType,
              provider: loginType,
              email: user.email,
              name: user.name,
              picture: user.image,
              tokenType: tokenType, // ✅ FIX: Correct token type for each provider
              fcmToken: fcmToken || null,
            };
            
            // ✅ ADD: Strategic debugging for Apple login (production monitoring)
            if (loginType === 'apple') {
              console.log('[APPLE_AUTH] 🍎 Apple authentication flow:', {
                hasToken: !!requestBody.token,
                tokenLength: requestBody.token?.length || 0,
                hasEmail: !!requestBody.email,
                email: requestBody.email,
                hasName: !!requestBody.name,
                name: requestBody.name,
                hasPicture: !!requestBody.picture,
                tokenType: requestBody.tokenType
              });
            }
            
            // ✅ ADD: Google-specific debugging
            if (loginType === 'google') {
              console.log('[GOOGLE_AUTH] 🔍 Google authentication flow:', {
                hasToken: !!requestBody.token,
                tokenLength: requestBody.token?.length || 0,
                hasEmail: !!requestBody.email,
                email: requestBody.email,
                hasName: !!requestBody.name,
                name: requestBody.name,
                hasPicture: !!requestBody.picture,
                tokenType: requestBody.tokenType,
                note: 'Google now uses access_token instead of id_token'
              });
            }
            
            // ✅ ADD: Comprehensive debugging for all providers
            console.log('[JWT_CALLBACK] Making API call to backend:', {
              loginType,
              apiUrl,
              hasToken: !!requestBody.token,
              tokenLength: requestBody.token?.length || 0,
              hasEmail: !!requestBody.email,
              hasName: !!requestBody.name
            });
            
            // ✅ ADD: Debug token assignment
            console.log(`[JWT_CALLBACK] Before token assignment for ${loginType}:`, {
              hasToken: !!token,
              tokenKeys: token ? Object.keys(token) : [],
              hasAccessToken: !!token?.accessToken,
              hasIdToken: !!token?.idToken
            });
          
          // Google-specific logging
          if (loginType === 'google') {
            console.log('[GOOGLE_LOGIN] Google login request:', {
              hasEmail: !!user.email,
              hasName: !!user.name,
              hasPicture: !!user.image,
              tokenType: requestBody.tokenType,
              hasAccessToken: !!account.access_token,
              hasIdToken: !!account.id_token
            });
          }
          
          // ✅ SIMPLIFY: Remove debugging for production
          
            // ✅ SIMPLIFY: Remove debugging for production
            
            const res = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Accept": "*/*",
              },
              body: JSON.stringify(requestBody),
            });

            // ✅ ADD: Strategic debugging for Apple API response (production monitoring)
            if (loginType === 'apple') {
              console.log('[APPLE_API] 🍎 Apple API response received:', {
                status: res.status,
                statusText: res.statusText,
                ok: res.ok,
                hasResponse: !!res
              });
            }

            // ✅ SIMPLIFY: Remove debugging for production
            
            if (!res.ok) {
              const errorText = await res.text();
              const errorMessage = `Social login failed: ${res.statusText} (${res.status})`;
              
              // Google-specific error logging
              if (loginType === 'google') {
                console.error('[GOOGLE_LOGIN] Google login failed:', {
                  status: res.status,
                  statusText: res.statusText,
                  errorText,
                  requestBody: { ...requestBody, token: '***' }
                });
              }
              
              // ✅ ADD: Apple-specific error logging
              if (loginType === 'apple') {
                console.error('[APPLE_LOGIN] Apple login failed:', {
                  status: res.status,
                  statusText: res.statusText,
                  errorText,
                  requestBody: { ...requestBody, token: '***' },
                  apiUrl,
                  hasToken: !!requestBody.token
                });
              }
              
              throw new Error(errorMessage);
            }

                      // ✅ ADD: Apple-specific response parsing debugging
            if (loginType === 'apple') {
              console.log('[APPLE_LOGIN] Parsing API response...');
            }
            
            const data = await res.json();
            
            // ✅ ADD: Apple-specific response data debugging
            if (loginType === 'apple') {
              console.log('[APPLE_LOGIN] Parsed response data:', {
                hasData: !!data,
                hasDataData: !!data?.data,
                dataKeys: data ? Object.keys(data) : [],
                dataDataKeys: data?.data ? Object.keys(data.data) : []
              });
            }

            if (!data?.data) {
              const errorMessage = "Invalid response format from social login";
              
              // Google-specific error logging
              if (loginType === 'google') {
                console.error('[GOOGLE_LOGIN] Invalid response format:', data);
              }
              
              // ✅ ADD: Apple-specific invalid response logging
              if (loginType === 'apple') {
                console.error('[APPLE_LOGIN] Invalid response format:', {
                  data,
                  hasData: !!data,
                  hasDataData: !!data?.data,
                  responseText: await res.text()
                });
              }
              
              throw new Error(errorMessage);
            }

          // Google-specific success logging
          if (loginType === 'google') {
            console.log('[GOOGLE_LOGIN] Google login successful:', {
              hasAccessToken: !!data.data.accessToken,
              hasIdToken: !!data.data.idToken,
              hasRefreshToken: !!data.data.refreshToken,
              hasUser: !!data.data.user
            });
          }

          // Log the tokens being set
          console.log(`[JWT_CALLBACK] Setting tokens for ${loginType}:`, {
            hasAccessToken: !!data.data.accessToken,
            hasIdToken: !!data.data.idToken,
            hasRefreshToken: !!data.data.refreshToken,
            hasUser: !!data.data.user,
            accessTokenLength: data.data.accessToken?.length || 0,
            idTokenLength: data.data.idToken?.length || 0,
            refreshTokenLength: data.data.refreshToken?.length || 0,
            accessTokenPrefix: data.data.accessToken?.substring(0, 20) + '...',
            idTokenPrefix: data.data.idToken?.substring(0, 20) + '...',
            refreshTokenPrefix: data.data.refreshToken?.substring(0, 20) + '...'
          });
          
          // ✅ ADD: Debug token assignment
          console.log(`[JWT_CALLBACK] Before token assignment for ${loginType}:`, {
            hasToken: !!token,
            tokenKeys: token ? Object.keys(token) : [],
            hasAccessToken: !!token?.accessToken,
            hasIdToken: !!token?.idToken
          });
          
          token.accessToken = data.data.accessToken;
          token.refreshToken = data.data.refreshToken;
          token.idToken = data.data.idToken;
          token.user = data.data.user;
          token.provider = loginType;
          token.error = undefined;
          
          // ✅ ADD: Debug token assignment result
          console.log(`[JWT_CALLBACK] After token assignment for ${loginType}:`, {
            hasAccessToken: !!token.accessToken,
            hasIdToken: !!token.idToken,
            hasRefreshToken: !!token.refreshToken,
            hasUser: !!token.user,
            provider: token.provider,
            hasError: !!token.error
          });
          
          // ✅ ADD: Debug token assignment result
          console.log(`[JWT_CALLBACK] After token assignment for ${loginType}:`, {
            hasAccessToken: !!token.accessToken,
            hasIdToken: !!token.idToken,
            hasRefreshToken: !!token.refreshToken,
            hasUser: !!token.user,
            provider: token.provider,
            hasError: !!token.error
          });
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Social login failed";
          
          // Google-specific error logging
          if (loginType === 'google') {
            console.error('[GOOGLE_LOGIN] Google login error:', {
              error: err,
              message: errorMessage,
              user: { email: user.email, name: user.name }
            });
          }
          
          // ✅ ADD: Apple-specific error logging
          if (loginType === 'apple') {
            console.error('[APPLE_LOGIN] Apple login error:', {
              error: err,
              message: errorMessage,
              user: { email: user.email, name: user.name },
              loginType,
              hasProviderToken: !!providerToken,
              providerTokenType: providerToken ? typeof providerToken : 'undefined',
              stack: err instanceof Error ? err.stack : undefined
            });
          }
          
          token.error = errorMessage;
        }
      } else {
        console.log('No account or user object in JWT callback');
      }

      // ✅ ADD: Debug final token return
      console.log(`[JWT_CALLBACK] Final token return:`, {
        hasToken: !!token,
        hasAccessToken: !!token?.accessToken,
        hasIdToken: !!token?.idToken,
        hasRefreshToken: !!token?.refreshToken,
        hasUser: !!token?.user,
        hasError: !!token?.error,
        provider: token?.provider,
        tokenKeys: token ? Object.keys(token) : []
      });
      
      // ✅ ADD: Strategic debugging for Apple login (production monitoring)
      if (token?.provider === 'apple') {
        console.log('[APPLE_JWT] 🍎 Apple JWT callback completed:', {
          hasAccessToken: !!token?.accessToken,
          hasIdToken: !!token?.idToken,
          hasUser: !!token?.user,
          hasError: !!token?.error
        });
      }

      return token;
    },
    async session({ session, token }) {
      console.log(`[SESSION_CALLBACK] Processing session:`, {
        hasToken: !!token,
        hasAccessToken: !!token?.accessToken,
        hasIdToken: !!token?.idToken,
        hasRefreshToken: !!token?.refreshToken,
        hasUser: !!token?.user,
        hasError: !!token?.error,
        provider: token?.provider
      });

      if (token) {
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
        session.idToken = token.idToken;
        session.provider = token.provider;
        session.user = token.user;
        session.error = token.error;
        
        console.log(`[SESSION_CALLBACK] Session created:`, {
          hasAccessToken: !!session.accessToken,
          hasIdToken: !!session.idToken,
          hasRefreshToken: !!session.refreshToken,
          hasUser: !!session.user,
          hasError: !!session.error,
          accessTokenLength: session.accessToken?.length || 0,
          accessTokenPrefix: session.accessToken?.substring(0, 20) + '...'
        });
        
        // Google-specific session error handling
        if (token.provider === 'google' && token.error) {
          console.error('[GOOGLE_SESSION] Google session error:', {
            error: token.error,
            hasUser: !!token.user,
            hasTokens: !!(token.accessToken || token.idToken)
          });
          
          // Provide user-friendly error message for Google
          if (token.error.includes('No provider token available')) {
            session.error = 'Google Sign In failed - please try again';
          } else if (token.error.includes('Invalid response format')) {
            session.error = 'Google Sign In response error - please try again';
          } else {
            session.error = `Google Sign In failed: ${token.error}`;
          }
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth?mode=login",
    error: "/auth?mode=login",
  },
};