
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `stripe_events`
--
-- Creación: 24-12-2025 a las 16:09:51
--

DROP TABLE IF EXISTS `stripe_events`;
CREATE TABLE IF NOT EXISTS `stripe_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(255) NOT NULL,
  `event_type` varchar(100) NOT NULL,
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `event_data` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`event_data`)),
  `processed` tinyint(1) DEFAULT 0,
  `processed_at` timestamp NULL DEFAULT NULL,
  `retry_count` int(11) DEFAULT 0,
  `error_message` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `event_id` (`event_id`),
  KEY `idx_event_id` (`event_id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_payment_intent` (`payment_intent_id`),
  KEY `idx_processed` (`processed`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `stripe_events`:
--

--
-- Truncar tablas antes de insertar `stripe_events`
--

TRUNCATE TABLE `stripe_events`;