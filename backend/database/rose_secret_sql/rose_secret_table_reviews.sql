
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reviews`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `reviews`;
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL CHECK (`rating` >= 1 and `rating` <= 5),
  `title` varchar(255) DEFAULT NULL,
  `content` text NOT NULL,
  `verified_purchase` tinyint(1) DEFAULT 0,
  `helpful_count` int(11) DEFAULT 0,
  `not_helpful_count` int(11) DEFAULT 0,
  `is_approved` tinyint(1) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_product_review` (`user_id`,`product_id`),
  KEY `order_id` (`order_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_rating` (`rating`),
  KEY `idx_approved` (`is_approved`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `reviews`:
--   `product_id`
--       `products` -> `id`
--   `user_id`
--       `users` -> `id`
--   `order_id`
--       `orders` -> `id`
--

--
-- Truncar tablas antes de insertar `reviews`
--

TRUNCATE TABLE `reviews`;
--
-- Volcado de datos para la tabla `reviews`
--

INSERT IGNORE INTO `reviews` (`id`, `product_id`, `user_id`, `order_id`, `rating`, `title`, `content`, `verified_purchase`, `helpful_count`, `not_helpful_count`, `is_approved`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 7, 6, NULL, 5, 'Muy recomendado', 'Me encantó, definitivamente compraré de nuevo.', 1, 0, 0, 1, 0, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(2, 2, 6, NULL, 5, 'Muy recomendado', 'La mejor fragancia que he probado, huele increíble.', 1, 0, 0, 1, 0, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(3, 8, 2, NULL, 4, 'Excelente producto', 'Excelente relación calidad-precio, muy satisfecha.', 1, 0, 0, 1, 0, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(4, 9, 3, NULL, 5, 'Muy recomendado', 'Me encantó, definitivamente compraré de nuevo.', 1, 0, 0, 1, 0, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(5, 9, 5, NULL, 4, 'Fragancia increíble', 'La mejor fragancia que he probado, huele increíble.', 1, 0, 0, 1, 0, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(6, 1, 6, NULL, 5, 'Fragancia increíble', 'Producto de alta calidad, super recomendado.', 1, 0, 0, 1, 0, '2025-12-26 15:48:09', '2025-12-26 15:48:09'),
(7, 2, 3, NULL, 5, 'Calidad premium', 'Me encantó, definitivamente compraré de nuevo.', 1, 0, 0, 1, 0, '2025-12-26 15:48:09', '2025-12-26 15:48:09'),
(8, 8, 3, NULL, 5, 'Muy recomendado', 'Producto de alta calidad, super recomendado.', 1, 0, 0, 1, 0, '2025-12-26 15:48:09', '2025-12-26 15:48:09'),
(9, 7, 3, NULL, 4, 'Superó mis expectativas', 'La mejor fragancia que he probado, huele increíble.', 1, 0, 0, 1, 0, '2025-12-26 15:48:09', '2025-12-26 15:48:09'),
(10, 2, 2, NULL, 5, 'Superó mis expectativas', 'La fragancia es perfecta, dura todo el día y el empaque es hermoso.', 1, 0, 0, 1, 0, '2025-12-26 15:48:09', '2025-12-26 15:48:09');
