# Sistema de Permisos y Roles - Rose Secret

Este módulo implementa un sistema RBAC (Role-Based Access Control) completo para el e-commerce Rose Secret.

## Arquitectura

```
src/permissions/
├── permissionTypes.ts      # Tipos TypeScript
├── permissionClient.ts     # Cliente API para backend
├── permissionStore.ts      # Zustand store
├── usePermission.ts       # Hook para componentes
└── README.md              # Esta documentación
```

## Principios Fundamentales

### ✅ Backend-Driven
- **El backend es la única fuente de verdad** para autorización
- Frontend solo consume permisos para UX
- Toda acción crítica debe ser auditable

### ✅ Granular
- Permisos por dominio y acción (e.g. `orders.update`)
- No roles fijos, sistema extensible
- Control fino de acceso

### ✅ Seguro
- Middleware valida en cada request
- Cache de permisos con invalidación
- Logs de acceso denegado

## Componentes

### `permissionStore.ts`
Zustand store que gestiona:
- Permisos del usuario autenticado
- Roles del usuario
- Estados de carga y error

### `usePermission.ts`
Hook para verificar permisos:
- `can(permission)` - Verificar permiso específico
- `canAny(permissions)` - Verificar alguno de los permisos
- `canAll(permissions)` - Verificar todos los permisos
- `hasRole(roleName)` - Verificar rol específico
- `hasAnyRole(roleNames)` - Verificar alguno de los roles

## Endpoints del Backend

### `GET /api/permissions/me`
Obtener permisos del usuario autenticado.

**Response:**
```json
{
  "success": true,
  "data": {
    "permissions": ["orders.read", "orders.update", ...],
    "roles": [...]
  }
}
```

### `GET /api/permissions`
Obtener todos los permisos disponibles (requiere `roles.read`).

### `GET /api/permissions/roles`
Obtener todos los roles (requiere `roles.read`).

### `POST /api/permissions/roles/:roleId/assign`
Asignar rol a usuario (requiere `roles.assign`).

### `DELETE /api/permissions/roles/:roleId/assign`
Remover rol de usuario (requiere `roles.assign`).

## Permisos Disponibles

### Orders
- `orders.read` - Ver órdenes
- `orders.create` - Crear órdenes
- `orders.update` - Actualizar órdenes
- `orders.delete` - Eliminar órdenes
- `orders.export` - Exportar órdenes
- `orders.cancel` - Cancelar órdenes
- `orders.refund` - Reembolsar órdenes

### Products
- `products.read` - Ver productos
- `products.create` - Crear productos
- `products.update` - Actualizar productos
- `products.delete` - Eliminar productos
- `products.export` - Exportar productos

### Users
- `users.read` - Ver usuarios
- `users.create` - Crear usuarios
- `users.update` - Actualizar usuarios
- `users.delete` - Eliminar usuarios
- `users.export` - Exportar usuarios

### Categories, Inventory, Coupons, Promotions
- Similar estructura por dominio

### Settings, Analytics, Audit, Roles
- Permisos de administración

## Roles Iniciales

### SUPER_ADMIN (id: 1)
- Todos los permisos
- Acceso total al sistema

### ADMIN / MANAGER (id: 2)
- Gestión completa (sin sistema)
- Órdenes, productos, clientes
- Sin acceso a roles/permisos

### STAFF (id: 3)
- Permisos básicos
- Ver y editar órdenes
- Ver productos e inventario

### SUPPORT (futuro)
- Lectura + soporte
- Ver órdenes y usuarios
- Sin edición

## Uso en Componentes

```typescript
import { usePermission } from '../hooks/usePermission';

function MyComponent() {
  const { can, canAny, hasRole } = usePermission();

  return (
    <div>
      {can('orders.update') && (
        <button>Editar Orden</button>
      )}
      
      {canAny(['orders.delete', 'orders.cancel']) && (
        <button>Acción Crítica</button>
      )}
      
      {hasRole('admin') && (
        <AdminPanel />
      )}
    </div>
  );
}
```

## Middleware de Autorización

### Backend
```javascript
const { authorize } = require('../middleware/authorize');

router.put('/orders/:id', 
  authenticate, 
  authorize('orders.update'),
  async (req, res) => {
    // Solo usuarios con orders.update pueden acceder
  }
);
```

### Verificar Múltiples Permisos
```javascript
// Algún permiso
router.get('/orders', 
  authenticate, 
  authorizeAny(['orders.read', 'orders.export']),
  ...
);

// Todos los permisos
router.delete('/orders/:id', 
  authenticate, 
  authorizeAll(['orders.delete', 'orders.refund']),
  ...
);
```

## Auditoría

Todas las acciones críticas se auditan:
- `ORDER_CREATED` - Orden creada
- `PAYMENT_SUCCESS` - Pago exitoso
- `PAYMENT_FAILED` - Pago fallido
- `COUPON_APPLIED` - Cupón aplicado
- `ROLE_ASSIGNED` - Rol asignado
- `ROLE_REMOVED` - Rol removido
- `PERMISSION_DENIED` - Acceso denegado

## Edge Cases Manejados

- ✅ Usuario sin rol
- ✅ Permisos faltantes
- ✅ Revocación en tiempo real (cache invalidation)
- ✅ Token con permisos desactualizados
- ✅ Logs inmutables
- ✅ Fallback a rol por defecto

## Próximas Mejoras

- [ ] Editor visual de roles
- [ ] Multi-tenant
- [ ] Approval workflows
- [ ] Historial visual avanzado
- [ ] Permisos temporales
- [ ] Delegación de permisos
