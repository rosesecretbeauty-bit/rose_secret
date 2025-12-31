
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--
-- Creación: 23-12-2025 a las 17:18:50
-- Última actualización: 30-12-2025 a las 19:45:04
--

DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `role` enum('customer','admin','manager','staff') DEFAULT 'customer',
  `avatar` varchar(500) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `bio` text DEFAULT NULL,
  `location` varchar(255) DEFAULT NULL,
  `email_verified` tinyint(1) DEFAULT 0,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_login_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_role` (`role`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `users`:
--

--
-- Truncar tablas antes de insertar `users`
--

TRUNCATE TABLE `users`;
--
-- Volcado de datos para la tabla `users`
--

INSERT IGNORE INTO `users` (`id`, `email`, `password_hash`, `name`, `role`, `avatar`, `phone`, `bio`, `location`, `email_verified`, `email_verified_at`, `created_at`, `updated_at`, `last_login_at`) VALUES
(1, 'rose.secret.beauty@gmail.com', '$2a$10$cX6V8ccPo4EhB5JlIJYRfeh2BQ5qW2spAk6ykHm10RNcOoVTivahO', 'Admin Rose', 'admin', 'https://res.cloudinary.com/dy7jklqnm/image/upload/v1767115322/rose-secret/users/1/avatar/kwpr3ucikvwh1fm2xdsn.jpg', '+52 777 448 6398', 'Administrador de Rose Secret', 'Morelos, Mexico', 0, NULL, '2025-12-23 21:06:21', '2025-12-30 18:45:40', '2025-12-30 18:45:40'),
(2, 'maria.garcia@example.com', '$2a$10$NbN89ijJXtgJMvGZs.H.S.3Qgz5uxrEHqxf0lLUmAPt1wZFl72F.C', 'María García', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:54', '2025-12-26 15:41:54', NULL),
(3, 'carlos.rodriguez@example.com', '$2a$10$vVspmHafiZ28YRyY9v10iuCyap//WWOWhvf2b7iMndji/5DdaMkz.', 'Carlos Rodríguez', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:54', '2025-12-26 15:41:54', NULL),
(4, 'ana.martinez@example.com', '$2a$10$Fxuber4Ga3arb/tJjboIh.VRQ351d6FNVc0ffc3rBGsUgOpNKSOGO', 'Ana Martínez', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:54', '2025-12-26 15:41:54', NULL),
(5, 'luis.lopez@example.com', '$2a$10$XU1fcWvyfJKWx3/yLInlWuBVuoWMKaT5Mc80kFClF2dJjs5vnB9Vi', 'Luis López', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:54', '2025-12-26 15:41:54', NULL),
(6, 'sofia.hernandez@example.com', '$2a$10$toME7pv9iLTUytvaVQAR2uYyW7KcKBnyO64wDyzmX.rzAN.wy.gzG', 'Sofía Hernández', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:55', '2025-12-26 15:41:55', NULL),
(7, 'manager@rosesecret.com', '$2a$10$a2Do6jeyM2M8dzVbVJEUrO.v2UMeZbtUDM0Nj3No6VwAFLzU3uoli', 'Manager Test', 'manager', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:55', '2025-12-26 15:41:55', NULL),
(8, 'staff@rosesecret.com', '$2a$10$ImoTsAyxmbBkKyTDiMH1OeJ36IYoowppc/kEmRB7xYUf5nHqzMkc6', 'Staff Test', 'staff', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-26 15:41:55', '2025-12-26 15:41:55', NULL),
(9, 'emilianoaquino04@gmail.com', '$2a$10$xOxd5zG3YMBHWOVQAypBzuDqwhaMYG1L8zMk/hqx0516NluPXQ5cy', 'Carlos Emiliano', 'customer', 'https://media.istockphoto.com/id/1495088043/es/vector/icono-de-perfil-de-usuario-avatar-o-icono-de-persona-foto-de-perfil-s%C3%ADmbolo-de-retrato.jpg?s=612x612&w=0&k=20&c=mY3gnj2lU7khgLhV6dQBNqomEGj3ayWH-xtpYuCXrzk=', '+527774486398', NULL, NULL, 0, NULL, '2025-12-30 14:46:09', '2025-12-30 15:45:16', NULL),
(10, 'crissic165@gmail.com', '$2a$10$bqYzGzn.WFGqNJRmgqLBLuYZ/qodjZi9Mr7jh/RFMyo.6aIwozYS.', 'Crissi Cruz Bustos', 'customer', NULL, NULL, NULL, NULL, 0, NULL, '2025-12-30 19:18:00', '2025-12-30 19:45:04', '2025-12-30 19:45:04');
