// No-op analytics tracking for telemetry
interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
}

class Analytics {
  track(event: string, properties?: Record<string, any>) {
    // No-op implementation for now
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.log('Analytics:', { event, properties });
    }
  }
}

export const analytics = new Analytics();

// Predefined event helpers
export const trackStudioEvent = {
  view: () => analytics.track('studio.view'),
  modeChange: (mode: string) => analytics.track('mode.change', { mode }),
  searchSubmit: (query: string) => analytics.track('search.submit', { query }),
  
  walletTopup: (amount: number) => analytics.track('wallet.topup', { amount }),
  walletCharge: (amount: number, action: string) => analytics.track('wallet.charge', { amount, action }),
  walletHistoryOpen: () => analytics.track('wallet.history.open'),
  
  actionRun: (label: string, cost: number) => analytics.track('action.run', { label, cost }),
  macroRun: (macroId: string, steps: number) => analytics.track('macro.run', { macroId, steps }),
  
  exportFile: (format: string, type: string) => analytics.track('export.file', { format, type }),
  productPublish: (productType: string) => analytics.track('product.publish', { productType }),
  nftMint: (tokenId?: string) => analytics.track('nft.mint', { tokenId }),
};