
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `influencers`
--
-- Creación: 26-12-2025 a las 22:48:54
--

DROP TABLE IF EXISTS `influencers`;
CREATE TABLE IF NOT EXISTS `influencers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `role` varchar(255) NOT NULL,
  `image_url` varchar(500) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `social_instagram` varchar(255) DEFAULT NULL,
  `social_youtube` varchar(255) DEFAULT NULL,
  `social_tiktok` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `influencers`:
--

--
-- Truncar tablas antes de insertar `influencers`
--

TRUNCATE TABLE `influencers`;