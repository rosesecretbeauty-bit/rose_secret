
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notification_preferences`
--
-- Creación: 26-12-2025 a las 14:40:57
--

DROP TABLE IF EXISTS `notification_preferences`;
CREATE TABLE IF NOT EXISTS `notification_preferences` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `email_order` tinyint(1) DEFAULT 1,
  `email_payment` tinyint(1) DEFAULT 1,
  `email_promo` tinyint(1) DEFAULT 1,
  `email_account` tinyint(1) DEFAULT 1,
  `in_app_order` tinyint(1) DEFAULT 1,
  `in_app_payment` tinyint(1) DEFAULT 1,
  `in_app_promo` tinyint(1) DEFAULT 1,
  `in_app_account` tinyint(1) DEFAULT 1,
  `in_app_system` tinyint(1) DEFAULT 1,
  `push_order` tinyint(1) DEFAULT 0,
  `push_payment` tinyint(1) DEFAULT 0,
  `push_promo` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `notification_preferences`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `notification_preferences`
--

TRUNCATE TABLE `notification_preferences`;