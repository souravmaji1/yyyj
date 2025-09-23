import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WalletState } from '@/src/types/studio';
import { trackStudioEvent } from '@/src/lib/studio/analytics';

interface StudioWalletStore extends WalletState {
  isHistoryOpen: boolean;
}

export const useStudioWalletStore = create<StudioWalletStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial wallet state
    balance: 103656, // Starting XUT balance
    history: [
      {
        id: 'hist_1',
        ts: new Date(Date.now() - 3600000).toISOString(),
        action: 'Generated Image',
        delta: -40
      },
      {
        id: 'hist_2', 
        ts: new Date(Date.now() - 7200000).toISOString(),
        action: 'Rendered Video',
        delta: -120
      },
      {
        id: 'hist_3',
        ts: new Date(Date.now() - 86400000).toISOString(),
        action: 'Token Top-up',
        delta: 5000
      }
    ],
    weeklyCredits: { used: 1250, cap: 5000 },
    isHistoryOpen: false,

    // Actions
    charge: (amount: number, action: string) => {
      const state = get();
      if (state.balance >= amount) {
        const newBalance = state.balance - amount;
        const historyEntry = {
          id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          ts: new Date().toISOString(),
          action,
          delta: -amount
        };

        set({
          balance: newBalance,
          history: [historyEntry, ...state.history],
          weeklyCredits: state.weeklyCredits ? {
            ...state.weeklyCredits,
            used: state.weeklyCredits.used + amount
          } : undefined
        });

        trackStudioEvent.walletCharge(amount, action);
        
        // Show success toast (will be handled by toast system)
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studio-toast', {
            detail: {
              type: 'success',
              title: `✨ ${action}`,
              description: `${amount} XUT deducted. New balance: ${newBalance.toLocaleString()} XUT`
            }
          }));
        }

        return true;
      } else {
        // Show insufficient funds toast
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('studio-toast', {
            detail: {
              type: 'error',
              title: 'Insufficient Funds',
              description: `Need ${amount} XUT but only have ${state.balance} XUT available`
            }
          }));
        }
        return false;
      }
    },

    topUp: (amount: number) => {
      const state = get();
      const newBalance = state.balance + amount;
      const historyEntry = {
        id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        ts: new Date().toISOString(),
        action: 'Token Top-up',
        delta: amount
      };

      set({
        balance: newBalance,
        history: [historyEntry, ...state.history]
      });

      trackStudioEvent.walletTopup(amount);

      // Show success toast
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('studio-toast', {
          detail: {
            type: 'success',
            title: '💠 Tokens Added',
            description: `Added ${amount.toLocaleString()} XUT. New balance: ${newBalance.toLocaleString()} XUT`
          }
        }));
      }
    },

    openHistory: () => {
      set({ isHistoryOpen: true });
      trackStudioEvent.walletHistoryOpen();
    },

    closeHistory: () => set({ isHistoryOpen: false }),
  }))
);