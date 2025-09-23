import { create } from 'zustand';

interface WalletStore {
  balance: number;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  setBalance: (balance: number) => void;
  updateBalance: (delta: number) => void;
}

export const useWalletStore = create<WalletStore>((set) => ({
  balance: 0, // Start with zero balance
  isOpen: false,
  
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setBalance: (balance) => set({ balance }),
  updateBalance: (delta) => set((state) => ({ 
    balance: Math.max(0, state.balance + delta) 
  })),
}));