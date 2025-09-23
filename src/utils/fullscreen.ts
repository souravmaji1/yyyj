/**
 * Cross-browser fullscreen API utility
 * Provides consistent interface for fullscreen operations across different browsers
 */

export const FS = {
  /**
   * Get the current fullscreen element
   */
  el(): Element | null {
    return (
      document.fullscreenElement ||
      (document as any).webkitFullscreenElement ||
      (document as any).mozFullScreenElement ||
      (document as any).msFullscreenElement ||
      null
    );
  },

  /**
   * Check if fullscreen is supported
   */
  isSupported(): boolean {
    return !!(
      document.exitFullscreen ||
      (document as any).webkitExitFullscreen ||
      (document as any).mozCancelFullScreen ||
      (document as any).msExitFullscreen
    );
  },

  /**
   * Check if currently in fullscreen mode
   */
  isActive(): boolean {
    return !!this.el();
  },

  /**
   * Enter fullscreen mode for the given target element
   */
  async enter(target: Element): Promise<void> {
    if (!target || this.isActive()) return;

    try {
      if (target.requestFullscreen) {
        await target.requestFullscreen();
      } else if ((target as any).webkitRequestFullscreen) {
        await (target as any).webkitRequestFullscreen();
      } else if ((target as any).mozRequestFullScreen) {
        await (target as any).mozRequestFullScreen();
      } else if ((target as any).msRequestFullscreen) {
        await (target as any).msRequestFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen request failed:', error);
      throw error;
    }
  },

  /**
   * Exit fullscreen mode
   */
  async exit(): Promise<void> {
    if (!this.isActive()) return;

    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen();
      } else if ((document as any).mozCancelFullScreen) {
        await (document as any).mozCancelFullScreen();
      } else if ((document as any).msExitFullscreen) {
        await (document as any).msExitFullscreen();
      }
    } catch (error) {
      console.warn('Fullscreen exit failed:', error);
      throw error;
    }
  },

  /**
   * Toggle fullscreen mode for the given target element
   */
  async toggle(target: Element): Promise<boolean> {
    if (this.isActive()) {
      await this.exit();
      return false;
    } else {
      await this.enter(target);
      return true;
    }
  },

  /**
   * Add event listener for fullscreen changes
   */
  onChange(callback: () => void): () => void {
    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange'
    ];

    events.forEach(event => {
      document.addEventListener(event, callback);
    });

    // Return cleanup function
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, callback);
      });
    };
  }
};