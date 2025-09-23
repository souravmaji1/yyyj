// Data Contracts for AI Studio Designer 2

export type StudioMode = 'image' | 'video' | 'threeD' | 'music' | 'audio' | 'product' | 'nft';
export type Status = 'idle' | 'running' | 'done' | 'error';

export interface Project {
  id: string;
  title: string;
  modesUsed: StudioMode[];
  assets: AssetRef[];
  createdAt: string;
}

export type AssetType = 'image' | 'video' | 'threeD' | 'music' | 'audio' | 'font' | 'palette' | 'qr';

export interface AssetRef {
  id: string;
  type: AssetType;
  url: string;
  meta?: Record<string, any>;
}

export interface Wallet {
  balance: number;        // XUT
  history: Array<{ id: string; ts: string; action: string; delta: number }>;
  weeklyCredits?: { used: number; cap: number };
}

export interface MacroStep { 
  id: string; 
  label: string; 
  status: Status; 
}

export interface Macro { 
  id: string; 
  title: string; 
  steps: MacroStep[]; 
  estCost: number; 
}

export interface CostMap {
  image: { generate: number; upscale: number; bgRemove: number };
  video: { storyboard: number; render: number; captions: number };
  threeD: { generate: number; materials: number; turntable: number };
  music: { generate: number; master: number; stems: number };
  audio: { tts: number; cleanup: number; qr: number };
  product: { mockups: number; printExport: number; publish: number };
  nft: { mint: number; list: number; qr: number };
}

// State interfaces
export interface StudioState {
  mode: StudioMode;
  projectId?: string;
  selection: string[];      // selected layer ids
  rightTab: 'Assistant' | 'Properties' | 'Marketplace';
  searchQuery: string;
}

export interface WalletState extends Wallet {
  charge: (amount: number, action: string) => boolean;
  topUp: (amount: number) => void;
  openHistory: () => void;
  closeHistory: () => void;
  isHistoryOpen: boolean;
}

// Generation options
export interface MusicGenerationOpts {
  genre: string;
  bpm: number;
  mood: string;
}

export interface TTSOpts {
  script: string;
  voice: string;
}

export interface NFTMintOpts {
  assetUrl: string;
  name: string;
  royalties: number;
}

// API Response types
export interface StoryboardResult {
  scenes: any[];
}

export interface NFTMintResult {
  tx: string;
  tokenId: string;
}

export interface ListingResult {
  listingUrl: string;
}

export interface LeaderboardEntry {
  user: string;
  winnings: number;
}

export interface FriendActivity {
  user: string;
  activity: string;
}