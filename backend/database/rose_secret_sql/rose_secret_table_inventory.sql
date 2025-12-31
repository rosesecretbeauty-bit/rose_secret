
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `inventory`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `inventory`;
CREATE TABLE IF NOT EXISTS `inventory` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `variant_id` int(11) NOT NULL,
  `available_stock` int(11) NOT NULL DEFAULT 0,
  `reserved_stock` int(11) NOT NULL DEFAULT 0,
  `total_stock` int(11) NOT NULL DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `variant_id` (`variant_id`),
  KEY `idx_variant` (`variant_id`),
  KEY `idx_available` (`available_stock`),
  KEY `idx_low_stock` (`available_stock`,`low_stock_threshold`),
  KEY `idx_inventory_variant_available` (`variant_id`,`available_stock`)
) ;

--
-- RELACIONES PARA LA TABLA `inventory`:
--   `variant_id`
--       `product_variants` -> `id`
--

--
-- Truncar tablas antes de insertar `inventory`
--

TRUNCATE TABLE `inventory`;