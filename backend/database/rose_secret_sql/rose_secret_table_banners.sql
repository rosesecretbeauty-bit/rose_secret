
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `banners`
--
-- Creación: 30-12-2025 a las 16:54:24
--

DROP TABLE IF EXISTS `banners`;
CREATE TABLE IF NOT EXISTS `banners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('home','promotion','sidebar','popup') NOT NULL DEFAULT 'home',
  `title` varchar(255) DEFAULT NULL COMMENT 'Título del banner (opcional)',
  `image_url` varchar(500) NOT NULL COMMENT 'URL de imagen en Cloudinary',
  `link_url` varchar(500) DEFAULT NULL COMMENT 'URL de destino al hacer clic',
  `link_text` varchar(255) DEFAULT NULL COMMENT 'Texto del enlace',
  `status` enum('active','inactive','scheduled') DEFAULT 'inactive',
  `start_date` timestamp NULL DEFAULT NULL COMMENT 'Fecha de inicio (para scheduled)',
  `end_date` timestamp NULL DEFAULT NULL COMMENT 'Fecha de fin (para scheduled)',
  `display_order` int(11) DEFAULT 0 COMMENT 'Orden de visualización',
  `click_count` int(11) DEFAULT 0 COMMENT 'Contador de clics',
  `created_by` int(11) DEFAULT NULL COMMENT 'Usuario que creó el banner',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_type` (`type`),
  KEY `idx_status` (`status`),
  KEY `idx_order` (`display_order`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_banners_type_status_order` (`type`,`status`,`display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `banners`:
--   `created_by`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `banners`
--

TRUNCATE TABLE `banners`;