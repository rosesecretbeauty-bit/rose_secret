
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_verification_tokens`
--
-- Creación: 30-12-2025 a las 17:21:10
-- Última actualización: 30-12-2025 a las 19:02:50
--

DROP TABLE IF EXISTS `email_verification_tokens`;
CREATE TABLE IF NOT EXISTS `email_verification_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_token` (`token`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- RELACIONES PARA LA TABLA `email_verification_tokens`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `email_verification_tokens`
--

TRUNCATE TABLE `email_verification_tokens`;
--
-- Volcado de datos para la tabla `email_verification_tokens`
--

INSERT IGNORE INTO `email_verification_tokens` (`id`, `user_id`, `token`, `expires_at`, `created_at`) VALUES
(6, 1, '8c60f146c9e8cadff60c728d3ac24250c9adb505091809b8d0f6e87eaada333f', '2025-12-31 19:02:50', '2025-12-30 19:02:50');
