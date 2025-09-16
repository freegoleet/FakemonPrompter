// Utility functions for screen-related calculations

/**
 * Returns the current screen width.
 */
export function getScreenWidth(): number {
  return window.innerWidth;
}

/**
 * Returns the current screen height.
 */
export function getScreenHeight(): number {
  return window.innerHeight;
}

/**
 * Checks if the screen is considered mobile size.
 * @param maxWidth - The maximum width for mobile (default: 768px)
 */
export function isMobileScreen(maxWidth: number = 768): boolean {
  return window.innerWidth <= maxWidth;
}

/**
 * Adds a resize event listener and returns a cleanup function.
 * @param callback - Function to call on resize
 */
export function onScreenResize(callback: () => void): () => void {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}
