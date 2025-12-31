
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loyalty_redemptions`
--
-- Creación: 30-12-2025 a las 15:13:14
--

DROP TABLE IF EXISTS `loyalty_redemptions`;
CREATE TABLE IF NOT EXISTS `loyalty_redemptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `reward_id` int(11) NOT NULL,
  `points_used` int(11) NOT NULL,
  `status` enum('pending','fulfilled','cancelled') DEFAULT 'pending',
  `fulfilled_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_reward` (`reward_id`),
  KEY `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `loyalty_redemptions`:
--   `reward_id`
--       `loyalty_rewards` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `loyalty_redemptions`
--

TRUNCATE TABLE `loyalty_redemptions`;