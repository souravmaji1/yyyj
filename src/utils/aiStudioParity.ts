/**
 * AI Studio Parity Utils
 * Utilities to verify that ai-studio and ai-studio-3 make identical backend calls
 */

export interface APICallMetadata {
  url: string;
  method: string;
  timestamp: number;
  source: 'ai-studio' | 'ai-studio-3';
  params?: any;
  headers?: Record<string, string>;
}

// Track API calls for parity comparison
const apiCallLog: APICallMetadata[] = [];

export const logAPICall = (metadata: APICallMetadata) => {
  if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
    apiCallLog.push(metadata);
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔍 API Call from ${metadata.source}:`, {
        url: metadata.url,
        method: metadata.method,
        params: metadata.params,
        timestamp: new Date(metadata.timestamp).toISOString()
      });
    }
  }
};

export const compareAPICalls = (source1: 'ai-studio' | 'ai-studio-3', source2: 'ai-studio' | 'ai-studio-3') => {
  const calls1 = apiCallLog.filter(call => call.source === source1);
  const calls2 = apiCallLog.filter(call => call.source === source2);
  
  const differences = [];
  
  // Check if same number of calls
  if (calls1.length !== calls2.length) {
    differences.push(`Different number of API calls: ${source1}=${calls1.length}, ${source2}=${calls2.length}`);
  }
  
  // Compare call patterns
  for (let i = 0; i < Math.min(calls1.length, calls2.length); i++) {
    const call1 = calls1[i];
    const call2 = calls2[i];
    
    if (call1 && call2) {
      if (call1.url !== call2.url) {
        differences.push(`URL mismatch at call ${i}: ${call1.url} vs ${call2.url}`);
      }
      
      if (call1.method !== call2.method) {
        differences.push(`Method mismatch at call ${i}: ${call1.method} vs ${call2.method}`);
      }
    }
  }
  
  return {
    identical: differences.length === 0,
    differences,
    calls1,
    calls2
  };
};

export const clearAPICallLog = () => {
  apiCallLog.length = 0;
};

// Metrics for observability
export const getParityMetrics = () => {
  const studioCalls = apiCallLog.filter(call => call.source === 'ai-studio').length;
  const studio3Calls = apiCallLog.filter(call => call.source === 'ai-studio-3').length;
  
  return {
    'ai_studio.api_calls.count': studioCalls,
    'ai_studio3.api_calls.count': studio3Calls,
    'ai_studio3.parity.mismatch': studioCalls !== studio3Calls ? 1 : 0
  };
};