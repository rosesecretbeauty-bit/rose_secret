
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_roles`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `user_roles`;
CREATE TABLE IF NOT EXISTS `user_roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `role_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user_role` (`user_id`,`role_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_role` (`role_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `user_roles`:
--   `user_id`
--       `users` -> `id`
--   `role_id`
--       `roles` -> `id`
--

--
-- Truncar tablas antes de insertar `user_roles`
--

TRUNCATE TABLE `user_roles`;
--
-- Volcado de datos para la tabla `user_roles`
--

INSERT IGNORE INTO `user_roles` (`id`, `user_id`, `role_id`, `created_at`) VALUES
(1, 1, 1, '2025-12-26 15:41:42'),
(2, 7, 2, '2025-12-26 15:41:55'),
(3, 8, 3, '2025-12-26 15:41:55');
