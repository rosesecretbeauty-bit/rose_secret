
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loyalty_tiers`
--
-- Creación: 30-12-2025 a las 15:13:13
-- Última actualización: 30-12-2025 a las 15:13:14
--

DROP TABLE IF EXISTS `loyalty_tiers`;
CREATE TABLE IF NOT EXISTS `loyalty_tiers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(50) NOT NULL,
  `slug` varchar(50) NOT NULL,
  `min_points` int(11) NOT NULL DEFAULT 0,
  `points_multiplier` decimal(3,2) NOT NULL DEFAULT 1.00,
  `benefits` text DEFAULT NULL,
  `color` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_min_points` (`min_points`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `loyalty_tiers`:
--

--
-- Truncar tablas antes de insertar `loyalty_tiers`
--

TRUNCATE TABLE `loyalty_tiers`;
--
-- Volcado de datos para la tabla `loyalty_tiers`
--

INSERT IGNORE INTO `loyalty_tiers` (`id`, `name`, `slug`, `min_points`, `points_multiplier`, `benefits`, `color`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Bronze', 'bronze', 0, 1.00, '1 Point per $1\nBirthday Gift\nEarly Access to Sales', 'orange', 1, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(2, 'Silver', 'silver', 500, 1.25, '1.25 Points per $1\nFree Standard Shipping\nExclusive Events', 'gray', 1, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(3, 'Gold', 'gold', 2000, 1.50, '1.5 Points per $1\nFree Express Shipping\nPriority Support\nConcierge Service', 'yellow', 1, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(4, 'Platinum', 'platinum', 5000, 2.00, '2 Points per $1\nPersonal Shopper\nExclusive Gifts\nVIP Events Access', 'slate', 1, '2025-12-30 15:13:14', '2025-12-30 15:13:14');
