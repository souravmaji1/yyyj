// Feature flags (default OFF for safety)
export const FF_DYNAMIC_CHARTS = process.env.NEXT_DYNAMIC_CHARTS === "1";
export const FF_SAFE_FETCH_CACHING = process.env.NEXT_SAFE_FETCH_CACHING === "1";
export const FF_AI_STUDIO3_PARITY = process.env.NEXT_PUBLIC_FF_AI_STUDIO3_PARITY === "1";