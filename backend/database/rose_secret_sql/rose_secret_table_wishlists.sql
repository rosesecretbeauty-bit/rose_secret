
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlists`
--
-- Creación: 23-12-2025 a las 17:18:50
--

DROP TABLE IF EXISTS `wishlists`;
CREATE TABLE IF NOT EXISTS `wishlists` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product` (`user_id`,`product_id`),
  KEY `product_id` (`product_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `wishlists`:
--   `user_id`
--       `users` -> `id`
--   `product_id`
--       `products` -> `id`
--

--
-- Truncar tablas antes de insertar `wishlists`
--

TRUNCATE TABLE `wishlists`;
--
-- Volcado de datos para la tabla `wishlists`
--

INSERT IGNORE INTO `wishlists` (`id`, `user_id`, `product_id`, `created_at`) VALUES
(1, 1, 1, '2025-12-24 17:10:16');
