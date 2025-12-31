
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payment_methods`
--
-- Creación: 30-12-2025 a las 15:13:33
--

DROP TABLE IF EXISTS `payment_methods`;
CREATE TABLE IF NOT EXISTS `payment_methods` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `stripe_payment_method_id` varchar(255) NOT NULL,
  `type` varchar(50) NOT NULL,
  `card_brand` varchar(50) DEFAULT NULL,
  `card_last4` varchar(4) DEFAULT NULL,
  `card_exp_month` int(2) DEFAULT NULL,
  `card_exp_year` int(4) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `billing_details` text DEFAULT NULL,
  `metadata` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_stripe_pm` (`stripe_payment_method_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_default` (`is_default`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `payment_methods`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `payment_methods`
--

TRUNCATE TABLE `payment_methods`;