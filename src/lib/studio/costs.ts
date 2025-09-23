import { CostMap } from '@/src/types/studio';

export const COSTS: CostMap = {
  image: { generate: 40, upscale: 10, bgRemove: 8 },
  video: { storyboard: 70, render: 120, captions: 6 },
  threeD: { generate: 150, materials: 12, turntable: 20 },
  music: { generate: 90, master: 14, stems: 18 },
  audio: { tts: 30, cleanup: 7, qr: 5 },
  product: { mockups: 20, printExport: 10, publish: 5 },
  nft: { mint: 200, list: 3, qr: 4 },
};