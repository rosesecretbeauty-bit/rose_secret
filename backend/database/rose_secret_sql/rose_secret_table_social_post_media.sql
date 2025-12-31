
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_post_media`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `social_post_media`;
CREATE TABLE IF NOT EXISTS `social_post_media` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `media_url` varchar(500) NOT NULL,
  `media_type` enum('image','video') NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `social_post_media`:
--   `post_id`
--       `social_posts` -> `id`
--

--
-- Truncar tablas antes de insertar `social_post_media`
--

TRUNCATE TABLE `social_post_media`;