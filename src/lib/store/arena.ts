import { create } from 'zustand';
import { ArenaFilter, Secondary, BetDraft } from '@/src/types/arena';

interface ArenaStore {
  primary: ArenaFilter;
  secondary: Set<Secondary>;
  search: string;
  setPrimary: (p: ArenaFilter) => void;
  toggleSecondary: (s: Secondary) => void;
  setSearch: (q: string) => void;

  betDraft: BetDraft;
  setBetDraft: (d: Partial<BetDraft>) => void;
  clearBetDraft: () => void;
}

export const useArenaStore = create<ArenaStore>((set) => ({
  primary: 'all',
  secondary: new Set(),
  search: '',
  
  setPrimary: (primary) => set({ primary }),
  
  toggleSecondary: (s) => set((state) => {
    const newSecondary = new Set(state.secondary);
    if (newSecondary.has(s)) {
      newSecondary.delete(s);
    } else {
      newSecondary.add(s);
    }
    return { secondary: newSecondary };
  }),
  
  setSearch: (search) => set({ search }),

  betDraft: {},
  setBetDraft: (d) => set((state) => ({
    betDraft: { ...state.betDraft, ...d }
  })),
  clearBetDraft: () => set({ betDraft: {} }),
}));