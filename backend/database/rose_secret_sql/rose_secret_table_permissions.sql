
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `permissions`
--
-- Creación: 26-12-2025 a las 14:47:07
--

DROP TABLE IF EXISTS `permissions`;
CREATE TABLE IF NOT EXISTS `permissions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `key` varchar(100) NOT NULL COMMENT 'e.g. "orders.read", "orders.update"',
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `domain` varchar(50) NOT NULL COMMENT 'e.g. "orders", "products", "users"',
  `action` varchar(50) NOT NULL COMMENT 'e.g. "read", "create", "update", "delete"',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_domain` (`domain`),
  KEY `idx_action` (`action`),
  KEY `idx_domain_action` (`domain`,`action`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `permissions`:
--

--
-- Truncar tablas antes de insertar `permissions`
--

TRUNCATE TABLE `permissions`;
--
-- Volcado de datos para la tabla `permissions`
--

INSERT IGNORE INTO `permissions` (`id`, `key`, `name`, `description`, `domain`, `action`, `created_at`, `updated_at`) VALUES
(1, 'orders.read', 'Ver Órdenes', 'Permite ver listado y detalles de órdenes', 'orders', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(2, 'orders.create', 'Crear Órdenes', 'Permite crear nuevas órdenes', 'orders', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(3, 'orders.update', 'Actualizar Órdenes', 'Permite actualizar información de órdenes', 'orders', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(4, 'orders.delete', 'Eliminar Órdenes', 'Permite eliminar órdenes', 'orders', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(5, 'orders.export', 'Exportar Órdenes', 'Permite exportar datos de órdenes', 'orders', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(6, 'orders.cancel', 'Cancelar Órdenes', 'Permite cancelar órdenes', 'orders', 'cancel', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(7, 'orders.refund', 'Reembolsar Órdenes', 'Permite procesar reembolsos', 'orders', 'refund', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(8, 'products.read', 'Ver Productos', 'Permite ver listado y detalles de productos', 'products', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(9, 'products.create', 'Crear Productos', 'Permite crear nuevos productos', 'products', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(10, 'products.update', 'Actualizar Productos', 'Permite actualizar información de productos', 'products', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(11, 'products.delete', 'Eliminar Productos', 'Permite eliminar productos', 'products', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(12, 'products.export', 'Exportar Productos', 'Permite exportar datos de productos', 'products', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(13, 'users.read', 'Ver Usuarios', 'Permite ver listado y detalles de usuarios', 'users', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(14, 'users.create', 'Crear Usuarios', 'Permite crear nuevos usuarios', 'users', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(15, 'users.update', 'Actualizar Usuarios', 'Permite actualizar información de usuarios', 'users', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(16, 'users.delete', 'Eliminar Usuarios', 'Permite eliminar usuarios', 'users', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(17, 'users.export', 'Exportar Usuarios', 'Permite exportar datos de usuarios', 'users', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(18, 'categories.read', 'Ver Categorías', 'Permite ver listado y detalles de categorías', 'categories', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(19, 'categories.create', 'Crear Categorías', 'Permite crear nuevas categorías', 'categories', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(20, 'categories.update', 'Actualizar Categorías', 'Permite actualizar información de categorías', 'categories', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(21, 'categories.delete', 'Eliminar Categorías', 'Permite eliminar categorías', 'categories', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(22, 'inventory.read', 'Ver Inventario', 'Permite ver información de inventario', 'inventory', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(23, 'inventory.update', 'Actualizar Inventario', 'Permite actualizar niveles de inventario', 'inventory', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(24, 'inventory.export', 'Exportar Inventario', 'Permite exportar datos de inventario', 'inventory', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(25, 'coupons.read', 'Ver Cupones', 'Permite ver listado y detalles de cupones', 'coupons', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(26, 'coupons.create', 'Crear Cupones', 'Permite crear nuevos cupones', 'coupons', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(27, 'coupons.update', 'Actualizar Cupones', 'Permite actualizar información de cupones', 'coupons', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(28, 'coupons.delete', 'Eliminar Cupones', 'Permite eliminar cupones', 'coupons', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(29, 'promotions.read', 'Ver Promociones', 'Permite ver listado y detalles de promociones', 'promotions', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(30, 'promotions.create', 'Crear Promociones', 'Permite crear nuevas promociones', 'promotions', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(31, 'promotions.update', 'Actualizar Promociones', 'Permite actualizar información de promociones', 'promotions', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(32, 'promotions.delete', 'Eliminar Promociones', 'Permite eliminar promociones', 'promotions', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(33, 'settings.read', 'Ver Configuración', 'Permite ver configuración del sistema', 'settings', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(34, 'settings.update', 'Actualizar Configuración', 'Permite actualizar configuración del sistema', 'settings', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(35, 'analytics.read', 'Ver Analytics', 'Permite ver reportes y analytics', 'analytics', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(36, 'analytics.export', 'Exportar Analytics', 'Permite exportar datos de analytics', 'analytics', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(37, 'audit.read', 'Ver Auditoría', 'Permite ver logs de auditoría', 'audit', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(38, 'audit.export', 'Exportar Auditoría', 'Permite exportar logs de auditoría', 'audit', 'export', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(39, 'roles.read', 'Ver Roles', 'Permite ver listado y detalles de roles', 'roles', 'read', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(40, 'roles.create', 'Crear Roles', 'Permite crear nuevos roles', 'roles', 'create', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(41, 'roles.update', 'Actualizar Roles', 'Permite actualizar información de roles', 'roles', 'update', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(42, 'roles.delete', 'Eliminar Roles', 'Permite eliminar roles', 'roles', 'delete', '2025-12-26 14:47:07', '2025-12-26 14:47:07'),
(43, 'roles.assign', 'Asignar Roles', 'Permite asignar roles a usuarios', 'roles', 'assign', '2025-12-26 14:47:07', '2025-12-26 14:47:07');
