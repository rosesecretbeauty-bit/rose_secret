/**
 * Utility functions for product-related operations
 */

/**
 * Get the primary image for a product, with fallback
 */
export function getProductImage(images?: string[]): string {
  if (images && images.length > 0 && images[0]) {
    return images[0];
  }
  // Fallback to a placeholder or default image
  return '/placeholder-product.png';
}

/**
 * Get all images for a product, ensuring at least one fallback
 */
export function getProductImages(images?: string[]): string[] {
  if (images && images.length > 0) {
    return images;
  }
  return ['/placeholder-product.png'];
}

