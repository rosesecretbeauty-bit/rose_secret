
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coupons`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `coupons`;
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `min_purchase` decimal(10,2) DEFAULT NULL,
  `max_discount` decimal(10,2) DEFAULT NULL,
  `usage_limit` int(11) DEFAULT NULL,
  `usage_count` int(11) DEFAULT 0,
  `user_limit` int(11) DEFAULT 1,
  `is_active` tinyint(1) DEFAULT 1,
  `starts_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `code` (`code`),
  KEY `idx_code` (`code`),
  KEY `idx_active` (`is_active`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `coupons`:
--

--
-- Truncar tablas antes de insertar `coupons`
--

TRUNCATE TABLE `coupons`;
--
-- Volcado de datos para la tabla `coupons`
--

INSERT IGNORE INTO `coupons` (`id`, `code`, `name`, `description`, `type`, `value`, `min_purchase`, `max_discount`, `usage_limit`, `usage_count`, `user_limit`, `is_active`, `starts_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'WELCOME10', 'Bienvenida 10%', '10% de descuento en tu primera compra', 'percentage', 10.00, NULL, 500.00, 1000, 15, 1, 1, '2025-11-26 15:48:08', '2026-01-25 15:48:08', '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(2, 'SAVE20', 'Ahorra 20%', '20% de descuento en compras mayores a $500', 'percentage', 20.00, 500.00, 1000.00, 500, 27, 1, 1, '2025-12-11 15:48:08', NULL, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(3, 'FREESHIP', 'Envío Gratis', 'Envío gratis en compras mayores a $1000', 'fixed', 99.00, 1000.00, 99.00, 1000, 20, 1, 1, '2025-12-19 15:48:08', NULL, '2025-12-26 15:48:08', '2025-12-26 15:48:08');
