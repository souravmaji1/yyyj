import { groq } from '@ai-sdk/groq';
import { streamText, convertToModelMessages, UIMessage, stepCountIs } from 'ai';
import { tool } from 'ai';
import { z } from 'zod';
import axios from 'axios';
/* Re-exports the thunks so they can be awaited outside React components */

/* ----------  TOOL: generate an image  ---------- */
 /* SAME FILE – export a new imageGenTool */
/* ------------------------------------------------------------------ */
/*  NEW  –  server-side compatible  imageGenTool                      */
/* ------------------------------------------------------------------ */
const imageGenTool = tool({
  description:
    'Generate or edit an AI image. Call only when the user explicitly asks to create, draw, generate, paint',
  inputSchema: z.object({
    prompt: z.string()
  }),
  outputSchema: z.string().describe("The generated image URL") 
});

const imageEnhanceTool = tool({
  description:
    'Edit or modify an AI image. Call only when the user explicitly asks to edit, modify, update',
  inputSchema: z.object({
    prompt: z.string(),
    imageFile: z.string(),
  }),
  outputSchema: z.string().describe("The enhanced image URL")
});

/* ----------  TOOL: face-swap  ---------- */
const faceSwapTool = tool({
  description:
    'Swap the face in the first image (target) with the face in the second image (swap). ' +
    'Only invoke when the user explicitly asks to faceswap or face-swap.',
  inputSchema: z.object({
    targetUrl: z.string().describe("URL of the target image"), // publicly reachable
    sourceUrl: z.string().describe("URL of the source image"),
  }),
   outputSchema: z.string().describe("The swapped image URL")
});

/* ----------  TOOL: generate a video  ---------- */
const videoGenTool = tool({
  description: 'Generate an AI video. Only call when the user explicitly asks to create, generate, or make a video.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed prompt describing the video scene and action'),
  }),
 outputSchema: z.string().describe("The generated video URL")
});

const imagetovideoGenTool = tool({
  description: 'Generate a video from an image. Only call when the user explicitly asks to create, generate, or make a video from an image, image-to-video, or img2vid.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed prompt describing the video scene and action'),
    imageUrl: z.string().url().describe('URL of the input image'),
  }),
 outputSchema: z.string().describe("The transformed image to video URL")
});


/* ----------  TOOL: generate a 3D model  ---------- */
const model3dGenTool = tool({
  description: 'Generate a 3D model. Only call when the user explicitly asks to create, generate, or make a 3D model, 3D object, or 3D asset.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed prompt describing the 3D model to generate'),
  }),
 outputSchema: z.string().describe("The generated model URL")
});

/* ----------  TOOL: generate a song  ---------- */
const songGenTool = tool({
  description: 'Generate a song or music. Only call when the user explicitly asks to create, generate, or make music, song, or audio.',
  inputSchema: z.object({
    prompt: z.string().describe('Detailed prompt describing the song style, genre, mood, or theme'),
  }),
  outputSchema: z.string().describe("The generated song URL")
});

/* ----------  TOOL: create Google Ads campaign (thin proxy) ---------- */
const googleAdsTool = tool({
  description:
    'Create Google Ads campaigns. Only call when the user explicitly asks to create, generate, or make Google Ads, ad campaigns, or advertising campaigns.',
  inputSchema: z.object({
    campaignName: z.string(),
    budgetAmount: z.number(), // dollars-per-day
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(),
    headlines: z.array(z.string()).optional(),
    descriptions: z.array(z.string()).optional(),
    finalUrl: z.string().url().optional(),
  }),

  execute: async (payload, { experimental_context }) => {
    const ctx = experimental_context as {
      customerId?: string;
      managerId?: string;
      refreshToken?: string;
    };

    if (!ctx?.customerId) throw new Error('No customerId provided or found in session');
    if (!ctx?.refreshToken) throw new Error('No refreshToken found in session');

    // Build the body expected by /api/create-google-campaign

    const channelType: 'SEARCH' = 'SEARCH';

    const body = {
      customerId: ctx.customerId,
      refreshToken: ctx.refreshToken,
      managerCustomerId: ctx.managerId || undefined,
      campaignDetails: {
        name: payload.campaignName,
        channelType: channelType,
        budgetMicros: Math.round(payload.budgetAmount * 1_000_000),
        startDate: payload.startDate,
        endDate: payload.endDate,
        ...(channelType === 'SEARCH' && {
          adContent: {
            headlines: payload.headlines,
            descriptions: payload.descriptions,
            finalUrl: payload.finalUrl,
          },
        }),
      },
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/createcampaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google Ads API call failed');

    // Map the route response back to the shape the chat expects
    return {
      success: true,
      campaign: { resourceName: data.campaign.resourceName, name: payload.campaignName },
      budget: { resourceName: data.budget.resourceName },
      adGroup: data.adGroup ? { resourceName: data.adGroup.resourceName } : null,
      message: data.message,
    };
  },
});



/* ----------  TOOL: create Facebook Ads campaign ---------- */
/* ----------  TOOL: create Facebook Ads campaign ---------- */
const facebookAdsTool = tool({
  description:
    'Create Facebook Ads campaigns. Only call when the user explicitly asks to create, generate, or make Facebook Ads, ad campaigns, or advertising campaigns.',
  inputSchema: z.object({
    campaignName: z.string(),
    budgetAmount: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    headlines: z.array(z.string()).optional(),
    descriptions: z.array(z.string()).optional(),
    callToAction: z.enum([
      'SHOP_NOW','SIGN_UP','LEARN_MORE','DOWNLOAD','CONTACT_US',
    ]).optional(),
    finalUrl: z.string().url().optional(),
  }),

  execute: async (payload, { experimental_context }) => {
    const ctx = experimental_context as {
      adAccountId?: string;
      accessToken?: string;
      pageId?: string;
    };

    if (!ctx.adAccountId) throw new Error('No Facebook ad-account ID provided');
    if (!ctx.accessToken) throw new Error('No Facebook access-token provided');

    /*  ⬇️  FORCE “Conversations” objective  */
    const objective = 'OUTCOME_ENGAGEMENT';

    const body = {
      adAccountId: ctx.adAccountId,
      accessToken: ctx.accessToken,
      campaignDetails: { ...payload, objective }, // <-- injected here
      pageId: ctx.pageId,
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/create-facebook-campaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Facebook API call failed');

    return {
      success: true,
      campaign: { id: data.campaignId, name: payload.campaignName },
      adSet:   { id: data.adSetId },
      ad:      data.adId ? { id: data.adId } : null,
      message: data.message,
    };
  },
});

/* ----------  TOOL: create YouTube Ads campaign  ---------- */
const youtubeAdsTool = tool({
  description:
    'Create YouTube Ads campaigns. Only call when the user explicitly asks to create, generate, or make YouTube Ads, video campaigns, or video advertising campaigns.',
  inputSchema: z.object({
    campaignName: z.string(),
    budgetAmount: z.number(), // dollars-per-day
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(),
    youtubeVideoUrl: z.string().url(), // full YouTube url
    businessName: z.string(), // will be shown in the ad
    headlines: z.array(z.string()).min(3), // at least 3
    longHeadlines: z.array(z.string()).min(1), // at least 1
    descriptions: z.array(z.string()).min(2), // at least 2
    logoImageUrl: z.string().url(), // publicly reachable image used as logo
  }),

  execute: async (payload, { experimental_context }) => {
    const ctx = experimental_context as {
      customerId?: string;
      managerId?: string;
      refreshToken?: string;
    };

    if (!ctx?.customerId) throw new Error('No customerId provided or found in session');
    if (!ctx?.refreshToken) throw new Error('No refreshToken found in session');

    // Build the body expected by /api/createcampaign
    const body = {
      customerId: ctx.customerId,
      refreshToken: ctx.refreshToken,
      managerCustomerId: ctx.managerId || undefined,
      campaignDetails: {
        name: payload.campaignName,
        budgetMicros: Math.round(payload.budgetAmount * 1_000_000),
        startDate: payload.startDate,
        endDate: payload.endDate,
        youtubeVideoUrl: payload.youtubeVideoUrl,
        businessName: payload.businessName,
      },
      adContent: {
        imageUrl: payload.logoImageUrl,
        headlines: payload.headlines,
        longHeadlines: payload.longHeadlines,
        descriptions: payload.descriptions,
      },
    };

    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/createyoutubecampaign`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'YouTube Ads API call failed');

    return {
      success: true,
      campaign: { resourceName: data.campaignResourceName, name: payload.campaignName },
      budget: { resourceName: data.budgetResourceName },
      adGroup: { resourceName: data.adGroupResourceName },
      ad: { resourceName: data.adResourceName },
      message: data.message,
    };
  },
});




/* ----------  TOOL: create an IntelliVerse-X ad campaign  ---------- */
const adCampaignTool = tool({
  description:
    'Create an advertising campaign on IntelliVerse-X. ' +
    'The user only needs to supply a title and description. ' +
    'If the user has uploaded a video you may pass its URL as videoUrl, otherwise omit it. ' +
    'Hard-code budget=9000 USD, and use sensible default dates (7-day window starting today) ' +
    'and a default machineId ("24") if the user does not provide his own.',
  inputSchema: z.object({
    title: z.string(),
    description: z.string(),
    machineId: z.string().optional(),
    startDate: z.string().optional(), // ISO-string
    endDate: z.string().optional(),
    budget: z.number().optional(), // we’ll hard-code 9000
    videoUrl: z.string().optional(),
  }),

  execute: async ({ title, description, machineId, startDate, endDate, budget, videoUrl }, { experimental_context}) => {
    // 1. Grab the bearer token that the front-end supplied
      const ctx = experimental_context as {
      accessToken?: string;
    };
   ;
    // 2. Defaults
    const now = new Date();
    const defaultStart = new Date(now);
    const defaultEnd = new Date(now);
    defaultEnd.setDate(defaultEnd.getDate() + 7);

    const finalBudget = budget ?? 9000;
    const finalMachine = machineId ?? '24';
    const finalStart = startDate ?? defaultStart.toISOString();
    const finalEnd = endDate ?? defaultEnd.toISOString();

    // 3. Build media array if a video was provided
    const media: any[] = [];
    if (videoUrl) {
      media.push({
        mediaType: 'video',
        mediaUrl: videoUrl,
        metadata: { size: 696690, type: 'video/mp4' },
      });
    }

    // 4. Create the campaign
    const campaignData = {
      title,
      description,
      machineId: finalMachine,
      startDate: finalStart,
      endDate: finalEnd,
      amount: finalBudget,
      media,
    };

     console.log(campaignData,ctx.accessToken)

    const res = await axios.post(
      'https://api.intelli-verse-x.ai/api/user/ad-management',
      campaignData,
      {
        headers: {
          Authorization: `Bearer ${ctx.accessToken}`,
          'Content-Type': 'application/json',
          accept: 'application/json',
        },
      }
    );

    

    return { success: true, campaignId: res.data.id, message: 'Campaign created' };
  },
});

/* ----------  TOOL: create an ad campaign  ---------- */





const tools = { 
  generateImage: imageGenTool,
  generateVideo: videoGenTool,
  generate3DModel: model3dGenTool,
  imageEnhancer: imageEnhanceTool,
  imagetoVideo: imagetovideoGenTool,
  generateSong: songGenTool,
  createGoogleAdsCampaign: googleAdsTool, // Add this line
  createFacebookAdsCampaign: facebookAdsTool, // <-- 
  createYouTubeAdsCampaign: youtubeAdsTool, // <-- NEW
  createIntelliverseCampaign: adCampaignTool,
  faceSwap: faceSwapTool, // <-- NEW
};

export const maxDuration = 300; // Increase for longer generations

export async function POST(req: Request) {
   

  
  const { messages, id, googleAds, facebookAds, intelliverseToken  }: {
    messages: UIMessage[];
    id: string;
    googleAds: any;
    facebookAds: any;
    intelliverseToken: any;
  } = await req.json();

  console.log(googleAds,facebookAds,intelliverseToken)


  const result = streamText({
    model: groq('llama-3.3-70b-versatile'),
   // In your POST function, update the system prompt:
system: `You are a helpful assistant. 
Only invoke the "generateImage" tool when the user explicitly asks to create/draw/generate/paint an image.
Only invoke the "imageEnhancer" tool when the user explicitly asks to edit/modify/update an image
Only invoke the "imagetoVideo" tool when the user explicitly asks to create, generate, or make a video from an image, image-to-video, or img2vid.
Only invoke the "generateVideo" tool when the user explicitly asks to create/generate/make a video or animation.
Only invoke the "generate3DModel" tool when the user explicitly asks to create/generate/make a 3D model, 3D object, or 3D asset.
Only invoke the "generateSong" tool when the user explicitly asks to create/generate/make music, song, or audio.
Only invoke the "faceSwap" tool when the user explicitly asks to faceswap / face-swap or says something like "put this face on that person".
Only invoke the "createGoogleAdsCampaign" tool when the user explicitly asks to create, generate, or make Google Ads, ad campaigns, or advertising campaigns.

For the "faceSwap" tool:
- The **first** uploaded image is treated as the **target** (the picture whose face will be replaced).
- The **second** uploaded image is treated as the **swap** (the face to insert).
- If fewer than two images are provided, ask the user to upload exactly two images before you call the tool.


For the "createGoogleAdsCampaign" tool:
- Required parameters: campaignName, budgetAmount, startDate, endDate
- For SEARCH campaigns, also provide headlines, descriptions, and finalUrl
- Dates must be in YYYY-MM-DD format
- Budget amount is in dollars per day
- customerId and managerCustomerId are already provided in context – **do NOT ask the user for them**

For the "createFacebookAdsCampaign" tool:                                                                                 // <-- NEW block
- Required parameters: campaignName,  budgetAmount, startDate, endDate
- Optional: headlines, descriptions, finalUrl, callToAction
- Dates must be in YYYY-MM-DD format
- Budget amount is in dollars per day
- adAccountId, accessToken and pageId are already provided in context – **do NOT ask the user for them**

Only invoke the "createYouTubeAdsCampaign" tool when the user explicitly asks to create, generate, or make YouTube Ads, video campaigns, or video advertising campaigns.
- Required parameters: campaignName, budgetAmount, startDate, endDate, youtubeVideoUrl, businessName, headlines, longHeadlines, descriptions, logoImageUrl
- Dates must be in YYYY-MM-DD format
- Budget amount is in dollars per day
- customerId and managerCustomerId are already provided in context – **do NOT ask the user for them**

Only invoke the "createIntelliverseCampaign" tool when the user explicitly asks to create, generate, or make an ad campaign on IntelliVerse-X.
- Required parameters: title, description
- Optional: videoUrl (if the user has uploaded a video you may pass its URL, otherwise omit it)
- Optionsal: machineId ( if the user has passed machineId then use that machineId or use use machineId = 24 by default  )
- Budget is automatically set to 9000 USD, dates to a 7-day window starting today**



Otherwise just reply conversationally.

If the user provides an image, you can use it as a reference for generating a new image by invoking "generateImage" tool or answering questions about it.
`,
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(5),
    tools,
    experimental_context: { ...googleAds, ...facebookAds, ...intelliverseToken },
  });

  return result.toUIMessageStreamResponse();
}
