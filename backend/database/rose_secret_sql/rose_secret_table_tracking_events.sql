
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tracking_events`
--
-- Creación: 23-12-2025 a las 21:06:19
--

DROP TABLE IF EXISTS `tracking_events`;
CREATE TABLE IF NOT EXISTS `tracking_events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `status` varchar(50) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `carrier` varchar(100) DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `estimated_delivery` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_order` (`order_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `tracking_events`:
--   `order_id`
--       `orders` -> `id`
--

--
-- Truncar tablas antes de insertar `tracking_events`
--

TRUNCATE TABLE `tracking_events`;