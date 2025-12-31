
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `product_attributes`
--
-- Creación: 24-12-2025 a las 15:31:46
--

DROP TABLE IF EXISTS `product_attributes`;
CREATE TABLE IF NOT EXISTS `product_attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `product_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `is_required` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_product_attribute` (`product_id`,`attribute_id`),
  KEY `idx_product` (`product_id`),
  KEY `idx_attribute` (`attribute_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `product_attributes`:
--   `product_id`
--       `products` -> `id`
--   `attribute_id`
--       `attributes` -> `id`
--

--
-- Truncar tablas antes de insertar `product_attributes`
--

TRUNCATE TABLE `product_attributes`;