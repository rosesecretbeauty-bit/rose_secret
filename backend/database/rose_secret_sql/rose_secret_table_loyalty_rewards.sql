
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loyalty_rewards`
--
-- Creación: 30-12-2025 a las 15:13:14
-- Última actualización: 30-12-2025 a las 15:13:14
--

DROP TABLE IF EXISTS `loyalty_rewards`;
CREATE TABLE IF NOT EXISTS `loyalty_rewards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `points_cost` int(11) NOT NULL,
  `reward_type` varchar(50) DEFAULT NULL,
  `reward_value` decimal(10,2) DEFAULT NULL,
  `icon` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `stock_limit` int(11) DEFAULT NULL,
  `stock_remaining` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_points_cost` (`points_cost`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `loyalty_rewards`:
--

--
-- Truncar tablas antes de insertar `loyalty_rewards`
--

TRUNCATE TABLE `loyalty_rewards`;
--
-- Volcado de datos para la tabla `loyalty_rewards`
--

INSERT IGNORE INTO `loyalty_rewards` (`id`, `name`, `description`, `points_cost`, `reward_type`, `reward_value`, `icon`, `is_active`, `stock_limit`, `stock_remaining`, `created_at`, `updated_at`) VALUES
(1, '$10 Off Coupon', 'Get $10 off your next purchase', 500, 'coupon', 10.00, 'gift', 1, NULL, NULL, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(2, 'Free Full-Size Product', 'Redeem for any full-size product', 1500, 'product', NULL, 'star', 1, NULL, NULL, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(3, 'Luxury Sample Kit', 'Curated sample kit of premium products', 1000, 'product', NULL, 'crown', 1, NULL, NULL, '2025-12-30 15:13:14', '2025-12-30 15:13:14'),
(4, 'Private Consultation', 'One-on-one fragrance consultation', 2500, 'service', NULL, 'shield', 1, NULL, NULL, '2025-12-30 15:13:14', '2025-12-30 15:13:14');
