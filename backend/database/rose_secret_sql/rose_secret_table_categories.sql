
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--
-- Creación: 23-12-2025 a las 21:06:18
--

DROP TABLE IF EXISTS `categories`;
CREATE TABLE IF NOT EXISTS `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `parent_id` int(11) DEFAULT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_slug` (`slug`),
  KEY `idx_parent` (`parent_id`),
  KEY `idx_active` (`is_active`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `categories`:
--   `parent_id`
--       `categories` -> `id`
--

--
-- Truncar tablas antes de insertar `categories`
--

TRUNCATE TABLE `categories`;
--
-- Volcado de datos para la tabla `categories`
--

INSERT IGNORE INTO `categories` (`id`, `name`, `slug`, `description`, `parent_id`, `image_url`, `is_active`, `sort_order`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES
(1, 'Perfumes', 'perfumes', 'Fragancias de lujo para él y ella', NULL, NULL, 1, 1, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(2, 'Cosméticos', 'cosmetics', 'Maquillaje y productos de belleza', NULL, NULL, 1, 2, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(3, 'Skincare', 'skincare', 'Cuidado de la piel', NULL, NULL, 1, 3, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(4, 'Accesorios', 'accessories', 'Accesorios de belleza y moda', NULL, NULL, 1, 4, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21');
