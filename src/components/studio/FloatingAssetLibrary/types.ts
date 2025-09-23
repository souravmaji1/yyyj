export type AssetWindowMode = 'expanded' | 'shrunk' | 'closed';
export type DockEdge = 'left' | 'right' | 'top' | 'bottom' | null;

export interface AssetWindowState {
  version: 1;
  mode: AssetWindowMode;
  x: number;
  y: number;
  w: number;
  h: number;
  dock: DockEdge;
  listScrollTop: number;
}

export interface WindowGeometry {
  x: number;
  y: number;
  width: number;
  height: number;
}

export const DEFAULT_WINDOW_STATE: Omit<AssetWindowState, 'h'> & { h?: number } = {
  version: 1,
  mode: 'expanded',
  x: 24,
  y: 100,
  w: 420,
  dock: null,
  listScrollTop: 0,
};

export const MIN_WINDOW_SIZE = { width: 340, height: 360 };
export const MAX_WINDOW_RATIO = { width: 0.9, height: 0.9 };
export const EDGE_SNAP_DISTANCE = 24;
export const VIEWPORT_PADDING = 8;
export const STORAGE_KEY = 'designer2.assetLibrary.windowState';