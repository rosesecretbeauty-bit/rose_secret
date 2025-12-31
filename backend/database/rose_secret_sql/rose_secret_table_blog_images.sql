
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `blog_images`
--
-- Creación: 30-12-2025 a las 16:54:23
--

DROP TABLE IF EXISTS `blog_images`;
CREATE TABLE IF NOT EXISTS `blog_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `blog_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL COMMENT 'URL de imagen en Cloudinary',
  `alt_text` varchar(255) DEFAULT NULL,
  `type` enum('content','gallery') DEFAULT 'content' COMMENT 'Tipo de imagen: content (dentro del contenido) o gallery',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_blog` (`blog_id`),
  KEY `idx_type` (`type`),
  KEY `idx_sort` (`sort_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `blog_images`:
--   `blog_id`
--       `blogs` -> `id`
--

--
-- Truncar tablas antes de insertar `blog_images`
--

TRUNCATE TABLE `blog_images`;