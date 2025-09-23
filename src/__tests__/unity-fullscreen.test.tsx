import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PlayGamePage from '../app/(public)/play/[id]/page';

// Mock the external dependencies
jest.mock('next/navigation', () => ({
  useParams: () => ({ id: 'test-game' }),
  useRouter: () => ({
    back: jest.fn(),
    push: jest.fn(),
    replace: jest.fn(),
  }),
}));

jest.mock('../hooks/useAuthState', () => ({
  useAuthState: () => ({ token: 'test-token' }),
}));

jest.mock('../data/arena', () => ({
  ARENA_EVENTS: [
    {
      id: 'test-game',
      title: 'Test Unity Game',
      externalGameUrl: 'https://example.com/unity-game',
      requiresOAuth: false,
    },
  ],
}));

// Mock iframe document access for Unity button testing
const mockUnityButton = {
  click: jest.fn(),
};

const mockIframeDoc = {
  getElementById: jest.fn((id) => {
    if (id === 'unity-fullscreen-button') {
      return mockUnityButton;
    }
    return null;
  }),
};

describe('Unity Fullscreen Button Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset console.log calls
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should attempt to find and click Unity fullscreen button on iframe load', async () => {
    const { container } = render(<PlayGamePage />);
    
    // Find the iframe
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();

    // Mock iframe content access
    Object.defineProperty(iframe, 'contentDocument', {
      value: mockIframeDoc,
      writable: true,
    });

    // Simulate iframe load event
    const loadEvent = new Event('load');
    iframe?.dispatchEvent(loadEvent);

    // Wait for the setTimeout delays in the component
    await waitFor(() => {
      expect(mockIframeDoc.getElementById).toHaveBeenCalledWith('unity-fullscreen-button');
    }, { timeout: 6000 });

    // Verify Unity button was clicked
    expect(mockUnityButton.click).toHaveBeenCalled();
    expect(console.log).toHaveBeenCalledWith('Found Unity fullscreen button, clicking...');
  });

  it('should handle cross-origin iframe access gracefully', async () => {
    const { container } = render(<PlayGamePage />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();

    // Mock cross-origin error
    Object.defineProperty(iframe, 'contentDocument', {
      get: () => {
        throw new Error('SecurityError: Cross-origin access denied');
      },
    });

    // Simulate iframe load event
    const loadEvent = new Event('load');
    iframe?.dispatchEvent(loadEvent);

    // Wait and verify error handling
    await waitFor(() => {
      expect(console.log).toHaveBeenCalledWith(
        'Unity fullscreen button access failed (likely cross-origin):',
        expect.any(Error)
      );
    }, { timeout: 2000 });
  }, 10000);

  it('should fallback to other fullscreen methods when Unity button not found', async () => {
    const { container } = render(<PlayGamePage />);
    
    const iframe = container.querySelector('iframe');
    expect(iframe).toBeInTheDocument();

    // Mock iframe document without Unity button
    const mockEmptyDoc = {
      getElementById: jest.fn(() => null),
    };

    Object.defineProperty(iframe, 'contentDocument', {
      value: mockEmptyDoc,
      writable: true,
    });

    // Mock iframe contentWindow for postMessage fallback
    const mockContentWindow = {
      postMessage: jest.fn(),
    };

    Object.defineProperty(iframe, 'contentWindow', {
      value: mockContentWindow,
      writable: true,
    });

    // Simulate iframe load event
    const loadEvent = new Event('load');
    iframe?.dispatchEvent(loadEvent);

    // Wait for the logic to execute
    await waitFor(() => {
      expect(mockEmptyDoc.getElementById).toHaveBeenCalledWith('unity-fullscreen-button');
    }, { timeout: 6000 });

    // Verify fallback to postMessage was attempted
    await waitFor(() => {
      expect(mockContentWindow.postMessage).toHaveBeenCalledWith(
        {
          type: 'TRIGGER_FULLSCREEN',
          action: 'enterFullscreen',
        },
        '*'
      );
    }, { timeout: 6000 });
  });
});