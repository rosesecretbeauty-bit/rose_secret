
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_status_history`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `order_status_history`;
CREATE TABLE IF NOT EXISTS `order_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `new_status` varchar(50) NOT NULL,
  `payment_status` varchar(50) DEFAULT NULL,
  `changed_by` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `changed_by` (`changed_by`),
  KEY `idx_order` (`order_id`),
  KEY `idx_status` (`new_status`),
  KEY `idx_created` (`created_at`),
  KEY `idx_order_status_history_order_created` (`order_id`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `order_status_history`:
--   `order_id`
--       `orders` -> `id`
--   `changed_by`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `order_status_history`
--

TRUNCATE TABLE `order_status_history`;