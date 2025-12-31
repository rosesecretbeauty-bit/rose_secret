
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `loyalty_transactions`
--
-- Creación: 30-12-2025 a las 15:13:14
--

DROP TABLE IF EXISTS `loyalty_transactions`;
CREATE TABLE IF NOT EXISTS `loyalty_transactions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `points` int(11) NOT NULL,
  `type` enum('earned','redeemed','expired','adjusted') NOT NULL,
  `source` varchar(100) DEFAULT NULL,
  `source_id` int(11) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `reward_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_type` (`type`),
  KEY `idx_order` (`order_id`),
  KEY `idx_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `loyalty_transactions`:
--   `order_id`
--       `orders` -> `id`
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `loyalty_transactions`
--

TRUNCATE TABLE `loyalty_transactions`;