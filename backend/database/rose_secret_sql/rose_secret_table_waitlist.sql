
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `waitlist`
--
-- Creación: 30-12-2025 a las 15:13:24
--

DROP TABLE IF EXISTS `waitlist`;
CREATE TABLE IF NOT EXISTS `waitlist` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `notified` tinyint(1) DEFAULT 0,
  `notified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_variant` (`user_id`,`product_id`,`variant_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_notified` (`notified`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `waitlist`:
--   `product_id`
--       `products` -> `id`
--   `user_id`
--       `users` -> `id`
--   `variant_id`
--       `product_variants` -> `id`
--

--
-- Truncar tablas antes de insertar `waitlist`
--

TRUNCATE TABLE `waitlist`;