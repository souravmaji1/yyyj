export interface AppError extends Error {
  kind: "Network" | "Auth" | "Validation" | "RateLimit" | "NotFound" | "Unknown";
  statusCode?: number;
  retryable?: boolean;
  cause?: Error;
}

export function createAppError(
  kind: AppError["kind"],
  message: string,
  options?: {
    statusCode?: number;
    retryable?: boolean;
    cause?: Error;
  }
): AppError {
  const error = new Error(message) as AppError;
  error.kind = kind;
  error.statusCode = options?.statusCode;
  error.retryable = options?.retryable;
  error.cause = options?.cause;
  return error;
}

export async function safeFetch(
  input: RequestInfo,
  init: (RequestInit & { timeoutMs?: number }) = {}
) {
  const { timeoutMs = 10000, ...rest } = init;
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), timeoutMs);
  
  try {
    const res = await fetch(input, { ...rest, signal: ctrl.signal });
    if (!res.ok) {
      throw createAppError(
        res.status >= 500 ? "Network" : "Validation",
        `HTTP ${res.status}`,
        { statusCode: res.status, retryable: res.status >= 500 }
      );
    }
    return res;
  } catch (e: any) {
    if (e.name === 'AbortError') {
      throw createAppError("Network", "Request timeout", { 
        statusCode: 408, 
        retryable: true, 
        cause: e 
      });
    }
    if (e instanceof Error && 'kind' in e) {
      throw e; // Already an AppError
    }
    throw createAppError("Network", e?.message || "Fetch failed", { 
      retryable: true, 
      cause: e 
    });
  } finally {
    clearTimeout(id);
  }
}