// Local Storage functions (client-side only)

export const getLocalData = <T = any>(key: string): T | null => {
  if (typeof window !== "undefined") {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting ${key} from localStorage:`, error);
      return null;
    }
  }
  return null;
};

export const setLocalData = (key: string, payload: any): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (error) {
      console.error(`Error setting ${key} in localStorage:`, error);
    }
  }
};

export const removeLocalItem = (key: string): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing ${key} from localStorage:`, error);
    }
  }
};

export const clearLocals = (): void => {
  if (typeof window !== "undefined") {
    try {
      localStorage.clear();
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  }
};

// Client-side Cookie functions

export const getRawCookie = (name: string): string | undefined => {
  if (typeof document !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()!.split(";").shift()!;
    }
  }
  return undefined;
};

export const getClientCookie = <T = any>(name: string): T | undefined => {
  if (typeof document !== "undefined") {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      try {
        const rawValue = parts.pop()!.split(";").shift()!;
        const decodedValue = decodeURIComponent(rawValue);
        
        // Try to parse as JSON first
        try {
          return JSON.parse(decodedValue);
        } catch (jsonError) {
          // If JSON parsing fails, return the decoded string value
          console.log(`getClientCookie - JSON parse failed for ${name}, returning raw value:`, decodedValue);
          return decodedValue as T;
        }
      } catch (error) {
        console.error(`Error getting cookie "${name}":`, error);
        return undefined;
      }
    }
  }
  return undefined;
};

interface CookieOptions {
  days?: number;
  maxAge?: number; // Add maxAge in seconds
  path?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  [key: string]: any;
}

export const setClientCookie = (
  name: string,
  value: any,
  options: CookieOptions = {}
): void => {
  if (typeof document !== "undefined") {
    const { days, maxAge, path = "/", secure, sameSite, ...rest } = options;
    
    let expires = '';
    if (maxAge) {
      // If maxAge is provided in seconds, use it directly
      const date = new Date();
      date.setTime(date.getTime() + maxAge * 1000);
      expires = `expires=${date.toUTCString()}`;
    } else if (days) {
      // Fallback to days if maxAge is not provided
      const date = new Date();
      date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
      expires = `expires=${date.toUTCString()}`;
    }
    
    const cookieValue = encodeURIComponent(JSON.stringify(value));
    let cookieString = `${name}=${cookieValue}; ${expires}; path=${path}`;
    
    // Add secure flag if specified
    if (secure) {
      cookieString += '; secure';
    }
    
    // Add sameSite if specified
    if (sameSite) {
      cookieString += `; samesite=${sameSite}`;
    }
    
    // Add any other options
    cookieString = Object.entries(rest).reduce(
      (acc, [key, val]) => `${acc}; ${key}=${val}`,
      cookieString
    );
    
    document.cookie = cookieString;
  }
};

export const removeClientCookie = (name: string, path: string = "/"): void => {
  if (typeof document !== "undefined") {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
  }
};

// Universal storage functions

export const getData = <T = any>(key: string): T | null | undefined => {
  return getLocalData<T>(key) || getClientCookie<T>(key);
};

export const setData = (
  key: string,
  value: any,
  options: CookieOptions = {}
): void => {
  setLocalData(key, value);
  setClientCookie(key, value, options);
};

export const removeData = (key: string): void => {
  removeLocalItem(key);
  removeClientCookie(key);
};

export const clearAllData = (): void => {
  clearLocals();
  // Clear all cookies
  if (typeof document !== "undefined") {
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
    });
  }
};
