// Formatting utilities for Arena

export function formatXUT(amount: number): string {
  if (amount >= 1000000) {
    return `${(amount / 1000000).toFixed(1)}M XUT`;
  }
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(1)}K XUT`;
  }
  return `${amount.toLocaleString()} XUT`;
}

export function pluralizePlayers(count: number): string {
  return count.toString();
}

// External game utilities
export function getExternalGameUrl(baseUrl: string, oauthToken?: string, autoFullscreen: boolean = true): string {
  const url = new URL(baseUrl);
  
  // Add OAuth token as query parameter if provided
  if (oauthToken) {
    url.searchParams.set('token', oauthToken);
  }
  
  // Add fullscreen parameter to trigger automatic fullscreen in the game
  if (autoFullscreen) {
    url.searchParams.set('fullscreen', 'auto');
    url.searchParams.set('autoplay', 'true');
  }
  
  return url.toString();
}

export function launchExternalGame(url: string, requiresOAuth: boolean = false) {
  if (requiresOAuth) {
    // For OAuth games, we'll need to get the token first
    // This will be handled in the component
    return null;
  }
  
  // For non-OAuth games, open in new tab
  window.open(url, '_blank', 'noopener,noreferrer');
  return undefined;
}