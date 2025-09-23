import { useState, useEffect } from 'react';
import { getClientCookie, getRawCookie } from '@/src/core/config/localStorage';

export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>(undefined);

  useEffect(() => {
    const checkAuthState = () => {
      try {
        const rawCookie = getRawCookie('accessToken');
        const accessToken = getClientCookie('accessToken');
        
        console.log('useAuthState - Raw cookie value:', rawCookie);
        console.log('useAuthState - Parsed cookie value:', accessToken);
        
        setToken(accessToken);
        
        if (accessToken) {
          // Handle both string and object tokens
          let tokenData;
          if (typeof accessToken === 'string') {
            // Try to parse if it's a JSON string
            if (accessToken.startsWith('"') || accessToken.startsWith('{') || accessToken.startsWith('[')) {
              tokenData = JSON.parse(accessToken);
            } else {
              // If it's a plain string token, use it directly
              tokenData = accessToken;
            }
          } else {
            // If it's already an object, use it directly
            tokenData = accessToken;
          }
          
          console.log('useAuthState - Final token data:', tokenData);
          
          if (tokenData) {
            setIsAuthenticated(true);
            console.log('useAuthState - Setting authenticated to true');
          } else {
            setIsAuthenticated(false);
            console.log('useAuthState - Setting authenticated to false (no token data)');
          }
        } else {
          setIsAuthenticated(false);
          console.log('useAuthState - No access token found');
        }
      } catch (error) {
        console.error('useAuthState - Error checking auth state:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthState();
  }, []);

  const refreshAuthState = () => {
    setIsLoading(true);
    const accessToken = getClientCookie('accessToken');
    setToken(accessToken);
    
    if (accessToken) {
      try {
        let tokenData;
        if (typeof accessToken === 'string') {
          if (accessToken.startsWith('"') || accessToken.startsWith('{') || accessToken.startsWith('[')) {
            tokenData = JSON.parse(accessToken);
          } else {
            tokenData = accessToken;
          }
        } else {
          tokenData = accessToken;
        }
        
        setIsAuthenticated(!!tokenData);
      } catch (error) {
        if (accessToken && typeof accessToken === 'string' && accessToken.length > 10) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      }
    } else {
      setIsAuthenticated(false);
    }
    setIsLoading(false);
  };

  return {
    isAuthenticated,
    isLoading,
    token,
    refreshAuthState
  };
} 