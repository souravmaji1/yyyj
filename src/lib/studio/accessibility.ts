// ARIA labels and accessibility helpers for AI Studio

export const ARIA_LABELS = {
  // Header
  globalSearch: 'Search assets, templates, and tools',
  notifications: 'View notifications',
  marketplace: 'Browse marketplace',
  walletBalance: 'Your XUT token balance',
  userProfile: 'User profile menu',
  
  // Mode Navigation
  modeChips: 'Switch between creation modes',
  imageMode: 'Image generation and editing mode',
  videoMode: 'Video and advertisement creation mode',
  threeDMode: '3D model generation and editing mode',
  musicMode: 'Music creation and editing mode',
  productMode: 'Product design and mockup mode',
  nftMode: 'NFT minting and marketplace mode',
  
  // Panels
  assetSidebar: 'Asset library and file uploads',
  canvas: 'Main workspace canvas',
  assistantPanel: 'AI assistant and task automation',
  propertiesPanel: 'Selected item properties and settings',
  marketplacePanel: 'Templates and marketplace items',
  
  // Canvas Controls
  zoomIn: 'Zoom in on canvas',
  zoomOut: 'Zoom out on canvas',
  resetZoom: 'Reset canvas zoom to 100%',
  fullscreen: 'Toggle fullscreen mode',
  
  // Timeline Controls (Video/Audio)
  playPause: 'Play or pause timeline',
  seek: 'Seek to position in timeline',
  volume: 'Adjust volume',
  mute: 'Mute audio',
  
  // Wallet
  addTokens: 'Add XUT tokens to your wallet',
  viewUsage: 'View usage statistics',
  transactionHistory: 'View transaction history',
  
  // Export & Mint
  exportDialog: 'Export your creation',
  mintNFT: 'Mint creation as NFT',
  socialExport: 'Export for social media',
  printExport: 'Export for print',
  
  // Actions
  generateContent: 'Generate new content using AI',
  uploadFile: 'Upload file from device',
  deleteItem: 'Delete selected item',
  duplicateItem: 'Duplicate selected item',
  
  // Form Controls
  promptInput: 'Enter description or prompt for AI generation',
  fileInput: 'Select files to upload',
  colorPicker: 'Select color',
  slider: 'Adjust value',
} as const;

// Keyboard shortcuts
export const KEYBOARD_SHORTCUTS = {
  // Global
  save: 'Ctrl+S',
  undo: 'Ctrl+Z',
  redo: 'Ctrl+Y',
  search: 'Ctrl+K',
  
  // Canvas
  zoomIn: 'Ctrl+=',
  zoomOut: 'Ctrl+-',
  resetZoom: 'Ctrl+0',
  fullscreen: 'F',
  
  // Timeline
  playPause: 'Space',
  seekForward: 'ArrowRight',
  seekBackward: 'ArrowLeft',
  
  // Panels
  toggleLeftPanel: 'Ctrl+1',
  toggleRightPanel: 'Ctrl+3',
  assistant: 'Ctrl+Shift+A',
  properties: 'Ctrl+Shift+P',
  marketplace: 'Ctrl+Shift+M',
  
  // Modes
  imageMode: '1',
  videoMode: '2',
  threeDMode: '3',
  musicMode: '4',
  productMode: '5',
  nftMode: '6',
} as const;

// Focus management utilities
export class FocusManager {
  private static trapStack: HTMLElement[] = [];
  
  static trapFocus(element: HTMLElement) {
    this.trapStack.push(element);
    this.setTabIndex(element);
  }
  
  static releaseFocus() {
    this.trapStack.pop();
    if (this.trapStack.length > 0) {
      const lastElement = this.trapStack[this.trapStack.length - 1];
      if (lastElement) {
        this.setTabIndex(lastElement);
      }
    }
  }
  
  private static setTabIndex(container: HTMLElement) {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    focusableElements.forEach((el, index) => {
      (el as HTMLElement).tabIndex = index === 0 ? 0 : -1;
    });
    
    (focusableElements[0] as HTMLElement)?.focus();
  }
}

// Announce changes for screen readers
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcer = document.createElement('div');
  announcer.setAttribute('aria-live', priority);
  announcer.setAttribute('aria-atomic', 'true');
  announcer.className = 'sr-only';
  announcer.textContent = message;
  
  document.body.appendChild(announcer);
  
  setTimeout(() => {
    document.body.removeChild(announcer);
  }, 1000);
}

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}