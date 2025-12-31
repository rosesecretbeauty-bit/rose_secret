# Analytics System - Rose Secret

## 📊 Arquitectura

Sistema de tracking y analytics centralizado, desacoplado y escalable para el e-commerce Rose Secret.

### Estructura

```
src/analytics/
├── analyticsClient.ts      # Cliente centralizado (track, identify, page)
├── config.ts               # Feature flags y configuración
├── events.ts               # Catálogo tipado de eventos
├── schemas.ts              # Validación y sanitización de payloads
└── analyticsProviders/
    ├── console.provider.ts # Provider para desarrollo
    ├── google.provider.ts  # Google Analytics 4
    └── meta.provider.ts    # Meta Pixel (placeholder)
```

## 🚀 Uso

### Tracking de Eventos

```typescript
import { trackEvent } from '../analytics/analyticsClient';

// Ejemplo: Agregar al carrito
trackEvent('ADD_TO_CART', {
  productId: '123',
  productName: 'Perfume Rose',
  quantity: 1,
  price: 99.99,
  currency: 'USD',
});
```

### Identificación de Usuario

```typescript
import { identifyUser } from '../analytics/analyticsClient';

// Después de login
identifyUser(userId, {
  email: user.email,
  name: user.name,
  role: user.role,
});
```

### Page Tracking

```typescript
import { trackPageView } from '../analytics/analyticsClient';

trackPageView('/product/123', {
  title: 'Product Page',
});
```

## 📋 Eventos Implementados

### Autenticación
- `USER_LOGIN` - Usuario inicia sesión
- `USER_REGISTER` - Usuario se registra
- `USER_LOGOUT` - Usuario cierra sesión

### Productos
- `VIEW_PRODUCT` - Visualización de producto
- `VIEW_CATEGORY` - Visualización de categoría
- `SEARCH_PRODUCTS` - Búsqueda de productos

### Carrito
- `ADD_TO_CART` - Agregar producto al carrito
- `REMOVE_FROM_CART` - Remover producto del carrito
- `UPDATE_CART_ITEM` - Actualizar cantidad
- `VIEW_CART` - Ver carrito

### Checkout
- `BEGIN_CHECKOUT` - Inicio de checkout
- `PAYMENT_INTENT_CREATED` - Intención de pago creada
- `PAYMENT_SUCCESS` - Pago exitoso
- `PAYMENT_FAILED` - Pago fallido

### Órdenes
- `ORDER_CREATED` - Orden creada
- `ORDER_VIEWED` - Orden visualizada

### Wishlist
- `ADD_TO_WISHLIST` - Agregar a wishlist
- `REMOVE_FROM_WISHLIST` - Remover de wishlist

### Navegación
- `PAGE_VIEW` - Vista de página

## ⚙️ Configuración

### Variables de Entorno

```env
# Habilitar/deshabilitar analytics
VITE_ANALYTICS_ENABLED=true

# Providers
VITE_ANALYTICS_CONSOLE=true          # Siempre activo en desarrollo
VITE_ANALYTICS_GOOGLE=true
VITE_ANALYTICS_META=false
VITE_ANALYTICS_SEGMENT=false

# IDs de providers
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_META_PIXEL_ID=123456789

# Debug
VITE_ANALYTICS_DEBUG=false

# Sample rate (0-1)
VITE_ANALYTICS_SAMPLE_RATE=1.0
```

## 🔒 Seguridad

- ✅ Validación de payloads
- ✅ Sanitización de datos
- ✅ Evita PII innecesaria
- ✅ Manejo silencioso de errores
- ✅ No bloquea la aplicación si falla

## 📈 Integración en Stores

El tracking está integrado en:

- ✅ `cartStore.ts` - ADD_TO_CART, REMOVE_FROM_CART, UPDATE_CART_ITEM
- ✅ `authStore.ts` - USER_LOGIN, USER_REGISTER, USER_LOGOUT, identifyUser
- ✅ `checkoutStore.ts` - BEGIN_CHECKOUT, ORDER_CREATED
- ✅ `wishlistStore.ts` - ADD_TO_WISHLIST, REMOVE_FROM_WISHLIST

## 📄 Integración en Páginas

- ✅ `ProductDetailPage.tsx` - VIEW_PRODUCT
- ✅ `CategoryPage.tsx` - VIEW_CATEGORY
- ✅ `ShopPage.tsx` - SEARCH_PRODUCTS
- ✅ `CartPage.tsx` - VIEW_CART
- ✅ `OrderDetailPage.tsx` - ORDER_VIEWED
- ✅ `App.tsx` - PAGE_VIEW (via usePageTracking hook)

## 🔌 Providers

### Console Provider (Desarrollo)
Muestra eventos en la consola del navegador con emojis y formato legible.

### Google Analytics Provider
Transforma eventos a formato GA4 con soporte para Enhanced E-commerce.

### Meta Pixel Provider
Mapea eventos a eventos estándar de Meta Pixel.

## 🎯 Próximos Pasos

- [ ] Implementar Segment provider
- [ ] Agregar más eventos de negocio
- [ ] Dashboard de analytics
- [ ] Heatmaps
- [ ] A/B testing

## 📝 Notas

- El sistema es completamente opcional y no bloquea la aplicación si falla
- Los errores se manejan silenciosamente en producción
- El sample rate permite controlar el volumen de eventos
- Los payloads se validan y sanitizan automáticamente

