
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `attributes`
--
-- Creación: 24-12-2025 a las 15:31:45
--

DROP TABLE IF EXISTS `attributes`;
CREATE TABLE IF NOT EXISTS `attributes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `display_name` varchar(255) DEFAULT NULL,
  `type` enum('text','color','image','swatch') DEFAULT 'text',
  `sort_order` int(11) DEFAULT 0,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `attributes`:
--

--
-- Truncar tablas antes de insertar `attributes`
--

TRUNCATE TABLE `attributes`;
--
-- Volcado de datos para la tabla `attributes`
--

INSERT IGNORE INTO `attributes` (`id`, `name`, `slug`, `display_name`, `type`, `sort_order`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Color', 'color', 'Color', 'color', 1, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(2, 'Size', 'size', 'Tamaño', 'text', 2, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(3, 'Material', 'material', 'Material', 'text', 3, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46'),
(4, 'Concentration', 'concentration', 'Concentración', 'text', 4, 1, '2025-12-24 15:31:46', '2025-12-24 15:31:46');
