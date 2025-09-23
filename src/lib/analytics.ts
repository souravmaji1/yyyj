type AnalyticsEvent = 
  | 'arena.view'
  | 'arena.filter_change'
  | 'arena.search'
  | 'bet.open'
  | 'bet.confirm'
  | 'bet.success'
  | 'bet.fail'
  | 'tournament.join'
  | 'game.start'
  | 'wallet.add_tokens';

interface AnalyticsProperties {
  [key: string]: string | number | boolean | undefined;
}

class Analytics {
  track(event: AnalyticsEvent, properties?: AnalyticsProperties) {
    // In production, this would send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log(`📊 Analytics: ${event}`, properties);
    }
    
    // Example: Send to analytics service
    // analytics.track(event, properties);
  }
}

export const analytics = new Analytics();

// Helper functions for common events
export const trackArenaView = () => analytics.track('arena.view');

export const trackFilterChange = (filter: string, value: string | boolean) => 
  analytics.track('arena.filter_change', { filter, value });

export const trackSearch = (query: string) => 
  analytics.track('arena.search', { query });

export const trackBetOpen = (marketId: string) => 
  analytics.track('bet.open', { marketId });

export const trackBetConfirm = (marketId: string, side: string, amount: number) => 
  analytics.track('bet.confirm', { marketId, side, amount });

export const trackBetSuccess = (marketId: string, txId: string) => 
  analytics.track('bet.success', { marketId, txId });

export const trackBetFail = (marketId: string, error: string) => 
  analytics.track('bet.fail', { marketId, error });

export const trackTournamentJoin = (tournamentId: string) => 
  analytics.track('tournament.join', { tournamentId });

export const trackGameStart = (gameId: string) => 
  analytics.track('game.start', { gameId });

export const trackWalletAddTokens = (amount: number) => 
  analytics.track('wallet.add_tokens', { amount });