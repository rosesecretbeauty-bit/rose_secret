// ============================================
// SEO Utilities
// ============================================

/**
 * Actualizar título de la página
 */
export function setPageTitle(title: string) {
  document.title = title ? `${title} | Rose Secret` : 'Rose Secret - Luxury Beauty & Fragrance';
}

/**
 * Actualizar meta description
 */
export function setMetaDescription(description: string) {
  let meta = document.querySelector('meta[name="description"]');
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', 'description');
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', description);
}

/**
 * Actualizar meta tags para Open Graph
 */
export function setOpenGraphTags({
  title,
  description,
  image,
  url
}: {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}) {
  if (title) {
    setMetaTag('og:title', title);
  }
  if (description) {
    setMetaTag('og:description', description);
  }
  if (image) {
    setMetaTag('og:image', image);
  }
  if (url) {
    setMetaTag('og:url', url);
  }
  setMetaTag('og:type', 'website');
}

/**
 * Helper para establecer meta tags
 */
function setMetaTag(property: string, content: string) {
  let meta = document.querySelector(`meta[property="${property}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.appendChild(meta);
  }
  meta.setAttribute('content', content);
}

/**
 * Limpiar meta tags de Open Graph
 */
export function clearOpenGraphTags() {
  const ogTags = ['og:title', 'og:description', 'og:image', 'og:url', 'og:type'];
  ogTags.forEach(tag => {
    const meta = document.querySelector(`meta[property="${tag}"]`);
    if (meta) {
      meta.remove();
    }
  });
}

