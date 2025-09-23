import { NextRequest, NextResponse } from "next/server";
import { ivxGetProducts } from "@/lib/ivx-fetchers";
import { withError } from "@/src/lib/withError";
import { createAppError } from "@/src/lib/safeFetch";

async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kind = searchParams.get("kind") as "video" | "event" | null;
  const id = searchParams.get("id");

  // Validate required parameters
  if (!kind || !id) {
    throw createAppError(
      "Validation",
      "Missing required parameters: kind and id",
      { statusCode: 400 }
    );
  }

  // Validate kind parameter
  if (kind !== "video" && kind !== "event") {
    throw createAppError(
      "Validation",
      "Invalid kind parameter. Must be 'video' or 'event'",
      { statusCode: 400 }
    );
  }

  // Fetch products using our mock fetcher
  const products = await ivxGetProducts(kind, id);

  return NextResponse.json(products);
}

export const GET = withError(handler);