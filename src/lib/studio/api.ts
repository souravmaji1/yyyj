import { 
  AssetRef, 
  StoryboardResult, 
  MusicGenerationOpts, 
  TTSOpts, 
  NFTMintOpts, 
  NFTMintResult, 
  ListingResult,
  LeaderboardEntry,
  FriendActivity
} from '@/src/types/studio';
import { aiAxiosClient } from '@/src/app/apis/auth/axios';

// Utility function to create delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock asset URLs for different types
const MOCK_ASSETS = {
  image: [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
  ],
  video: [
    'https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4',
    'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  ],
  threeD: [
    '/api/placeholder/model1.glb',
    '/api/placeholder/model2.glb',
  ],
  music: [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb.mp3',
  ],
  audio: [
    'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
    'https://sample-videos.com/zip/10/mp3/SampleAudio_0.4mb.mp3',
  ],
};

// Image Generation APIs
export async function generateImage(prompt: string): Promise<AssetRef> {
  await delay(2000);
  const url = MOCK_ASSETS.image[Math.floor(Math.random() * MOCK_ASSETS.image.length)] || '';
  
  return {
    id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    url,
    meta: { prompt, generated: true, width: 800, height: 600 }
  };
}

export async function upscaleImage(assetId: string): Promise<AssetRef> {
  await delay(1500);
  const url = MOCK_ASSETS.image[Math.floor(Math.random() * MOCK_ASSETS.image.length)] || '';
  
  return {
    id: `img_upscaled_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    url,
    meta: { upscaled: true, originalId: assetId, width: 1600, height: 1200 }
  };
}

export async function removeBg(assetId: string): Promise<AssetRef> {
  await delay(1000);
  const url = MOCK_ASSETS.image[Math.floor(Math.random() * MOCK_ASSETS.image.length)] || '';
  
  return {
    id: `img_nobg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    url,
    meta: { backgroundRemoved: true, originalId: assetId }
  };
}

// Video Generation APIs
export async function genStoryboard(prompt: string): Promise<StoryboardResult> {
  await delay(3000);
  
  return {
    scenes: [
      { id: 1, description: 'Opening scene with dramatic lighting', duration: 3 },
      { id: 2, description: 'Character introduction with close-up', duration: 5 },
      { id: 3, description: 'Action sequence with dynamic camera', duration: 7 },
      { id: 4, description: 'Resolution with wide shot', duration: 4 },
    ]
  };
}

export async function renderVideo(scenes: any[], music?: AssetRef, voice?: AssetRef): Promise<AssetRef> {
  await delay(5000);
  const url = MOCK_ASSETS.video[Math.floor(Math.random() * MOCK_ASSETS.video.length)] || '';
  
  return {
    id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'video',
    url,
    meta: { 
      scenes: scenes.length, 
      duration: scenes.reduce((acc, scene) => acc + scene.duration, 0),
      hasMusic: !!music,
      hasVoice: !!voice
    }
  };
}

export async function addCaptions(videoId: string): Promise<AssetRef> {
  await delay(1500);
  const url = MOCK_ASSETS.video[Math.floor(Math.random() * MOCK_ASSETS.video.length)] || '';
  
  return {
    id: `vid_captions_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'video',
    url,
    meta: { captioned: true, originalId: videoId }
  };
}

// 3D Generation APIs
export async function create3DJob(prompt: string, style?: string, format?: string, polycount?: string, textureQuality?: string, referenceImages?: File[]): Promise<{ jobId: string }> {
  try {
    console.log('🚀 Creating 3D generation job:', { prompt, style, format, polycount, textureQuality, hasReferenceImages: referenceImages && referenceImages.length > 0 });
    
    // Upload reference images to S3 first (if any)
    let referenceImageUrls: string[] = [];
    if (referenceImages && referenceImages.length > 0) {
      console.log('📤 Uploading reference images to S3...');
      referenceImageUrls = await Promise.all(
        referenceImages.map(async (file, index) => {
          // Check if file has S3 URL but empty size (due to CORS or previous upload)
          if ((file as any).s3Url && file.size === 0) {
            console.log(`Using existing S3 URL for reference image ${index + 1}:`, (file as any).s3Url);
            return (file as any).s3Url;
          }
          
          // Upload to S3
          const formData = new FormData();
          formData.append('image', file);
          formData.append('userId', 'temp'); // Will be replaced by backend auth
          formData.append('description', `3D reference image ${index + 1}`);
          
          const response = await aiAxiosClient.post('/ai-studio/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          return response.data.data.imageUrls[0];
        })
      );
      console.log('✅ Reference images uploaded to S3:', referenceImageUrls);
    }
    
    // Create FormData for 3D generation job
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('style', style || 'realistic');
    formData.append('format', format || 'gltf');
    formData.append('polycount', polycount || 'medium');
    formData.append('textureQuality', textureQuality || '2k');
    
    // Add reference image URLs if provided
    if (referenceImageUrls.length > 0) {
      // Send as JSON string to avoid array validation issues
      formData.append('referenceImageUrls', JSON.stringify(referenceImageUrls));
    }
    
    // Create 3D generation job
    const createResponse = await aiAxiosClient.post('/v2/3d/jobs', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const { jobId } = createResponse.data;
    console.log('✅ 3D job created:', jobId);
    
    return { jobId };
  } catch (error: any) {
    console.error('❌ 3D generation error:', error);
    throw new Error(error.response?.data?.message || error.message || 'Failed to create 3D generation job');
  }
}

export async function poll3DJobStatus(jobId: string): Promise<AssetRef> {
  try {
    console.log('🔄 Polling 3D job status:', jobId);
    
    // Poll for completion
    let attempts = 0;
    const maxAttempts = 60; // 5 minutes max
    const pollInterval = 5000; // 5 seconds

    while (attempts < maxAttempts) {
      await delay(pollInterval);
      attempts++;

      try {
        const statusResponse = await aiAxiosClient.get(`/v2/3d/jobs/${jobId}`);
        const { data } = statusResponse.data;
        
        console.log(`🔄 3D generation status (attempt ${attempts}):`, data.status);

        if (data.status === 'completed') {
          // Extract model URL from the response - check multiple possible locations
          const modelUrl = data.output?.model_file || data.output?.model_url || data.output?.url || data.modelUrl;
          
          if (modelUrl) {
            console.log('✅ 3D generation completed:', modelUrl);
            return {
              id: jobId,
              type: 'threeD',
              url: modelUrl,
              meta: { 
                generated: true, 
                jobId,
                status: 'completed',
                format: data.input?.format || 'gltf',
                polycount: data.input?.polycount || 'medium',
                textureQuality: data.input?.texture_quality || '2k',
                combinedVideo: data.output?.combined_video,
                modelFile: data.output?.model_file
              }
            };
          } else {
            console.error('❌ No model URL found in completed response:', data.output);
            throw new Error('No model URL found in completed response');
          }
        } else if (data.status === 'failed') {
          throw new Error(data.error?.message || '3D generation failed');
        }
        // Continue polling if status is 'pending' or 'processing'
      } catch (pollError: any) {
        console.warn(`⚠️ Polling attempt ${attempts} failed:`, pollError.message);
        if (attempts >= maxAttempts) {
          throw new Error('3D generation timed out');
        }
      }
    }

    throw new Error('3D generation timed out');
  } catch (error: any) {
    console.error('❌ 3D job polling error:', error);
    throw new Error(error.message || 'Failed to poll 3D generation job');
  }
}

// Legacy function for backward compatibility
export async function generate3D(prompt: string, style?: string, format?: string, polycount?: string, textureQuality?: string, referenceImages?: File[]): Promise<AssetRef> {
  const { jobId } = await create3DJob(prompt, style, format, polycount, textureQuality, referenceImages);
  return await poll3DJobStatus(jobId);
}

export async function applyMaterials(modelId: string): Promise<AssetRef> {
  await delay(1200);
  const url = MOCK_ASSETS.threeD[Math.floor(Math.random() * MOCK_ASSETS.threeD.length)] || '';
  
  return {
    id: `3d_materials_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'threeD',
    url,
    meta: { materialsApplied: true, originalId: modelId }
  };
}

export async function turntable(modelId: string): Promise<AssetRef> {
  await delay(2000);
  const url = MOCK_ASSETS.video[Math.floor(Math.random() * MOCK_ASSETS.video.length)] || '';
  
  return {
    id: `turntable_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'video',
    url,
    meta: { turntable: true, originalId: modelId, duration: 10 }
  };
}

// Music Generation APIs
export async function generateMusic(opts: MusicGenerationOpts): Promise<AssetRef> {
  await delay(3500);
  const url = MOCK_ASSETS.music[Math.floor(Math.random() * MOCK_ASSETS.music.length)] || '';
  
  return {
    id: `music_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'music',
    url,
    meta: { 
      genre: opts.genre, 
      bpm: opts.bpm, 
      mood: opts.mood, 
      duration: 180,
      generated: true 
    }
  };
}

export async function masterTrack(assetId: string): Promise<AssetRef> {
  await delay(1800);
  const url = MOCK_ASSETS.music[Math.floor(Math.random() * MOCK_ASSETS.music.length)] || '';
  
  return {
    id: `music_mastered_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'music',
    url,
    meta: { mastered: true, originalId: assetId }
  };
}

export async function splitStems(assetId: string): Promise<AssetRef> {
  await delay(2500);
  const url = MOCK_ASSETS.music[Math.floor(Math.random() * MOCK_ASSETS.music.length)] || '';
  
  return {
    id: `stems_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'music',
    url,
    meta: { stems: ['drums', 'bass', 'vocals', 'instruments'], originalId: assetId }
  };
}

// Audio Generation APIs
export async function tts(opts: TTSOpts): Promise<AssetRef> {
  await delay(2000);
  const url = MOCK_ASSETS.audio[Math.floor(Math.random() * MOCK_ASSETS.audio.length)] || '';
  
  return {
    id: `tts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'audio',
    url,
    meta: { 
      script: opts.script, 
      voice: opts.voice, 
      duration: Math.ceil(opts.script.length / 10),
      generated: true 
    }
  };
}

export async function cleanupAudio(assetId: string): Promise<AssetRef> {
  await delay(1200);
  const url = MOCK_ASSETS.audio[Math.floor(Math.random() * MOCK_ASSETS.audio.length)] || '';
  
  return {
    id: `audio_clean_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'audio',
    url,
    meta: { cleaned: true, originalId: assetId }
  };
}

export async function genAudioQR(asset: AssetRef): Promise<AssetRef> {
  await delay(800);
  const url = MOCK_ASSETS.image[Math.floor(Math.random() * MOCK_ASSETS.image.length)] || '';
  
  return {
    id: `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'qr',
    url,
    meta: { qrFor: asset.id, type: 'audio' }
  };
}

// Product APIs
export async function createProductMockups(cfg: any): Promise<AssetRef[]> {
  await delay(2500);
  
  return [
    {
      id: `mockup_front_${Date.now()}`,
      type: 'image',
      url: MOCK_ASSETS.image[0] || '',
      meta: { mockup: true, view: 'front', product: cfg.productType }
    },
    {
      id: `mockup_back_${Date.now()}`,
      type: 'image', 
      url: MOCK_ASSETS.image[1] || '',
      meta: { mockup: true, view: 'back', product: cfg.productType }
    }
  ];
}

export async function exportPrintFile(cfg: any): Promise<AssetRef> {
  await delay(1500);
  
  return {
    id: `print_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    type: 'image',
    url: '/api/placeholder/print-ready.pdf',
    meta: { printReady: true, dpi: 300, format: 'PDF' }
  };
}

export async function publishToStore(cfg: any): Promise<ListingResult> {
  await delay(2000);
  
  return {
    listingUrl: `https://store.example.com/products/${Date.now()}`
  };
}

// NFT APIs
export async function mintNFT(opts: NFTMintOpts): Promise<NFTMintResult> {
  await delay(3000);
  
  return {
    tx: `0x${Math.random().toString(16).substr(2, 64)}`,
    tokenId: Math.floor(Math.random() * 10000).toString()
  };
}

export async function listNFT(tokenId: string): Promise<ListingResult> {
  await delay(1500);
  
  return {
    listingUrl: `https://opensea.io/assets/ethereum/0x123/${tokenId}`
  };
}

// Asset Management APIs
export async function fetchAssets(): Promise<AssetRef[]> {
  await delay(800);
  
  const assets: AssetRef[] = [];
  
  // Generate sample assets of different types
  for (let i = 0; i < 12; i++) {
    const types: Array<keyof typeof MOCK_ASSETS> = ['image', 'video', 'music', 'audio'];
    const type = types[i % types.length];
    const urls = type ? MOCK_ASSETS[type] : undefined;
    
    if (type && urls) {
      assets.push({
        id: `asset_${i}_${Date.now()}`,
        type: type === 'music' || type === 'audio' ? type : type,
        url: urls[i % urls.length] || '',
      meta: {
        name: `Sample ${type} ${i + 1}`,
        createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        size: Math.floor(Math.random() * 5000000) + 100000,
      }
      });
    }
  }
  
  return assets;
}

export async function fetchLeaderboard(): Promise<LeaderboardEntry[]> {
  await delay(500);
  
  return [
    { user: 'Creator_Alpha', winnings: 15420 },
    { user: 'Digital_Artist_Pro', winnings: 12890 },
    { user: 'NFT_Master', winnings: 11250 },
    { user: 'Studio_Wizard', winnings: 9800 },
    { user: 'Creative_Ninja', winnings: 8560 },
  ];
}

export async function fetchFriendsNow(): Promise<FriendActivity[]> {
  await delay(400);
  
  const activities = [
    'minted a new NFT',
    'created a 3D model',
    'generated music track',
    'designed a t-shirt',
    'uploaded video',
    'created QR code',
  ];
  
  return [
    { user: 'Sarah_Designer', activity: activities[0] || '' },
    { user: 'Mike_3D', activity: activities[1] || '' },
    { user: 'Beat_Creator', activity: activities[2] || '' },
    { user: 'Fashion_Forward', activity: activities[3] || '' },
  ];
}