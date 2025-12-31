
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attribute_values`
--
-- Creación: 24-12-2025 a las 15:31:46
--

DROP TABLE IF EXISTS `attribute_values`;
CREATE TABLE IF NOT EXISTS `attribute_values` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `attribute_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `display_value` varchar(255) DEFAULT NULL,
  `color_code` varchar(7) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_attribute_value` (`attribute_id`,`value`),
  KEY `idx_attribute` (`attribute_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `attribute_values`:
--   `attribute_id`
--       `attributes` -> `id`
--

--
-- Truncar tablas antes de insertar `attribute_values`
--

TRUNCATE TABLE `attribute_values`;
--
-- Volcado de datos para la tabla `attribute_values`
--

INSERT IGNORE INTO `attribute_values` (`id`, `attribute_id`, `value`, `display_value`, `color_code`, `image_url`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 1, 'red', 'Rojo', '#FF0000', NULL, 1, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(2, 1, 'blue', 'Azul', '#0000FF', NULL, 2, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(3, 1, 'green', 'Verde', '#00FF00', NULL, 3, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(4, 1, 'black', 'Negro', '#000000', NULL, 4, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(5, 1, 'white', 'Blanco', '#FFFFFF', NULL, 5, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(6, 1, 'gold', 'Dorado', '#FFD700', NULL, 6, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(7, 2, '30ml', '30ml', NULL, NULL, 1, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(8, 2, '50ml', '50ml', NULL, NULL, 2, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(9, 2, '100ml', '100ml', NULL, NULL, 3, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(10, 2, '200ml', '200ml', NULL, NULL, 4, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(11, 4, 'eau-de-toilette', 'Eau de Toilette', NULL, NULL, 1, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(12, 4, 'eau-de-parfum', 'Eau de Parfum', NULL, NULL, 2, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(13, 4, 'parfum', 'Parfum', NULL, NULL, 3, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46');
