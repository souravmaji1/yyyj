import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { StudioState, StudioMode } from '@/src/types/studio';
import { trackStudioEvent } from '@/src/lib/studio/analytics';

interface StudioStore extends StudioState {
  // Additional UI state
  isExportDialogOpen: boolean;
  isMintDialogOpen: boolean;
  
  // Actions
  setMode: (mode: StudioMode) => void;
  setProjectId: (projectId?: string) => void;
  setSelection: (ids: string[]) => void;
  setRightTab: (tab: 'Assistant' | 'Properties' | 'Marketplace') => void;
  setSearchQuery: (query: string) => void;
  
  // UI Actions
  openExportDialog: () => void;
  closeExportDialog: () => void;
  openMintDialog: () => void;
  closeMintDialog: () => void;
}

export const useStudioStore = create<StudioStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    mode: 'image',
    projectId: undefined,
    selection: [],
    rightTab: 'Assistant',
    searchQuery: '',
    
    // UI state
    isExportDialogOpen: false,
    isMintDialogOpen: false,
    
    // Actions
    setMode: (mode: StudioMode) => {
      set({ mode });
      trackStudioEvent.modeChange(mode);
    },
    
    setProjectId: (projectId?: string) => set({ projectId }),
    
    setSelection: (ids: string[]) => set({ selection: ids }),
    
    setRightTab: (tab: 'Assistant' | 'Properties' | 'Marketplace') => set({ rightTab: tab }),
    
    setSearchQuery: (query: string) => {
      set({ searchQuery: query });
      if (query.trim()) {
        trackStudioEvent.searchSubmit(query);
      }
    },
    
    // UI Actions
    openExportDialog: () => set({ isExportDialogOpen: true }),
    closeExportDialog: () => set({ isExportDialogOpen: false }),
    
    openMintDialog: () => set({ isMintDialogOpen: true }),
    closeMintDialog: () => set({ isMintDialogOpen: false }),
  }))
);