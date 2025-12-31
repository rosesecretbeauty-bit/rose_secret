
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `social_posts`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `social_posts`;
CREATE TABLE IF NOT EXISTS `social_posts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('review','photo','video','look','tip') NOT NULL,
  `content` text NOT NULL,
  `products` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`products`)),
  `likes_count` int(11) DEFAULT 0,
  `comments_count` int(11) DEFAULT 0,
  `shares_count` int(11) DEFAULT 0,
  `is_featured` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `social_posts`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `social_posts`
--

TRUNCATE TABLE `social_posts`;