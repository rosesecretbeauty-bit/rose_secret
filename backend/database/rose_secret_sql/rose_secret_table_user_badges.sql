
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_badges`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `user_badges`;
CREATE TABLE IF NOT EXISTS `user_badges` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `badge_id` varchar(50) NOT NULL,
  `badge_name` varchar(255) NOT NULL,
  `badge_icon` varchar(50) DEFAULT NULL,
  `badge_description` text DEFAULT NULL,
  `earned_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_badge` (`badge_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `user_badges`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `user_badges`
--

TRUNCATE TABLE `user_badges`;