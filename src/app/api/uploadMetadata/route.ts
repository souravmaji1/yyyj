// app/api/mint/route.ts   (or pages/api/mint.ts)
import { NextResponse } from 'next/server';
import { pinJSONToFolder } from '../../../lib/pinata';



export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, description, image, animation_url, attributes } = body;

    // 1. build the metadata object
    const metadata = {
      name,
      description,
      image,
      animation_url,
      attributes: attributes ?? [],
    };

    // 2. upload it into a folder
    const folderCid = await pinJSONToFolder('metadata.json', metadata);

    // 3. build the token-uri
    const uri = `ipfs://${folderCid}/metadata.json`;

    
    return NextResponse.json({ uri });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}