/**
 * Utility functions for image optimization and lazy loading
 */

// Generate a tiny placeholder for blur-up effect (simulated)
export const getBlurDataURL = (width: number = 10, height: number = 10) => {
  return `data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${width} ${height}'%3E%3Cfilter id='b' color-interpolation-filters='sRGB'%3E%3CfeGaussianBlur stdDeviation='20'/%3E%3C/filter%3E%3Crect preserveAspectRatio='none' filter='url(%23b)' x='0' y='0' height='100%25' width='100%25' stroke-width='0' stroke='none' fill='%23f3f4f6'/%3E%3C/svg%3E`;
};

// Check if WebP is supported
export const isWebPSupported = (): Promise<boolean> => {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const result = img.width > 0 && img.height > 0;
      resolve(result);
    };
    img.onerror = () => {
      resolve(false);
    };
    img.src = 'data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA';
  });
};

// Generate srcset for responsive images
export const generateSrcSet = (src: string): string => {
  // In a real app, this would point to an image service like Cloudinary or Imgix
  // For now, we'll just return the original src as we are using mock data/external URLs
  // Example of what it would look like:
  // return `${src}?w=320 320w, ${src}?w=640 640w, ${src}?w=1024 1024w`
  return '';
};

// Preload critical images
export const preloadImage = (src: string) => {
  const link = document.createElement('link');
  link.rel = 'preload';
  link.as = 'image';
  link.href = src;
  document.head.appendChild(link);
};