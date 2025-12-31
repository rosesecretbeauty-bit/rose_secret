
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `user_settings`
--
-- Creación: 30-12-2025 a las 17:11:27
-- Última actualización: 30-12-2025 a las 17:20:58
--

DROP TABLE IF EXISTS `user_settings`;
CREATE TABLE IF NOT EXISTS `user_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_notifications` tinyint(1) DEFAULT 1,
  `sms_notifications` tinyint(1) DEFAULT 0,
  `marketing_emails` tinyint(1) DEFAULT 1,
  `language` varchar(10) DEFAULT 'es',
  `currency` varchar(3) DEFAULT 'USD',
  `timezone` varchar(50) DEFAULT NULL,
  `preferences` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `two_factor_enabled` tinyint(1) DEFAULT 0,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`user_id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `user_settings`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `user_settings`
--

TRUNCATE TABLE `user_settings`;
--
-- Volcado de datos para la tabla `user_settings`
--

INSERT IGNORE INTO `user_settings` (`id`, `user_id`, `email_notifications`, `sms_notifications`, `marketing_emails`, `language`, `currency`, `timezone`, `preferences`, `created_at`, `updated_at`, `two_factor_secret`, `two_factor_enabled`) VALUES
(1, 9, 1, 0, 1, 'es', 'MXN', 'America/Mexico_City', NULL, '2025-12-30 15:15:48', '2025-12-30 15:25:53', NULL, 0),
(2, 1, 1, 1, 1, 'es', 'MXN', 'America/Mexico_City', NULL, '2025-12-30 16:02:52', '2025-12-30 17:20:58', NULL, 0);
