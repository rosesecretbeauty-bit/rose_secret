
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_images`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `product_images`;
CREATE TABLE IF NOT EXISTS `product_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `alt_text` varchar(255) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_primary` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_primary` (`is_primary`),
  KEY `idx_product_images_product_primary_sort` (`product_id`,`is_primary`,`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `product_images`:
--   `product_id`
--       `products` -> `id`
--

--
-- Truncar tablas antes de insertar `product_images`
--

TRUNCATE TABLE `product_images`;