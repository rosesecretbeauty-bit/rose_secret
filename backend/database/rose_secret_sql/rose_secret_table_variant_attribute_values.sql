
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `variant_attribute_values`
--
-- Creación: 24-12-2025 a las 15:31:46
--

DROP TABLE IF EXISTS `variant_attribute_values`;
CREATE TABLE IF NOT EXISTS `variant_attribute_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `attribute_id` int(11) NOT NULL,
  `attribute_value_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_variant_attribute` (`variant_id`,`attribute_id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_attribute` (`attribute_id`),
  KEY `idx_value` (`attribute_value_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `variant_attribute_values`:
--   `variant_id`
--       `product_variants` -> `id`
--   `attribute_id`
--       `attributes` -> `id`
--   `attribute_value_id`
--       `attribute_values` -> `id`
--

--
-- Truncar tablas antes de insertar `variant_attribute_values`
--

TRUNCATE TABLE `variant_attribute_values`;