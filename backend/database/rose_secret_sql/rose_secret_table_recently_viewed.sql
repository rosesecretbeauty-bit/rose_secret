
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `recently_viewed`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `recently_viewed`;
CREATE TABLE IF NOT EXISTS `recently_viewed` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `viewed_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_viewed_at` (`viewed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `recently_viewed`:
--   `user_id`
--       `users` -> `id`
--   `product_id`
--       `products` -> `id`
--

--
-- Truncar tablas antes de insertar `recently_viewed`
--

TRUNCATE TABLE `recently_viewed`;