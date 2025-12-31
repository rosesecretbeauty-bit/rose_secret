
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `app_settings`
--
-- Creación: 30-12-2025 a las 19:23:12
-- Última actualización: 30-12-2025 a las 19:23:13
--

DROP TABLE IF EXISTS `app_settings`;
CREATE TABLE IF NOT EXISTS `app_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `setting_key` varchar(100) NOT NULL COMMENT 'Clave única de la configuración',
  `setting_value` text DEFAULT NULL COMMENT 'Valor de la configuración (puede ser JSON)',
  `setting_type` varchar(50) DEFAULT 'text' COMMENT 'Tipo: text, number, boolean, json, image_url, color',
  `category` varchar(50) DEFAULT 'general' COMMENT 'Categoría: branding, colors, contact, etc.',
  `label` varchar(255) DEFAULT NULL COMMENT 'Etiqueta para mostrar en el admin',
  `description` text DEFAULT NULL COMMENT 'Descripción de la configuración',
  `is_public` tinyint(1) DEFAULT 0 COMMENT 'Si está disponible en API pública',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_key` (`setting_key`),
  KEY `idx_category` (`category`),
  KEY `idx_public` (`is_public`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `app_settings`:
--

--
-- Truncar tablas antes de insertar `app_settings`
--

TRUNCATE TABLE `app_settings`;
--
-- Volcado de datos para la tabla `app_settings`
--

INSERT IGNORE INTO `app_settings` (`id`, `setting_key`, `setting_value`, `setting_type`, `category`, `label`, `description`, `is_public`, `created_at`, `updated_at`) VALUES
(1, 'logo_url', NULL, 'image_url', 'branding', 'Logo de la Plataforma', 'URL del logo principal de Rose Secret', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(2, 'logo_light_url', NULL, 'image_url', 'branding', 'Logo Claro', 'URL del logo para fondos oscuros', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(3, 'logo_dark_url', NULL, 'image_url', 'branding', 'Logo Oscuro', 'URL del logo para fondos claros', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(4, 'favicon_url', NULL, 'image_url', 'branding', 'Favicon', 'URL del favicon del sitio', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(5, 'platform_name', 'Rose Secret', 'text', 'branding', 'Nombre de la Plataforma', 'Nombre oficial de la plataforma', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(6, 'platform_tagline', 'Tu belleza, tu secreto', 'text', 'branding', 'Eslogan', 'Eslogan o tagline de la plataforma', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(7, 'primary_color', '#ec4899', 'color', 'branding', 'Color Primario', 'Color principal de la marca (hex)', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(8, 'secondary_color', '#f43f5e', 'color', 'branding', 'Color Secundario', 'Color secundario de la marca (hex)', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(9, 'contact_email', 'contacto@rosesecret.com', 'text', 'contact', 'Email de Contacto', 'Email principal de contacto', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(10, 'contact_phone', '+52 55 1234 5678', 'text', 'contact', 'Teléfono de Contacto', 'Teléfono principal de contacto', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(11, 'contact_address', 'Ciudad de México, México', 'text', 'contact', 'Dirección', 'Dirección física de la empresa', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(12, 'social_instagram', 'https://instagram.com/rosesecret', 'text', 'social', 'Instagram', 'URL de Instagram', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(13, 'social_facebook', 'https://facebook.com/rosesecret', 'text', 'social', 'Facebook', 'URL de Facebook', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(14, 'social_twitter', 'https://twitter.com/rosesecret', 'text', 'social', 'Twitter', 'URL de Twitter', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(15, 'currency', 'MXN', 'text', 'general', 'Moneda', 'Moneda principal de la plataforma', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(16, 'currency_symbol', '$', 'text', 'general', 'Símbolo de Moneda', 'Símbolo de la moneda', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(17, 'free_shipping_threshold', '999', 'number', 'shipping', 'Umbral Envío Gratis', 'Monto mínimo para envío gratis', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13'),
(18, 'default_shipping_cost', '99', 'number', 'shipping', 'Costo Envío Estándar', 'Costo de envío estándar', 1, '2025-12-30 19:23:13', '2025-12-30 19:23:13');
