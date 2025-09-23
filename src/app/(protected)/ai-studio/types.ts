// Types for AI Studio v3
export type Mode = 'image' | 'video' | 'audio' | 'threeD';
export type SubMode = 'txt2img' | 'img2img' | 'enhance' | 'imgswap' | 'txt2vid' | 'img2vid' | 'music' | 'soundeffect' | 'audiobook' | 'character' | 'object' | 'environment' | 'img2obj';

export interface AI3State {
  mode: Mode;
  subMode: SubMode;
  prompt: string;
  selectedPreset: string;
  uploadedFile: File | null;
  sourceImage: File | null; // For face swap
  targetImage: File | null; // For face swap
  balance: number;
  // Audio-specific options
  audioGenre?: string;
  audioType?: 'music' | 'voice' | 'effects';
  audioDuration?: number;
  // 3D-specific options
  objectType?: 'character' | 'object' | 'environment';
  modelStyle?: string;
}
