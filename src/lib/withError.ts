import { NextRequest, NextResponse } from "next/server";
import { log } from "@/src/lib/log";
import { AppError } from "@/src/lib/safeFetch";

export type Handler = (req: NextRequest) => Promise<Response> | Response;

export function withError(handler: Handler): Handler {
  return async (req) => {
    try {
      return await handler(req);
    } catch (e: any) {
      // Log the error with appropriate details
      const errorDetails = {
        message: e?.message,
        kind: e?.kind || "Unknown",
        statusCode: e?.statusCode,
        stack: process.env.NODE_ENV === "development" ? e?.stack : undefined,
        url: req.url,
        method: req.method
      };
      
      log.error("route_exception", errorDetails);
      
      // Return appropriate error response based on error type
      if (e?.kind === "Validation") {
        return NextResponse.json(
          { 
            error: e.message || "Validation failed",
            kind: e.kind
          }, 
          { status: e.statusCode || 400 }
        );
      }
      
      if (e?.kind === "Auth") {
        return NextResponse.json(
          { 
            error: "Authentication required",
            kind: e.kind
          }, 
          { status: e.statusCode || 401 }
        );
      }
      
      if (e?.kind === "NotFound") {
        return NextResponse.json(
          { 
            error: "Resource not found",
            kind: e.kind
          }, 
          { status: e.statusCode || 404 }
        );
      }
      
      if (e?.kind === "RateLimit") {
        return NextResponse.json(
          { 
            error: "Rate limit exceeded",
            kind: e.kind,
            retryable: true
          }, 
          { status: e.statusCode || 429 }
        );
      }
      
      // Default to internal server error
      return NextResponse.json(
        { 
          error: "Internal Server Error",
          kind: "Unknown"
        }, 
        { status: 500 }
      );
    }
  };
}