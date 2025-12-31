// ============================================
// Cache Keys - Normalizadas
// ============================================
// Sistema de keys normalizadas para evitar errores

/**
 * Construir key de cache normalizada
 */
function buildKey(parts) {
  return parts
    .filter(p => p !== null && p !== undefined)
    .map(p => String(p).replace(/:/g, '_'))
    .join(':');
}

/**
 * Keys para productos
 */
const productKeys = {
  /**
   * Lista de productos
   */
  list: (filters = {}) => {
    const { category, search, page = 1, limit = 20, apiVersion = 1 } = filters;
    return buildKey([
      'products',
      'list',
      `category=${category || 'all'}`,
      `search=${search || 'none'}`,
      `page=${page}`,
      `limit=${limit}`,
      `v${apiVersion}`
    ]);
  },
  
  /**
   * Detalle de producto
   */
  detail: (id, apiVersion = 1) => {
    return buildKey(['products', 'detail', `id=${id}`, `v${apiVersion}`]);
  },
  
  /**
   * Variantes de producto
   */
  variants: (productId, apiVersion = 1) => {
    return buildKey(['products', 'variants', `productId=${productId}`, `v${apiVersion}`]);
  },
  
  /**
   * Patrones para invalidar (compatibles con regex en delPattern)
   */
  pattern: {
    all: '^products:.*', // Invalida todos los productos
    list: '^products:list:.*', // Invalida todas las listas
    detail: '^products:detail:.*', // Invalida todos los detalles
    variants: '^products:variants:.*' // Invalida todas las variantes
  }
};

/**
 * Keys para categorías
 */
const categoryKeys = {
  /**
   * Lista de categorías
   */
  list: (apiVersion = 1) => {
    return buildKey(['categories', 'list', `v${apiVersion}`]);
  },
  
  /**
   * Patrones para invalidar categorías (compatibles con regex en delPattern)
   */
  pattern: {
    all: '^categories:.*' // Invalida todas las categorías
  }
};

/**
 * Keys para home/dashboard
 */
const homeKeys = {
  /**
   * Home page data
   */
  data: (apiVersion = 1) => {
    return buildKey(['home', 'data', `v${apiVersion}`]);
  },
  
  /**
   * Patrones para invalidar home (compatibles con regex en delPattern)
   */
  pattern: {
    all: '^home:.*' // Invalida todos los datos de home
  }
};

/**
 * Keys para admin (con usuario)
 */
const adminKeys = {
  /**
   * Lista de productos admin
   */
  productsList: (userId, apiVersion = 1) => {
    return buildKey(['admin', 'products', 'list', `user=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Lista de órdenes admin
   */
  ordersList: (userId, apiVersion = 1) => {
    return buildKey(['admin', 'orders', 'list', `user=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Patrones para invalidar admin (compatibles con regex en delPattern)
   */
  pattern: {
    all: '^admin:.*', // Invalida todo el cache admin
    products: '^admin:products:.*', // Invalida cache de productos admin
    orders: '^admin:orders:.*' // Invalida cache de órdenes admin
  }
};

/**
 * Keys para datos específicos de usuario (cache aislado)
 */
const userSpecificKeys = {
  /**
   * Carrito de usuario
   */
  cart: (userId, apiVersion = 1) => {
    return buildKey(['user', 'cart', `userId=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Wishlist de usuario
   */
  wishlist: (userId, apiVersion = 1) => {
    return buildKey(['user', 'wishlist', `userId=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Órdenes de usuario (NO cachear, pero key disponible)
   */
  orders: (userId, apiVersion = 1) => {
    return buildKey(['user', 'orders', `userId=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Detalle de orden de usuario (NO cachear, pero key disponible)
   */
  orderDetail: (orderId, userId, apiVersion = 1) => {
    return buildKey(['user', 'order', 'detail', `orderId=${orderId}`, `userId=${userId}`, `v${apiVersion}`]);
  },
  
  /**
   * Patrones para invalidar cache de usuario
   */
  pattern: {
    cart: '^user:cart:userId=.*',
    wishlist: '^user:wishlist:userId=.*',
    orders: '^user:orders:userId=.*',
    orderDetail: '^user:order:detail:orderId=.*'
  }
};

/**
 * Generar ETag para respuesta
 */
function generateETag(key, data) {
  const crypto = require('crypto');
  const dataStr = JSON.stringify(data);
  const hash = crypto.createHash('md5').update(dataStr).digest('hex').substring(0, 8);
  return `"${key}-${hash}"`;
}

module.exports = {
  buildKey,
  productKeys,
  categoryKeys,
  homeKeys,
  adminKeys,
  userSpecificKeys,
  generateETag
};

