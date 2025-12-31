# Sistema de Notificaciones - Rose Secret

Este módulo implementa un sistema unificado de notificaciones backend-driven para el e-commerce Rose Secret.

## Arquitectura

```
src/notifications/
├── notificationTypes.ts      # Tipos TypeScript
├── notificationSchemas.ts    # Validación y sanitización
├── notificationClient.ts     # Cliente API para backend
├── notificationStore.ts      # Zustand store
├── useNotifications.ts      # Hook para auto-refresh
└── README.md                # Esta documentación
```

## Principios Fundamentales

### ✅ Backend-Driven
- **El backend decide cuándo, qué y por qué** enviar notificaciones
- El frontend solo renderiza y marca como leídas
- Todos los mensajes son trazables y auditable

### ✅ Multi-Canal
- **Email**: Enviado automáticamente para eventos críticos
- **In-App**: Notificaciones en tiempo real en la UI
- **Push**: Preparado para futura implementación

### ✅ Respeto a Preferencias
- Usuario puede activar/desactivar por tipo
- Usuario puede activar/desactivar por canal
- Preferencias se respetan automáticamente

## Componentes

### `notificationStore.ts`
Zustand store que gestiona:
- Notificaciones del usuario
- Contador de no leídas
- Preferencias de usuario
- Estados de carga y error

### `NotificationCenter.tsx`
Componente UI para mostrar notificaciones:
- Dropdown con lista de notificaciones
- Badge con contador de no leídas
- Estados: loading, empty, error
- Marcar como leídas (individual o todas)

### `useNotifications.ts`
Hook para auto-gestión:
- Auto-carga al montar
- Auto-refresh periódico
- Función de refresh manual

## Endpoints del Backend

### `GET /api/notifications`
Obtener notificaciones del usuario.

**Query Params:**
- `limit`: Número de notificaciones (default: 50)
- `offset`: Offset para paginación (default: 0)
- `type`: Filtrar por tipo (order, payment, promo, account, system)
- `unread_only`: Solo no leídas (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "notifications": [...],
    "unread_count": 5
  }
}
```

### `POST /api/notifications/mark-read`
Marcar notificación como leída.

**Body:**
```json
{
  "notification_id": 123,
  "mark_all": false
}
```

### `GET /api/notifications/unread-count`
Obtener contador de no leídas.

### `GET /api/notifications/preferences`
Obtener preferencias del usuario.

### `PUT /api/notifications/preferences`
Actualizar preferencias.

## Eventos que Disparan Notificaciones

### Órdenes
- **ORDER_CREATED** → Email + In-App
  - Título: "Pedido #XXX creado"
  - Mensaje: "Tu pedido ha sido creado exitosamente"

### Pagos
- **PAYMENT_SUCCESS** → Email + In-App
  - Título: "Pago confirmado - Pedido #XXX"
  - Mensaje: "Tu pago ha sido confirmado exitosamente"
  
- **PAYMENT_FAILED** → In-App
  - Título: "Pago fallido"
  - Mensaje: "No se pudo procesar tu pago"

### Promociones
- **COUPON_APPLIED** → In-App
  - Título: "Cupón aplicado"
  - Mensaje: "Has ahorrado $X con tu cupón"

### Cuenta
- **USER_REGISTER** → Email (bienvenida)
- **PASSWORD_CHANGED** → Email (seguridad)

## Tracking de Eventos

### `NOTIFICATION_SENT`
Cuando se envía una notificación (backend).

**Payload:**
```typescript
{
  notification_id: number;
  type: string;
  channel: string;
}
```

### `NOTIFICATION_OPENED`
Cuando el usuario abre el panel de notificaciones.

**Payload:**
```typescript
{
  notification_id?: number;
  type: string;
  channel: string;
}
```

### `NOTIFICATION_CLICKED`
Cuando el usuario hace click en una notificación.

**Payload:**
```typescript
{
  notification_id?: number;
  type: string;
  channel: string;
}
```

## Flujo de Notificación

1. Evento ocurre en backend (ej: orden creada)
2. Backend llama `notificationService.sendNotification()`
3. Backend verifica preferencias del usuario
4. Backend crea notificación en BD
5. Backend envía por canales habilitados (email, in-app)
6. Frontend carga notificaciones automáticamente
7. Usuario ve notificación en UI
8. Usuario marca como leída
9. Se trackea evento en analytics

## Preferencias de Usuario

El usuario puede controlar:
- **Por tipo**: order, payment, promo, account, system
- **Por canal**: email, in_app, push

Ejemplo:
```typescript
{
  email_order: true,
  email_payment: true,
  email_promo: false,
  in_app_order: true,
  in_app_payment: true,
  in_app_promo: true,
  push_order: false,
}
```

## Edge Cases Manejados

- ✅ Usuario eliminado
- ✅ Email inválido
- ✅ Retry controlado
- ✅ Fallback de canal
- ✅ No spam (respeto a preferencias)
- ✅ Notificaciones duplicadas
- ✅ Carrito vacío

## Próximas Mejoras

- [ ] WebSockets para real-time
- [ ] Push móvil real (FCM/APNs)
- [ ] WhatsApp API
- [ ] SMS
- [ ] Notificaciones programadas
- [ ] Templates personalizados
- [ ] A/B testing de mensajes

