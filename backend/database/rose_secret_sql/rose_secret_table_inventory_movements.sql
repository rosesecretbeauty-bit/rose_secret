
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory_movements`
--
-- Creación: 24-12-2025 a las 15:37:03
--

DROP TABLE IF EXISTS `inventory_movements`;
CREATE TABLE IF NOT EXISTS `inventory_movements` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `movement_type` enum('initial','adjustment','sale','reservation','release','return') NOT NULL,
  `quantity` int(11) NOT NULL,
  `balance_before` int(11) NOT NULL,
  `balance_after` int(11) NOT NULL,
  `reserved_before` int(11) NOT NULL DEFAULT 0,
  `reserved_after` int(11) NOT NULL DEFAULT 0,
  `reason` varchar(255) DEFAULT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `user_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_type` (`movement_type`),
  KEY `idx_created` (`created_at`),
  KEY `idx_reference` (`reference_type`,`reference_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `inventory_movements`:
--   `variant_id`
--       `product_variants` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `inventory_movements`
--

TRUNCATE TABLE `inventory_movements`;