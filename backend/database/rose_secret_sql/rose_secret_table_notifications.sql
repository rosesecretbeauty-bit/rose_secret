
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `notifications`
--
-- Creación: 26-12-2025 a las 14:40:57
--

DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('order','payment','promo','account','system') NOT NULL DEFAULT 'system',
  `channel` enum('email','in_app','push') NOT NULL DEFAULT 'in_app',
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `read_at` timestamp NULL DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_channel` (`channel`),
  KEY `idx_read` (`read_at`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `notifications`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `notifications`
--

TRUNCATE TABLE `notifications`;