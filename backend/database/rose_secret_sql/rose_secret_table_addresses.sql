
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `addresses`
--
-- Creación: 23-12-2025 a las 21:06:19
--

DROP TABLE IF EXISTS `addresses`;
CREATE TABLE IF NOT EXISTS `addresses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `type` enum('billing','shipping','both') DEFAULT 'both',
  `first_name` varchar(255) NOT NULL,
  `last_name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(100) NOT NULL,
  `zip_code` varchar(20) NOT NULL,
  `country` varchar(100) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_default` (`is_default`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `addresses`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `addresses`
--

TRUNCATE TABLE `addresses`;
--
-- Volcado de datos para la tabla `addresses`
--

INSERT IGNORE INTO `addresses` (`id`, `user_id`, `type`, `first_name`, `last_name`, `company`, `street`, `city`, `state`, `zip_code`, `country`, `phone`, `is_default`, `created_at`, `updated_at`) VALUES
(2, 1, 'both', 'Carlos Emiliano', 'Aquino Gonzalez', NULL, 'Emiliano Zapata 144', 'Cuernavaca', 'Norelos', '62320', 'Mexico', '7774486398', 1, '2025-12-26 15:20:52', '2025-12-26 15:20:52'),
(3, 2, 'both', 'María', 'García', NULL, 'Calle 77 #47', 'Ciudad de México', 'CDMX', '10495', 'México', '5502418285', 1, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(4, 3, 'both', 'Carlos', 'Rodríguez', NULL, 'Calle 48 #28', 'Ciudad de México', 'CDMX', '10923', 'México', '5509491914', 1, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(5, 4, 'both', 'Ana', 'Martínez', NULL, 'Calle 21 #91', 'Ciudad de México', 'CDMX', '10968', 'México', '5505019782', 1, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(6, 5, 'both', 'Luis', 'López', NULL, 'Calle 66 #51', 'Ciudad de México', 'CDMX', '10809', 'México', '5509620314', 1, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(7, 6, 'both', 'Sofía', 'Hernández', NULL, 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', 1, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(8, 2, 'both', 'María', 'García', NULL, 'Calle 99 #8', 'Ciudad de México', 'CDMX', '10487', 'México', '5508800508', 1, '2025-12-26 15:46:16', '2025-12-26 15:46:16'),
(9, 3, 'both', 'Carlos', 'Rodríguez', NULL, 'Calle 66 #9', 'Ciudad de México', 'CDMX', '10904', 'México', '5500327674', 1, '2025-12-26 15:46:16', '2025-12-26 15:46:16'),
(10, 4, 'both', 'Ana', 'Martínez', NULL, 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', 1, '2025-12-26 15:46:16', '2025-12-26 15:46:16'),
(11, 5, 'both', 'Luis', 'López', NULL, 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', 1, '2025-12-26 15:46:16', '2025-12-26 15:46:16'),
(12, 6, 'both', 'Sofía', 'Hernández', NULL, 'Calle 73 #72', 'Ciudad de México', 'CDMX', '10941', 'México', '5506750178', 1, '2025-12-26 15:46:16', '2025-12-26 15:46:16'),
(13, 2, 'both', 'María', 'García', NULL, 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', 1, '2025-12-26 15:47:27', '2025-12-26 15:47:27'),
(14, 3, 'both', 'Carlos', 'Rodríguez', NULL, 'Calle 89 #62', 'Ciudad de México', 'CDMX', '10618', 'México', '5501385005', 1, '2025-12-26 15:47:27', '2025-12-26 15:47:27'),
(15, 4, 'both', 'Ana', 'Martínez', NULL, 'Calle 50 #6', 'Ciudad de México', 'CDMX', '10010', 'México', '5507388200', 1, '2025-12-26 15:47:27', '2025-12-26 15:47:27'),
(16, 5, 'both', 'Luis', 'López', NULL, 'Calle 7 #98', 'Ciudad de México', 'CDMX', '10383', 'México', '5502001723', 1, '2025-12-26 15:47:27', '2025-12-26 15:47:27'),
(17, 6, 'both', 'Sofía', 'Hernández', NULL, 'Calle 31 #12', 'Ciudad de México', 'CDMX', '10787', 'México', '5500867389', 1, '2025-12-26 15:47:27', '2025-12-26 15:47:27'),
(18, 2, 'both', 'María', 'García', NULL, 'Calle 85 #8', 'Ciudad de México', 'CDMX', '10880', 'México', '5504021689', 1, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(19, 3, 'both', 'Carlos', 'Rodríguez', NULL, 'Calle 88 #39', 'Ciudad de México', 'CDMX', '10068', 'México', '5509235388', 1, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(20, 4, 'both', 'Ana', 'Martínez', NULL, 'Calle 54 #96', 'Ciudad de México', 'CDMX', '10968', 'México', '5509632781', 1, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(21, 5, 'both', 'Luis', 'López', NULL, 'Calle 10 #35', 'Ciudad de México', 'CDMX', '10187', 'México', '5506128920', 1, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(22, 6, 'both', 'Sofía', 'Hernández', NULL, 'Calle 48 #53', 'Ciudad de México', 'CDMX', '10825', 'México', '5500570612', 1, '2025-12-26 15:48:08', '2025-12-26 15:48:08');
