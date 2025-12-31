
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `email_config`
--
-- Creación: 30-12-2025 a las 19:23:12
-- Última actualización: 30-12-2025 a las 19:23:12
--

DROP TABLE IF EXISTS `email_config`;
CREATE TABLE IF NOT EXISTS `email_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `header_logo_url` varchar(500) DEFAULT NULL COMMENT 'URL del logo en el header',
  `header_banner_url` varchar(500) DEFAULT NULL COMMENT 'URL del banner en el header',
  `header_background_color` varchar(7) DEFAULT '#ec4899' COMMENT 'Color de fondo del header (hex)',
  `header_text_color` varchar(7) DEFAULT '#ffffff' COMMENT 'Color del texto del header (hex)',
  `footer_text` text DEFAULT NULL COMMENT 'Texto del footer',
  `footer_links` text DEFAULT NULL COMMENT 'JSON con enlaces del footer',
  `footer_background_color` varchar(7) DEFAULT '#f9fafb' COMMENT 'Color de fondo del footer (hex)',
  `footer_text_color` varchar(7) DEFAULT '#6b7280' COMMENT 'Color del texto del footer (hex)',
  `primary_color` varchar(7) DEFAULT '#ec4899' COMMENT 'Color primario para botones (hex)',
  `secondary_color` varchar(7) DEFAULT '#f43f5e' COMMENT 'Color secundario (hex)',
  `company_name` varchar(255) DEFAULT 'Rose Secret' COMMENT 'Nombre de la empresa',
  `company_address` text DEFAULT NULL COMMENT 'Dirección de la empresa',
  `company_phone` varchar(50) DEFAULT NULL COMMENT 'Teléfono de contacto',
  `company_email` varchar(255) DEFAULT NULL COMMENT 'Email de contacto',
  `social_media` text DEFAULT NULL COMMENT 'JSON con redes sociales',
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `email_config`:
--

--
-- Truncar tablas antes de insertar `email_config`
--

TRUNCATE TABLE `email_config`;
--
-- Volcado de datos para la tabla `email_config`
--

INSERT IGNORE INTO `email_config` (`id`, `header_logo_url`, `header_banner_url`, `header_background_color`, `header_text_color`, `footer_text`, `footer_links`, `footer_background_color`, `footer_text_color`, `primary_color`, `secondary_color`, `company_name`, `company_address`, `company_phone`, `company_email`, `social_media`, `is_active`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, '#ec4899', '#ffffff', '© 2025 Rose Secret. Todos los derechos reservados.', NULL, '#f9fafb', '#6b7280', '#ec4899', '#f43f5e', 'Rose Secret', NULL, NULL, 'contacto@rosesecret.com', NULL, 1, '2025-12-30 19:23:12', '2025-12-30 19:23:12');
