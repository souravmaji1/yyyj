import { 
  AssetWindowState, 
  DockEdge, 
  WindowGeometry, 
  DEFAULT_WINDOW_STATE,
  MIN_WINDOW_SIZE,
  MAX_WINDOW_RATIO,
  EDGE_SNAP_DISTANCE,
  VIEWPORT_PADDING,
  STORAGE_KEY
} from './types';

export function getDefaultWindowState(): AssetWindowState {
  const defaultHeight = typeof window !== 'undefined' 
    ? Math.floor(window.innerHeight * 0.7) 
    : 500;
  
  return {
    ...DEFAULT_WINDOW_STATE,
    h: defaultHeight,
  } as AssetWindowState;
}

export function loadWindowState(): AssetWindowState {
  if (typeof window === 'undefined') {
    return getDefaultWindowState();
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.version === 1) {
        // Validate and constrain the loaded state
        return constrainWindowToViewport({
          ...getDefaultWindowState(),
          ...parsed,
        });
      }
    }
  } catch (error) {
    console.warn('Failed to load asset library window state:', error);
  }

  return getDefaultWindowState();
}

export function saveWindowState(state: AssetWindowState): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save asset library window state:', error);
  }
}

export function constrainWindowToViewport(state: AssetWindowState): AssetWindowState {
  if (typeof window === 'undefined') return state;

  const viewport = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

  // Calculate max dimensions
  const maxWidth = viewport.width * MAX_WINDOW_RATIO.width;
  const maxHeight = viewport.height * MAX_WINDOW_RATIO.height;

  // Constrain dimensions
  const constrainedWidth = Math.max(
    MIN_WINDOW_SIZE.width,
    Math.min(maxWidth, state.w)
  );
  const constrainedHeight = Math.max(
    MIN_WINDOW_SIZE.height,
    Math.min(maxHeight, state.h)
  );

  // Constrain position
  const constrainedX = Math.max(
    VIEWPORT_PADDING,
    Math.min(viewport.width - constrainedWidth - VIEWPORT_PADDING, state.x)
  );
  const constrainedY = Math.max(
    VIEWPORT_PADDING,
    Math.min(viewport.height - constrainedHeight - VIEWPORT_PADDING, state.y)
  );

  return {
    ...state,
    x: constrainedX,
    y: constrainedY,
    w: constrainedWidth,
    h: constrainedHeight,
  };
}

export function calculateDockEdge(
  geometry: WindowGeometry,
  viewport: { width: number; height: number }
): DockEdge {
  const { x, y, width, height } = geometry;
  const { width: vw, height: vh } = viewport;

  // Check distance to each edge
  const leftDist = x;
  const rightDist = vw - (x + width);
  const topDist = y;
  const bottomDist = vh - (y + height);

  // Find the closest edge
  const minDist = Math.min(leftDist, rightDist, topDist, bottomDist);

  // Only snap if within snap distance
  if (minDist > EDGE_SNAP_DISTANCE) {
    return null;
  }

  // Return the closest edge
  if (minDist === leftDist) return 'left';
  if (minDist === rightDist) return 'right';
  if (minDist === topDist) return 'top';
  if (minDist === bottomDist) return 'bottom';

  return null;
}

export function constrainPosition(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: { width: number; height: number }
): { x: number; y: number } {
  const constrainedX = Math.max(
    VIEWPORT_PADDING,
    Math.min(viewport.width - width - VIEWPORT_PADDING, x)
  );
  const constrainedY = Math.max(
    VIEWPORT_PADDING,
    Math.min(viewport.height - height - VIEWPORT_PADDING, y)
  );

  return { x: constrainedX, y: constrainedY };
}

export function constrainSize(
  width: number,
  height: number,
  viewport: { width: number; height: number }
): { width: number; height: number } {
  const maxWidth = viewport.width * MAX_WINDOW_RATIO.width;
  const maxHeight = viewport.height * MAX_WINDOW_RATIO.height;

  const constrainedWidth = Math.max(
    MIN_WINDOW_SIZE.width,
    Math.min(maxWidth, width)
  );
  const constrainedHeight = Math.max(
    MIN_WINDOW_SIZE.height,
    Math.min(maxHeight, height)
  );

  return { width: constrainedWidth, height: constrainedHeight };
}