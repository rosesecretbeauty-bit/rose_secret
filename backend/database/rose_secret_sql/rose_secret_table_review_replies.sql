
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review_replies`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `review_replies`;
CREATE TABLE IF NOT EXISTS `review_replies` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `is_admin` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_review` (`review_id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `review_replies`:
--   `review_id`
--       `reviews` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `review_replies`
--

TRUNCATE TABLE `review_replies`;