
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cart_items`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `cart_items`;
CREATE TABLE IF NOT EXISTS `cart_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `price_snapshot` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `expires_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_variant` (`user_id`,`product_id`,`variant_id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_expires` (`expires_at`),
  KEY `idx_user_session` (`user_id`,`session_id`),
  KEY `idx_cart_items_user_expires` (`user_id`,`expires_at`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `cart_items`:
--   `user_id`
--       `users` -> `id`
--   `product_id`
--       `products` -> `id`
--   `variant_id`
--       `product_variants` -> `id`
--

--
-- Truncar tablas antes de insertar `cart_items`
--

TRUNCATE TABLE `cart_items`;
--
-- Volcado de datos para la tabla `cart_items`
--

INSERT IGNORE INTO `cart_items` (`id`, `user_id`, `session_id`, `product_id`, `variant_id`, `quantity`, `price_snapshot`, `created_at`, `updated_at`, `expires_at`) VALUES
(1, 1, NULL, 1, NULL, 1, 185.00, '2025-12-24 17:10:15', '2025-12-26 15:21:36', '2025-12-26 15:51:36');
