
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `saved_searches`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `saved_searches`;
CREATE TABLE IF NOT EXISTS `saved_searches` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `search_query` varchar(500) NOT NULL,
  `filters` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`filters`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `saved_searches`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `saved_searches`
--

TRUNCATE TABLE `saved_searches`;