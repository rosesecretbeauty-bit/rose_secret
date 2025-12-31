
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loyalty_points`
--
-- Creación: 30-12-2025 a las 15:13:14
-- Última actualización: 30-12-2025 a las 19:18:02
--

DROP TABLE IF EXISTS `loyalty_points`;
CREATE TABLE IF NOT EXISTS `loyalty_points` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `current_points` int(11) NOT NULL DEFAULT 0,
  `lifetime_points` int(11) NOT NULL DEFAULT 0,
  `tier_id` int(11) NOT NULL DEFAULT 1,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_user` (`user_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_tier` (`tier_id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `loyalty_points`:
--   `tier_id`
--       `loyalty_tiers` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `loyalty_points`
--

TRUNCATE TABLE `loyalty_points`;
--
-- Volcado de datos para la tabla `loyalty_points`
--

INSERT IGNORE INTO `loyalty_points` (`id`, `user_id`, `current_points`, `lifetime_points`, `tier_id`, `updated_at`) VALUES
(1, 9, 0, 0, 1, '2025-12-30 15:16:20'),
(2, 1, 0, 0, 1, '2025-12-30 16:02:40'),
(3, 10, 0, 0, 1, '2025-12-30 19:18:02');
