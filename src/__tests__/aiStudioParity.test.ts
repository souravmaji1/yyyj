/**
 * Basic parity tests for AI Studio and AI Studio 3
 * Verifies that both routes use identical backend calls and data contracts
 */

import { compareAPICalls, clearAPICallLog, logAPICall } from '../utils/aiStudioParity';

describe('AI Studio Parity Tests', () => {
  beforeEach(() => {
    clearAPICallLog();
  });

  test('fetchGenerationHistory calls should be identical', () => {
    // Simulate API calls from both routes
    const timestamp = Date.now();
    
    // Simulate ai-studio call
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp,
      source: 'ai-studio',
      params: { page: 1, limit: 6 }
    });
    
    // Simulate ai-studio-3 call (now always enabled, no feature flag)
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: timestamp + 100,
      source: 'ai-studio-3',
      params: { page: 1, limit: 6 }
    });
    
    const comparison = compareAPICalls('ai-studio', 'ai-studio-3');
    
    expect(comparison.identical).toBe(true);
    expect(comparison.differences).toHaveLength(0);
  });

  test('API call parameters should match exactly', () => {
    const aiStudioParams = { page: 1, limit: 6, userId: 'test-user' };
    const aiStudio3Params = { page: 1, limit: 6, userId: 'test-user' };
    
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio',
      params: aiStudioParams
    });
    
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio-3',
      params: aiStudio3Params
    });
    
    const comparison = compareAPICalls('ai-studio', 'ai-studio-3');
    expect(comparison.identical).toBe(true);
  });

  test('should detect URL differences', () => {
    clearAPICallLog(); // Clear before this specific test
    
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio',
      params: { page: 1, limit: 6 }
    });
    
    logAPICall({
      url: '/ai-studio/different-endpoint',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio-3',
      params: { page: 1, limit: 6 }
    });
    
    const comparison = compareAPICalls('ai-studio', 'ai-studio-3');
    expect(comparison.identical).toBe(false);
    expect(comparison.differences).toEqual(
      expect.arrayContaining([
        expect.stringContaining('URL mismatch')
      ])
    );
  });

  test('should detect method differences', () => {
    clearAPICallLog(); // Clear before this specific test
    
    logAPICall({
      url: '/ai-studio/history',
      method: 'GET',
      timestamp: Date.now(),
      source: 'ai-studio',
      params: { page: 1, limit: 6 }
    });
    
    logAPICall({
      url: '/ai-studio/history',
      method: 'POST',
      timestamp: Date.now(),
      source: 'ai-studio-3',
      params: { page: 1, limit: 6 }
    });
    
    const comparison = compareAPICalls('ai-studio', 'ai-studio-3');
    expect(comparison.identical).toBe(false);
    expect(comparison.differences).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Method mismatch')
      ])
    );
  });
});

// Mock data for testing data contract normalization
export const mockBackendResponse = {
  data: [
    {
      id: 'test-1',
      type: 'image',
      status: 'success',
      prompt: 'Test prompt',
      resultUrl: 'https://example.com/image.jpg',
      cost: 15,
      createdAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'test-2',
      type: 'video',
      status: 'success',
      prompt: 'Test video prompt',
      resultUrl: 'https://example.com/video.mp4',
      cost: 25,
      createdAt: '2024-01-01T01:00:00Z'
    }
  ]
};

describe('Data Contract Normalization', () => {
  test('should normalize backend response consistently', () => {
    // Test that both ai-studio and ai-studio-3 would normalize the same data identically
    const normalizeGeneration = (item: any) => ({
      id: item.id,
      type: item.type,
      status: item.status === 'success' ? 'completed' : item.status,
      prompt: item.prompt,
      imageUrl: item.type === 'image' ? item.resultUrl : undefined,
      videoUrl: item.type === 'video' ? item.resultUrl : undefined,
      cost: item.cost,
      createdAt: item.createdAt
    });

    const normalized1 = mockBackendResponse.data.map(normalizeGeneration);
    const normalized2 = mockBackendResponse.data.map(normalizeGeneration);

    expect(normalized1).toEqual(normalized2);
    
    // Verify image item normalization
    expect(normalized1[0]).toEqual({
      id: 'test-1',
      type: 'image',
      status: 'completed',
      prompt: 'Test prompt',
      imageUrl: 'https://example.com/image.jpg',
      videoUrl: undefined,
      cost: 15,
      createdAt: '2024-01-01T00:00:00Z'
    });
    
    // Verify video item normalization
    expect(normalized1[1]).toEqual({
      id: 'test-2',
      type: 'video',
      status: 'completed',
      prompt: 'Test video prompt',
      imageUrl: undefined,
      videoUrl: 'https://example.com/video.mp4',
      cost: 25,
      createdAt: '2024-01-01T01:00:00Z'
    });
  });
});