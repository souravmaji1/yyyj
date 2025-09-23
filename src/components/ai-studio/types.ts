export type ViewMode = 'front' | 'back' | 'spin';
export type AssetType = 'image' | 'video_qr';

export interface Asset {
  id: string;
  type: AssetType;
  name: string;
  thumbUrl: string;
  srcUrl: string;        // image URL or video URL for QR
  meta?: Record<string, any>;
}

export interface DesignNode {
  id: string;
  kind: 'image' | 'qr' | 'text';
  assetId?: string;
  x: number; 
  y: number; 
  width: number; 
  height: number; 
  rotation: number;
  opacity?: number; 
  locked?: boolean; 
  hidden?: boolean;
  props?: Record<string, any>; // e.g., QR color, ECC level
}

export interface PrintArea {
  view: 'front' | 'back';
  xPct: number; 
  yPct: number; 
  widthPct: number; 
  heightPct: number; // percent of mockup image
}

export interface Product {
  id: string;
  name: string;
  mockups: { 
    front: string; 
    back: string; 
    spin?: string[] 
  };
  printAreas: PrintArea[]; // one for front, one for back
  colors: { 
    id: string; 
    name: string; 
    hex: string 
  }[];
  msrpUSD?: number;
}

export interface DesignState {
  view: ViewMode;
  nodes: DesignNode[];
  selectedIds: string[];
  history: { 
    past: DesignNode[][]; 
    future: DesignNode[][] 
  };
  productId: string;
  garmentColorId?: string;
}