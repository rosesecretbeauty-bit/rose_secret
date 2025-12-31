
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review_votes`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `review_votes`;
CREATE TABLE IF NOT EXISTS `review_votes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `is_helpful` tinyint(1) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_review_vote` (`user_id`,`review_id`),
  KEY `idx_review` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `review_votes`:
--   `review_id`
--       `reviews` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `review_votes`
--

TRUNCATE TABLE `review_votes`;