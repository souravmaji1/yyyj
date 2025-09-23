"use client";

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import ModelViewer from '../modals/modelviewer';
import { getContract } from '../../lib/nftcontract';
import { BrowserProvider } from 'ethers';
import {
  Send,
  Loader2,
  Bookmark,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ExternalLink,
  Image as ImageIcon,
  Video,
  Box,
  Music,
  Paperclip,
  X
} from 'lucide-react';
import { ScrollArea } from '../../components/ui/scroll-area';
import { Button } from "../../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../components/ui/card";
import { useScrollLock } from '@/src/hooks/useScrollLock';
import { getClientCookie } from "@/src/core/config/localStorage";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { 
  generateImage, 
  imageToImage, 
  enhanceImage, 
  generateVideo, 
  imageToVideo,
  generateAudio,
  generate3D,
  generateImageTo3D,
  generateFaceSwap,
  uploadDocument
} from '@/src/store/slices/aiStudioSlice';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/src/store';

import authAxiosClient from '@/src/app/apis/auth/axios';
/* ----------  TYPES  ---------- */
type MintStatus = 'idle' | 'minting' | 'minted' | 'error';
type MintingStates = Record<string, { status: MintStatus; txHash?: string; error?: string }>;



/* ----------  MAIN COMPONENT PROPS  ---------- */
interface MainModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/* ----------  MAIN COMPONENT  ---------- */
export function CreateAdModal({ isOpen, onClose }: MainModalProps) {
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const dispatch = useDispatch<AppDispatch>();
  const [mintingStates, setMintingStates] = useState<MintingStates>({});
  const [started, setStarted] = useState(false);
  const accessToken = getClientCookie("accessToken") || "";
  const [waitingForFirst, setWaitingForFirst] = useState(false);

  const { messages, sendMessage, isLoading, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      url: '/api/chat',
      prepareSendMessagesRequest: ({ id, messages }) => ({
        body: {
          id,
          messages,
          intelliverseToken: {
            accessToken: accessToken
          },
        },
      }),
    }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls,
   /* ------------------------------------------------------------------ */
/*  NEW – drop-in replacement for the existing  onToolCall({toolCall})  */
/* ------------------------------------------------------------------ */
async onToolCall({ toolCall }) {
  if (toolCall.dynamic) return; // let the transport handle dynamic calls

  const { toolName, toolCallId, input } = toolCall;

  switch (toolName) {
    /* -------------------------------------------------------------- */
    /*  Image – already present, keep as-is                         */
    /* -------------------------------------------------------------- */
    case 'generateImage': {
      const { prompt } = input;
      const generatedImage = await dispatch(
        generateImage({
          prompt,
          style: 'realistic',
          size: '1024x1024',
          quality: 'high',
          cost: 15,
        })
      ).unwrap();
      addToolResult({ tool: 'generateImage', toolCallId, output: generatedImage });
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Image Enhancer – already present, keep as-is                */
    /* -------------------------------------------------------------- */
    case 'imageEnhancer': {
      const { prompt, imageFile } = input;
      if (!imageFile) {
        addToolResult({ tool: 'imageEnhancer', toolCallId, output: { error: 'No image file provided' } });
        break;
      }
      const formData = new FormData();
      formData.append('s3Url', imageFile);
      formData.append('fileName', imageFile.name);
      formData.append('fileType', imageFile.type);
      formData.append('instructions', prompt ?? '');
      formData.append('userId', profile.id);

      const enhanced = await dispatch(imageToImage({ formData, cost: 15 })).unwrap();
      addToolResult({ tool: 'imageEnhancer', toolCallId, output: enhanced });
      break;
    }

    

    /* -------------------------------------------------------------- */
    /*  VIDEO  (txt2vid) – mirrors AI-Studio-3 page                 */
    /* -------------------------------------------------------------- */
    case 'generateVideo': {
      const { prompt, motionType = 'smooth', duration = 5 } = input;
      const video = await dispatch(
        generateVideo({
          prompt,
          motionType,
          duration,
          cost: 25,
        })
      ).unwrap();
      addToolResult({ tool: 'generateVideo', toolCallId, output: video });
      break;
    }

   case 'imagetoVideo': {
  const { prompt, imageUrl } = input;

  /* ---- 1.  same logic as AIStudio3Page/handleActionSelect ---- */
  let file: File;

  // Check if this is a recently uploaded file with actual data
  const justUploaded = files.find(f => f.name === imageUrl.split('/').pop());
  if (justUploaded && justUploaded.size > 0) {
    file = justUploaded;
  }
  // Check if we have an S3 URL but need to fetch the actual file data
  else if (imageUrl && imageUrl.includes('s3')) {
    // Try to fetch the actual file data from S3
    try {
      const res = await fetch(imageUrl);
      if (!res.ok) throw new Error('fetch image failed');
      const blob = await res.blob();
      file = new File([blob], 'image.jpg', { type: blob.type });
    } catch (error) {
      console.warn('Failed to fetch image from S3, using empty file with S3 URL:', error);
      // Create empty file with S3 URL attached (like AIStudio3Page does)
      file = new File([], 'image.jpg', { type: 'image/jpeg' });
      (file as any).s3Url = imageUrl;
    }
  } else {
    // Fallback - create empty file with URL attached
    file = new File([], 'image.jpg', { type: 'image/jpeg' });
    (file as any).s3Url = imageUrl;
  }

  /* ---- 2.  build FormData identical to AIStudio3Page ---- */
  const fd = new FormData();
  fd.append('image', file);
  
  // Check if file has S3 URL but no data (like AIStudio3Page does)
  if ((file as any).s3Url && file.size === 0) {
    fd.append('s3Url', (file as any).s3Url);
    fd.append('fileName', file.name);
    fd.append('fileType', file.type);
  } else {
    // Send empty strings for S3 fields when uploading file directly
    fd.append('s3Url', '');
    fd.append('fileName', '');
    fd.append('fileType', '');
  }
  
  fd.append('motionType', 'parallax');
  fd.append('duration', '5');
  if (prompt) fd.append('instructions', prompt);
  fd.append('userId', profile.id);

  /* ---- 3.  dispatch exactly like AIStudio3Page ---- */
  const video = await dispatch(imageToVideo({
    image: file,           // File object
    motionType: 'parallax',
    duration: 5,
    instructions: prompt || undefined,
    cost: 25,
    s3Url: (file as any).s3Url || '',  // Use the actual S3 URL
    fileName: file.name,
    fileType: file.type,
  })).unwrap();

  addToolResult({ tool: 'imagetoVideo', toolCallId, output: video });
  break;
}

    /* -------------------------------------------------------------- */
    /*  VIDEO  (img2vid) – mirrors AI-Studio-3 page                 */
    /* -------------------------------------------------------------- */
   

    /* -------------------------------------------------------------- */
    /*  SONG / AUDIO – mirrors AI-Studio-3 page                     */
    /* -------------------------------------------------------------- */
    case 'generateSong': {
      const { prompt, audioType = 'music', genre = 'pop', duration = 30 } = input;
      const song = await dispatch(
        generateAudio({
          prompt,
          audioType,
          genre,
          duration,
          cost: 20,
        })
      ).unwrap();
      addToolResult({ tool: 'generateSong', toolCallId, output: song });
      break;
    }

    /* -------------------------------------------------------------- */
    /*  FACE-SWAP – mirrors AI-Studio-3 page                        */
    /* -------------------------------------------------------------- */
   case 'faceSwap': {
  const { prompt, sourceUrl, targetUrl } = input;
  
  if (!sourceUrl || !targetUrl) {
    addToolResult({ tool: 'faceSwap', toolCallId, output: { error: 'Source and target images required' } });
    break;
  }
  
  try {
    console.log('🎭 FaceSwap: Starting AIStudio3Page frontend workflow...');
    
    // Helper function to get file from URL (matching AIStudio3Page logic)
    const getFileFromUrl = async (url: string, type: 'source' | 'target'): Promise<File> => {
      // Check if this is a recently uploaded file with actual data
      const justUploaded = files.find(f => f.name === url.split('/').pop());
      if (justUploaded && justUploaded.size > 0) {
        console.log(`✅ Using uploaded file for ${type}:`, justUploaded.name);
        return justUploaded;
      }
      
      // Check if we have an S3 URL but need to fetch the actual file data
      if (url && url.includes('s3')) {
        // Try to fetch the actual file data from S3
        try {
          console.log(`📥 Fetching ${type} image from S3 URL:`, url);
          const res = await fetch(url);
          if (!res.ok) throw new Error(`fetch ${type} image failed`);
          const blob = await res.blob();
          const fileName = url.split('/').pop() || `${type}-image.jpg`;
          const file = new File([blob], fileName, { type: blob.type });
          console.log(`✅ ${type} image fetched successfully:`, file.name, file.size);
          return file;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch ${type} image from S3, using empty file with S3 URL:`, error);
          // Create empty file with S3 URL attached (like AIStudio3Page does)
          const fileName = url.split('/').pop() || `${type}-image.jpg`;
          const file = new File([], fileName, { type: 'image/jpeg' });
          (file as any).s3Url = url;
          return file;
        }
      } else {
        // Fallback - create empty file with URL attached
        console.log(`⚠️ Using fallback for ${type}: creating empty file with URL`);
        const fileName = url.split('/').pop() || `${type}-image.jpg`;
        const file = new File([], fileName, { type: 'image/jpeg' });
        (file as any).s3Url = url;
        return file;
      }
    };
    
    // Convert URLs to File objects (exactly like AIStudio3Page would have)
    console.log('📥 Converting source URL to File object...');
    const sourceFile = await getFileFromUrl(sourceUrl, 'source');
    console.log('✅ Source file created:', {
      name: sourceFile.name,
      size: sourceFile.size,
      type: sourceFile.type,
      hasS3Url: !!(sourceFile as any).s3Url
    });
    
    console.log('📥 Converting target URL to File object...');
    const targetFile = await getFileFromUrl(targetUrl, 'target');
    console.log('✅ Target file created:', {
      name: targetFile.name,
      size: targetFile.size,
      type: targetFile.type,
      hasS3Url: !!(targetFile as any).s3Url
    });
    
    // Dispatch generateFaceSwap with File objects (EXACTLY like AIStudio3Page)
    const swapped = await dispatch(
      generateFaceSwap({
        sourceImage: sourceFile,    // File object
        targetImage: targetFile,    // File object
        prompt: prompt || 'Face swap',
        cost: 18,
      })
    ).unwrap();
    
    console.log('✅ FaceSwap: Generation completed:', swapped);
    addToolResult({ tool: 'faceSwap', toolCallId, output: swapped });
    
  } catch (error) {
    console.error('❌ FaceSwap error:', error);
    addToolResult({ tool: 'faceSwap', toolCallId, output: { error: error.message } });
  }
  break;
}

    /* -------------------------------------------------------------- */
    /*  3D – already present, keep as-is                           */
    /* -------------------------------------------------------------- */
    case 'generate3DModel': {
      const { prompt, objectType = 'object', style = 'realistic' } = input;
      const model = await dispatch(
        generate3D({
          prompt,
          objectType,
          style,
          cost: 25,
        })
      ).unwrap();
      addToolResult({ tool: 'generate3DModel', toolCallId, output: model });
      break;
    }

    /* -------------------------------------------------------------- */
    /*  Anything else – let the transport fall back                 */
    /* -------------------------------------------------------------- */
    default:
      break;
  }
},
    onFinish: () => {
       if (!started) setStarted(true); 
         setWaitingForFirst(false);  
      },
  });

  const [openSaved, setOpenSaved] = useState(false);

 const { profile } = useSelector((state: RootState) => state.user);

useEffect(() => {
  console.log("Profile from Redux in CreateAdModal:", profile);
}, [profile]);

  // Prevent body scrolling when modal is open
  useScrollLock(isOpen);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInput('');
      setFiles([]);
      setPreviews([]);
      setStarted(false);
      setMintingStates({});
  
  
    }
  }, [isOpen]);

  /* ----------  FILE HANDLING  ---------- */
  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (files.length + newFiles.length > 2) {
      alert('Max 2 files (images or videos).');
      return;
    }
    setFiles((prev) => [...prev, ...newFiles]);
    setPreviews((prev) => [
      ...prev,
      ...newFiles.map((f) => URL.createObjectURL(f)),
    ]);
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
    setPreviews((prev) => prev.filter((_, i) => i !== idx));
    if (fileRef.current) fileRef.current.value = '';
  };

  /* ----------  DOCUMENT UPLOAD (REPLACED SUPABASE)  ---------- */
  const uploadFilesToDocuments = async (files: File[]) => {
    if (files.length === 0) return [];

    setUploading(true);
    const uploadedDocumentIds: string[] = [];

    try {
      for (const file of files) {
        // Determine document type based on file type
        let documentType = 'document';
        if (file.type.startsWith('image/')) {
          documentType = 'image';
        } else if (file.type.startsWith('video/')) {
          documentType = 'video';
        } else if (file.type.startsWith('audio/')) {
          documentType = 'audio';
        } else if (file.type.includes('pdf')) {
          documentType = 'pdf';
        } else if (file.type.includes('presentation')) {
          documentType = 'presentation';
        } else if (file.type.includes('spreadsheet')) {
          documentType = 'spreadsheet';
        }

        // Upload document using the same approach as AI Studio 3
        const result = await dispatch(uploadDocument({
          file: file,
          title: file.name.split('.')[0],
          description: `Uploaded from CreateAdModal - ${file.name}`,
          documentType,
          isPublic: false,
          tags: ['create-ad', 'chat']
        })).unwrap();

        uploadedDocumentIds.push(result.imageUrl);
      }
      console.log("your uploaded image",uploadedDocumentIds)
      return uploadedDocumentIds;
    } catch (error) {
      console.error('Document upload failed:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  /* ----------  NEW – same bucket + endpoint as manual modal  ---------- */
const uploadMediaToS3 = async (files: File[]): Promise<string[]> => {
  if (!files.length) return [];

  setUploading(true);
  const urls: string[] = [];

  try {
    for (const file of files) {
      const fd = new FormData();
      fd.append('files', file);               // the endpoint expects “files”
      const { data } = await authAxiosClient.post(
        `${process.env.NEXT_PUBLIC_API_PRODUCT_BASE_URL}/shopify/upload-ad`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      /* the manual modal uses data.videos[0]  – same here */
      if (data?.videos?.[0]) urls.push(data.videos[0]);
      else throw new Error('S3 upload returned empty video array');
    }
    return urls;
  } catch (e: any) {
    console.error('S3 upload error:', e);
    throw new Error(e.response?.data?.message || 'Video upload failed');
  } finally {
    setUploading(false);
  }
};

  /* ----------  UPDATED HANDLE SEND  ---------- */
 const handleSend = async () => {
  if (!input.trim() && !files.length) return;

  let textToSend = input.trim();

  if (!started) setWaitingForFirst(true);

  if (files.length) {
    try {
      const s3Urls = await uploadMediaToS3(files); // ← new helper
      textToSend = `${input.trim()}\n\n(Uploaded media: ${s3Urls.join(', ')})`;
      setFiles([]);
      setPreviews([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (e: any) {
      console.error('Upload failed – sending text only:', e);
      /* fallback: just the text, user can retry files */
    }
  }

  sendMessage({ text: textToSend });
  setInput('');
};

  /* ----------  MINTING  ---------- */
 
  /* ----------  RENDER TOOL PART  ---------- */
  const renderToolPart = (part: any, i: number, messageId: string) => {
    const key = `${messageId}-${i}`;
    const st = mintingStates[key] ?? { status: 'idle' };

    /* ----- IMAGE ----- */
    if (part.type === 'tool-generateImage') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <ImageIcon size={16} />
              <span className="text-sm font-medium">Generating image…</span>
            </div>
          </div>
        );
      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <img src={part.output.imageUrl || part.output.generatedImageUrl} alt="" className="w-full rounded-xl border border-gray-700/30 shadow-lg" />
            
           <h1>Request Successfull</h1>
           
          </div>
        );
      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Error: {part.errorText}</span>
          </div>
        );
      return null;
    }


        /* ----- IMAGE-TO-VIDEO (img2vid) ----- */
    if (part.type === 'tool-imagetoVideo') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Video size={16} />
              <span className="text-sm font-medium">Turning image into video…</span>
            </div>
          </div>
        );

      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <p className="text-sm text-gray-400 mb-3">{part.output.description || 'Image-to-video generated.'}</p>

            {(part.output.videoUrl || part.output.generatedVideoUrl) && (
              <video
                controls
                poster={part.output.coverUrl}
                className="w-full rounded-xl border border-gray-700/30 shadow-lg"
              >
                <source src={part.output.videoUrl || part.output.generatedVideoUrl} type="video/mp4" />
              </video>
            )}

           
            <h1>Request Successfull</h1>
            {st.status === 'error' && (
              <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400 mt-2">
                <span>Minting failed: {st.error}</span>
              </div>
            )}
          </div>
        );

      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Image-to-video error: {part.errorText}</span>
          </div>
        );

      return null;
    }

    /* ----- IMAGE ENHANCER ----- */
if (part.type === 'tool-imageEnhancer') {
  const key = `${messageId}-${i}`;
  const st = mintingStates[key] ?? { status: 'idle' };

  if (part.state === 'input-available')
    return (
      <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Loader2 size={16} className="animate-spin" />
          <ImageIcon size={16} />
          <span className="text-sm font-medium">Enhancing image…</span>
        </div>
      </div>
    );

  if (part.state === 'output-available')
    return (
      <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
        <img
          src={part.output.enhancedImageUrl || part.output.imageUrl}
          alt="enhanced"
          className="w-full rounded-xl border border-gray-700/30 shadow-lg"
        />

        <h1>Request Successfull</h1>
       
        
      </div>
    );

  if (part.state === 'output-error')
    return (
      <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
        <span>Enhancement error: {part.errorText}</span>
      </div>
    );

  return null;
}

    /* ----------  INTELLIVERSE-X AD CAMPAIGN  ---------- */
    if (part.type === 'tool-createIntelliverseCampaign') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Sparkles size={16} />
              <span className="text-sm font-medium">Creating IntelliVerse-X campaign…</span>
            </div>
          </div>
        );

      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Sparkles size={16} />
              <span className="text-sm font-semibold">IntelliVerse-X Campaign Created</span>
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Campaign "{part.output.campaignName || part.output.campaignId}" is live.
            </p>

            <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-3">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle size={16} />
                <span className="font-medium">Success</span>
              </div>
            </div>
          </div>
        );

      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Campaign creation failed: {part.errorText}</span>
          </div>
        );

      return null;
    }

    /* ----- FACE-SWAP ----- */
    if (part.type === 'tool-faceSwap') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Sparkles size={16} />
              <span className="text-sm font-medium">Swapping faces…</span>
            </div>
          </div>
        );
      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <img
              src={part.output.imageUrl || part.output.swappedImageUrl}
              alt="face-swapped"
              className="w-full rounded-xl border border-gray-700/30 shadow-lg"
            />
           
           
            <h1>Request Successfull</h1>
          </div>
        );
      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Face-swap error: {part.errorText}</span>
          </div>
        );
      return null;
    }

    /* ----- VIDEO ----- */
    if (part.type === 'tool-generateVideo') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Video size={16} />
              <span className="text-sm font-medium">Generating video…</span>
            </div>
          </div>
        );
      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <p className="text-sm text-gray-400 mb-3">{part.output.description}</p>
            {part.output.videoUrl || part.output.generatedVideoUrl && (
              <>
                <video controls poster={part.output.coverUrl} className="w-full rounded-xl border border-gray-700/30 shadow-lg">
                  <source src={part.output.videoUrl || part.output.generatedVideoUrl} type="video/mp4" />
                </video>
              </>
            )}
            <h1>Request Successfull</h1>
          </div>
        );
      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Video Error: {part.errorText}</span>
          </div>
        );
      return null;
    }

    /* ----- 3D MODEL ----- */
    if (part.type === 'tool-generate3DModel') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Box size={16} />
              <span className="text-sm font-medium">Creating 3D model…</span>
            </div>
          </div>
        );

      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <p className="text-sm text-gray-400 mb-3">{part.output.description || '3D model generated.'}</p>

            {part.output.modelFileUrl && (
              <div className="relative h-96 w-full border border-gray-700/30 rounded-xl mb-3 overflow-hidden bg-gray-900/50">
                <ModelViewer
                  modelUrl={part.output.modelFileUrl || part.output.generatedModelUrl}
                  showControls
                  onLoading={console.log}
                  onError={console.error}
                />
              </div>
            )}

            {part.output.videoUrl && (
              <video controls className="w-full rounded-xl border border-gray-700/30 shadow-lg">
                <source src={part.output.videoUrl} type="video/mp4" />
              </video>
            )}

            <h1>Request Successfull</h1>
          </div>
        );

      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>3D Model Error: {part.errorText}</span>
          </div>
        );

      return null;
    }

    /* ----- SONG ----- */
    if (part.type === 'tool-generateSong') {
      if (part.state === 'input-available')
        return (
          <div className="mt-4 bg-gray-900/60 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <Loader2 size={16} className="animate-spin" />
              <Music size={16} />
              <span className="text-sm font-medium">Creating song…</span>
            </div>
          </div>
        );
      if (part.state === 'output-available')
        return (
          <div className="mt-4 bg-gray-950/95 border border-gray-800/40 rounded-2xl p-4 backdrop-blur-xl shadow-lg">
            <div className="flex items-center gap-2 text-gray-300 mb-2">
              <Music size={16} />
              <span className="text-sm font-semibold">{part.output.title || 'Generated Music'}</span>
            </div>
            {part.output.imageUrl && (
              <img
                src={part.output.imageUrl}
                alt="cover"
                className="w-48 h-48 object-cover rounded-xl border border-gray-700/30 shadow-lg mb-3"
              />
            )}
            {part.output.audioUrl || part.output.generatedSongUrl ? (
              <div className="mb-3">
                <audio controls className="w-full rounded-xl bg-gray-900/50 border border-gray-700/30">
                  <source src={part.output.audioUrl || part.output.generatedSongUrl} type="audio/mpeg" />
                  <source src={part.output.audioUrl || part.output.generatedSongUrl} type="audio/wav" />
                </audio>
                <a
                  href={part.output.audioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300 mt-2"
                >
                  <ExternalLink size={12} />
                  <span>Download audio</span>
                </a>
              </div>
            ) : (
              <div className="mb-3 text-sm text-gray-500 italic">Audio is being processed…</div>
            )}
            {part.output.videoUrl && (
              <video controls className="w-full rounded-xl border border-gray-700/30 shadow-lg">
                <source src={part.output.videoUrl} type="video/mp4" />
              </video>
            )}
            <h1>Request Successfull</h1>
          </div>
        );
      if (part.state === 'output-error')
        return (
          <div className="mt-4 bg-red-950/30 border border-red-500/20 rounded-xl p-3 text-sm text-red-400">
            <span>Song Error: {part.errorText}</span>
          </div>
        );
      return null;
    }

    return null;
  };

  /* ----------  MESSAGE BUBBLE  ---------- */
 const MessageBubble = ({ msg }: { msg: any }) => {
  const isUser = msg.role === 'user';
  const loadingParts = !isUser
    ? msg.parts.filter((p: any) => p.state === 'input-available' && p.type !== 'text')
    : [];

  /* ---- helper: remove tags + collect ALL urls ---- */
  const extractImageUrls = (text: string): { cleanText: string; imageUrls: string[] } => {
    const matches = Array.from(text.matchAll(/\(Uploaded image: (.+?)\)/g));
    const imageUrls = matches.map((m) => m[1]);
    const cleanText = text.replace(/\(Uploaded image: .+?\)/g, '').trim();
    return { cleanText, imageUrls };
  };

  const textParts = msg.parts.filter((p: any) => p.type === 'text');
  const textContent = textParts.map((p: any) => p.text).join('');

  const { cleanText, imageUrls } = isUser
    ? extractImageUrls(textContent)
    : { cleanText: textContent, imageUrls: [] };

  // If there's no text content and no images, and it's not a user message, don't render the text bubble
  const shouldRenderTextBubble = cleanText.trim() || imageUrls.length > 0 || isUser;

  return (
    <div className={`flex items-start gap-4 group ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Only show avatar if we're rendering something */}
      {(shouldRenderTextBubble || loadingParts.length > 0) && (
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg ${
            isUser
              ? 'bg-gradient-to-br from-gray-600 to-gray-700'
              : 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/30'
          }`}
        >
          {isUser ? (
            <div className="w-6 h-6 rounded-full bg-gray-400" />
          ) : (
            <Sparkles size={18} className="text-gray-300" />
          )}
        </div>
      )}

      <div className="max-w-2xl flex flex-col">
        {!isUser &&
          loadingParts.map((part: any, idx: number) => (
            <div key={`load-${idx}`} className="mb-3">
              {renderToolPart(part, idx, msg.id)}
            </div>
          ))}

        {/* ---- text bubble - only render if there's actual content ---- */}
        {shouldRenderTextBubble && (
          <>
            <div
              className={`rounded-3xl px-6 py-4 shadow-lg ${
                isUser
                  ? 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-100'
                  : 'bg-gray-950/95 border border-gray-800/40 text-gray-200 backdrop-blur-xl'
              }`}
            >
              {cleanText && (
                <div className="text-sm leading-relaxed">{cleanText}</div>
              )}

              {/* ---- ALL user-uploaded images ---- */}
              {isUser &&
                imageUrls.length > 0 &&
                imageUrls.map((u, i) => (
                  <div className="mt-3" key={i}>
                    <img
                      src={u}
                      alt={`user-img-${i}`}
                      className="rounded-xl border border-gray-700/30 shadow-lg max-w-xs object-cover"
                      onError={(e) => {
                        console.error('Failed to load image:', u);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                ))}
            </div>

            {/* Timestamp - only show if we rendered the text bubble */}
            <div className="text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {new Date(msg.timestamp || Date.now()).toLocaleTimeString()}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 overflow-hidden">
      <div className="w-full max-w-6xl max-h-[95vh] overflow-y-auto bg-gray-950 rounded-lg mx-2 sm:mx-0">
        <Card className="bg-gray-950 border-gray-800 shadow-2xl">
          {/* Header */}
          <CardHeader className="border-b border-gray-800 p-4 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl md:text-2xl font-bold text-white truncate">
                    Intelliverse Ads Creation
                  </CardTitle>
                  <p className="text-gray-400 text-sm sm:text-base mt-1 truncate">
                    Generate intelliverse ad campaign using AI
                  </p>
                </div>
              </div>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 sm:h-10 sm:w-10 p-0 hover:bg-gray-800/50 text-white hover:text-white border border-gray-700 hover:border-gray-600 transition-all duration-200 flex-shrink-0"
                disabled={isLoading || uploading}
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Content */}
          <CardContent className="p-0">
            {!started ? (
              // Start screen
              <div className="p-6">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-700 to-gray-800 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-gray-700/20">
                    <Sparkles size={32} className="text-gray-300" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-200 mb-2">Create your Intellicerse Ad campaign</h2>
                  <p className="text-gray-400">Generate your ad campaign. Will be displaying in Intelliverse Platform!</p>
                </div>

                {/* Input area */}
                <div className="relative">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything, request to create a new intelliverse ad campaign......"
                    className="w-full bg-gray-900/60 border border-gray-800/40 focus:border-gray-700/60 rounded-3xl px-6 py-4 pr-28 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700/30 transition-all backdrop-blur-sm shadow-lg"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey && (input.trim() || files.length > 0)) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                     disabled={waitingForFirst}  
                  />
                  <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {previews.map((p, i) => (
                      <div key={i} className="relative">
                        {files[i]?.type.startsWith('video/') ? (
                          <video
                            src={p}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
                            muted
                            loop
                            autoPlay
                            playsInline
                          />
                        ) : (
                          <img
                            src={p}
                            alt={`preview-${i}`}
                            className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
                          />
                        )}
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    <label className="cursor-pointer">
                      <Paperclip size={20} className="text-gray-400 hover:text-gray-200" />
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={onFilePick}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <button
              onClick={handleSend}
              disabled={waitingForFirst || (!input.trim() && files.length === 0)}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-lg ${
                waitingForFirst || (!input.trim() && files.length === 0)
                  ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 hover:from-gray-500 hover:to-gray-600 hover:scale-105'
              }`}
            >
              {waitingForFirst ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <Send size={20} />
              )}
            </button>
                </div>

                {uploading && (
                  <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                    <Loader2 size={16} className="animate-spin" />
                    <span>Uploading documents…</span>
                  </div>
                )}

                <div className="text-center mt-4 text-xs text-gray-500">Powered by advanced AI • </div>
              </div>
            ) : (
              // Chat interface
              <div className="h-[70vh] flex">
                {/* Left - Generated content */}
                <div className="w-1/2 border-r border-gray-800/30">
                  <ScrollArea className="h-full">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold text-gray-300">Results</h3>
                      
                      </div>
                      <div className="space-y-6">
                        {messages.map((msg) =>
                          msg.parts
                            .filter((p: any) => p.type !== 'text' && (p.state === 'output-available' || p.state === 'output-error'))
                            .map((part: any, idx: number) => (
                              <div key={`${msg.id}-${idx}`}>{renderToolPart(part, idx, msg.id)}</div>
                            ))
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </div>

                {/* Right - Chat */}
                <div className="w-1/2 flex flex-col">
                  <ScrollArea className="flex-1">
                    <div className="p-6">
                      <div className="space-y-8">
                        {messages.map((msg) => (
                          <MessageBubble key={msg.id} msg={msg} />
                        ))}
                      </div>
                    </div>
                  </ScrollArea>

                  {/* Input bar */}
                  <div className="border-t border-gray-800/30 bg-gray-950/98 backdrop-blur-xl p-6">
                    <div className="relative">
                      <input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Reply…"
                        className="w-full bg-gray-900/60 border border-gray-800/40 focus:border-gray-700/60 rounded-3xl px-6 py-4 pr-28 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-700/30 transition-all backdrop-blur-sm shadow-lg"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey && (input.trim() || files.length > 0)) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <div className="absolute right-20 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        {previews.map((p, i) => (
                          <div key={i} className="relative">
                            {files[i]?.type.startsWith('video/') ? (
                              <video
                                src={p}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
                                muted
                                loop
                                autoPlay
                                playsInline
                              />
                            ) : (
                              <img
                                src={p}
                                alt={`preview-${i}`}
                                className="w-10 h-10 object-cover rounded-xl border border-gray-700/30"
                              />
                            )}
                            <button
                              onClick={() => removeFile(i)}
                              className="absolute -top-2 -right-2 bg-red-600 rounded-full p-1"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                        <label className="cursor-pointer">
                          <Paperclip size={20} className="text-gray-400 hover:text-gray-200" />
                          <input
                            ref={fileRef}
                            type="file"
                            accept="image/*,video/*"
                            multiple
                            onChange={onFilePick}
                            className="hidden"
                          />
                        </label>
                      </div>
                      <button
                        onClick={handleSend}
                        disabled={!input.trim() && files.length === 0}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-3 rounded-2xl transition-all shadow-lg ${
                          !input.trim() && files.length === 0
                            ? 'bg-gray-800/50 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-100 hover:from-gray-500 hover:to-gray-600 hover:scale-105'
                        }`}
                      >
                        <Send size={20} />
                      </button>
                    </div>
                    {uploading && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mt-3">
                        <Loader2 size={16} className="animate-spin" />
                        <span>Uploading documents…</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-4 text-xs text-gray-500">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span>AI Services Active</span>
                      </div>
                      <span>Create AD Campaign</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}