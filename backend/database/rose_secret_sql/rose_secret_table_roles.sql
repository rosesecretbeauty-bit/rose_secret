
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `roles`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `roles`;
CREATE TABLE IF NOT EXISTS `roles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `permissions` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`permissions`)),
  `is_system` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`),
  KEY `idx_name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `roles`:
--

--
-- Truncar tablas antes de insertar `roles`
--

TRUNCATE TABLE `roles`;
--
-- Volcado de datos para la tabla `roles`
--

INSERT IGNORE INTO `roles` (`id`, `name`, `description`, `permissions`, `is_system`, `created_at`, `updated_at`) VALUES
(1, 'admin', 'Administrador completo', '{\"products\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"orders\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"users\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"categories\":[\"view\",\"create\",\"edit\",\"delete\"],\"promotions\":[\"view\",\"create\",\"edit\",\"delete\"],\"inventory\":[\"view\",\"create\",\"edit\",\"delete\",\"export\"],\"coupons\":[\"view\",\"create\",\"edit\",\"delete\"],\"settings\":[\"view\",\"edit\"],\"analytics\":[\"view\",\"export\"],\"logs\":[\"view\",\"export\"]}', 1, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(2, 'manager', 'Gerente', '{\"products\":[\"view\",\"create\",\"edit\",\"export\"],\"orders\":[\"view\",\"edit\",\"export\"],\"users\":[\"view\",\"export\"],\"categories\":[\"view\",\"create\",\"edit\"],\"promotions\":[\"view\",\"create\",\"edit\"],\"inventory\":[\"view\",\"edit\",\"export\"],\"coupons\":[\"view\",\"create\",\"edit\"],\"analytics\":[\"view\"],\"logs\":[\"view\"]}', 1, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(3, 'staff', 'Vendedor', '{\"products\":[\"view\"],\"orders\":[\"view\",\"edit\"],\"users\":[\"view\"],\"inventory\":[\"view\"]}', 1, '2025-12-23 21:06:21', '2025-12-23 21:06:21');
