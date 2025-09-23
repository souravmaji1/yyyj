import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { Asset, DesignNode, DesignState, ViewMode } from '../types';
import { DUMMY_PRODUCTS } from '../data';

interface StudioStore extends DesignState {
  // UI State
  leftPanelCollapsed: boolean;
  rightPanelVisible: boolean;
  assetSource: 'image' | 'video';
  zoom: number;
  
  // Assets
  assets: Asset[];
  
  // Actions
  setView: (view: ViewMode) => void;
  setProduct: (productId: string, colorId?: string) => void;
  
  // Panel actions
  toggleLeftPanel: () => void;
  toggleRightPanel: () => void;
  setAssetSource: (source: 'image' | 'video') => void;
  
  // Canvas actions
  setZoom: (zoom: number) => void;
  
  // Design actions
  addNode: (node: Omit<DesignNode, 'id'>) => void;
  updateNode: (id: string, updates: Partial<DesignNode>) => void;
  deleteNode: (id: string) => void;
  selectNodes: (ids: string[]) => void;
  clearSelection: () => void;
  
  // History actions
  undo: () => void;
  redo: () => void;
  
  // Asset actions
  addAsset: (asset: Omit<Asset, 'id'>) => void;
  removeAsset: (id: string) => void;
}

const defaultProduct = DUMMY_PRODUCTS[0] || {
  id: 'default',
  name: 'Default Product',
  mockups: { front: '', back: '' },
  printAreas: [],
  colors: [{ id: 'default', name: 'Default', hex: '#FFFFFF' }],
  msrpUSD: 0
};

export const useStudioStore = create<StudioStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    view: 'front',
    nodes: [],
    selectedIds: [],
    history: { past: [], future: [] },
    productId: defaultProduct?.id || '',
    garmentColorId: defaultProduct?.colors?.[0]?.id || '',
    
    // UI State
    leftPanelCollapsed: false,
    rightPanelVisible: true,
    assetSource: 'image',
    zoom: 1,
    
    // Assets
    assets: [],
    
    // Actions
    setView: (view) => set({ view }),
    
    setProduct: (productId, colorId) => {
      const product = DUMMY_PRODUCTS.find(p => p.id === productId);
      if (product) {
        set({ 
          productId, 
          garmentColorId: colorId || product.colors[0]?.id 
        });
      }
    },
    
    // Panel actions
    toggleLeftPanel: () => set(state => ({ 
      leftPanelCollapsed: !state.leftPanelCollapsed 
    })),
    
    toggleRightPanel: () => set(state => ({ 
      rightPanelVisible: !state.rightPanelVisible 
    })),
    
    setAssetSource: (source) => set({ assetSource: source }),
    
    // Canvas actions
    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(5, zoom)) }),
    
    // Design actions
    addNode: (nodeData) => {
      const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const node: DesignNode = { id, ...nodeData };
      
      set(state => {
        const newNodes = [...state.nodes, node];
        return {
          nodes: newNodes,
          selectedIds: [id],
          history: {
            past: [...state.history.past, state.nodes],
            future: []
          }
        };
      });
    },
    
    updateNode: (id, updates) => set(state => {
      const nodeIndex = state.nodes.findIndex(n => n.id === id);
      if (nodeIndex === -1) return state;
      
      const newNodes = [...state.nodes];
      newNodes[nodeIndex] = { ...newNodes[nodeIndex], ...updates } as DesignNode;
      
      return {
        nodes: newNodes,
        history: {
          past: [...state.history.past, state.nodes],
          future: []
        }
      };
    }),
    
    deleteNode: (id) => set(state => ({
      nodes: state.nodes.filter(n => n.id !== id),
      selectedIds: state.selectedIds.filter(sid => sid !== id),
      history: {
        past: [...state.history.past, state.nodes],
        future: []
      }
    })),
    
    selectNodes: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    
    // History actions
    undo: () => set(state => {
      if (state.history.past.length === 0) return state;
      
      const previous = state.history.past[state.history.past.length - 1];
      const newPast = state.history.past.slice(0, -1);
      
      return {
        nodes: previous,
        selectedIds: [],
        history: {
          past: newPast,
          future: [state.nodes, ...state.history.future]
        }
      };
    }),
    
    redo: () => set(state => {
      if (state.history.future.length === 0) return state;
      
      const next = state.history.future[0];
      const newFuture = state.history.future.slice(1);
      
      return {
        nodes: next,
        selectedIds: [],
        history: {
          past: [...state.history.past, state.nodes],
          future: newFuture
        }
      };
    }),
    
    // Asset actions
    addAsset: (assetData) => {
      const id = `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const asset: Asset = { id, ...assetData };
      
      set(state => ({
        assets: [...state.assets, asset]
      }));
    },
    
    removeAsset: (id) => set(state => ({
      assets: state.assets.filter(a => a.id !== id)
    })),
  }))
);