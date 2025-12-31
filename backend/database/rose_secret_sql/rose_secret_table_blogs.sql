
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blogs`
--
-- Creación: 30-12-2025 a las 16:54:24
--

DROP TABLE IF EXISTS `blogs`;
CREATE TABLE IF NOT EXISTS `blogs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL COMMENT 'Autor del blog',
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `excerpt` text DEFAULT NULL COMMENT 'Resumen corto del blog',
  `content` longtext NOT NULL COMMENT 'Contenido completo del blog (HTML/Markdown)',
  `cover_image_url` varchar(500) DEFAULT NULL COMMENT 'URL de imagen de portada (Cloudinary)',
  `status` enum('draft','published','archived') DEFAULT 'draft',
  `published_at` timestamp NULL DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `views_count` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  KEY `idx_user` (`user_id`),
  KEY `idx_status` (`status`),
  KEY `idx_published` (`published_at`),
  KEY `idx_slug` (`slug`),
  KEY `idx_blogs_status_published` (`status`,`published_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `blogs`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `blogs`
--

TRUNCATE TABLE `blogs`;