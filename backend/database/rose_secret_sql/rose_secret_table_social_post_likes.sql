
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_post_likes`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `social_post_likes`;
CREATE TABLE IF NOT EXISTS `social_post_likes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `post_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_post_like` (`user_id`,`post_id`),
  KEY `idx_post` (`post_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `social_post_likes`:
--   `post_id`
--       `social_posts` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `social_post_likes`
--

TRUNCATE TABLE `social_post_likes`;