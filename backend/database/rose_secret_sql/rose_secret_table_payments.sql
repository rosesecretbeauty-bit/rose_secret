
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `payments`;
CREATE TABLE IF NOT EXISTS `payments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `provider` varchar(50) DEFAULT 'stripe',
  `external_reference` varchar(255) DEFAULT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `currency` varchar(3) DEFAULT 'usd',
  `status` varchar(50) DEFAULT 'pending',
  `payment_method` varchar(50) DEFAULT NULL,
  `failure_reason` text DEFAULT NULL,
  `provider_payload` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`provider_payload`)),
  `metadata` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`metadata`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_intent_id` (`payment_intent_id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_provider` (`provider`),
  KEY `idx_payment_intent` (`payment_intent_id`),
  KEY `idx_external_reference` (`external_reference`),
  KEY `idx_status` (`status`),
  KEY `idx_payments_order_status` (`order_id`,`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `payments`:
--   `order_id`
--       `orders` -> `id`
--

--
-- Truncar tablas antes de insertar `payments`
--

TRUNCATE TABLE `payments`;