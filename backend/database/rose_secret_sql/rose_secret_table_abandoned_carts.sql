
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `abandoned_carts`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `abandoned_carts`;
CREATE TABLE IF NOT EXISTS `abandoned_carts` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `session_id` varchar(255) DEFAULT NULL,
  `items` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`items`)),
  `email` varchar(255) DEFAULT NULL,
  `recovered` tinyint(1) DEFAULT 0,
  `recovered_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_session` (`session_id`),
  KEY `idx_recovered` (`recovered`),
  KEY `idx_expires` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `abandoned_carts`:
--

--
-- Truncar tablas antes de insertar `abandoned_carts`
--

TRUNCATE TABLE `abandoned_carts`;