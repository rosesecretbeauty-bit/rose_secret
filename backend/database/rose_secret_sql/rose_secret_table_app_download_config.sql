
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `app_download_config`
--
-- Creación: 26-12-2025 a las 16:02:11
--

DROP TABLE IF EXISTS `app_download_config`;
CREATE TABLE IF NOT EXISTS `app_download_config` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `active` tinyint(1) DEFAULT 0 COMMENT 'Si está activa la sección',
  `android_url` varchar(500) DEFAULT NULL COMMENT 'URL de Google Play Store',
  `ios_url` varchar(500) DEFAULT NULL COMMENT 'URL de App Store',
  `web_url` varchar(500) DEFAULT NULL COMMENT 'URL de PWA o web app',
  `app_name` varchar(255) DEFAULT 'Rose Secret' COMMENT 'Nombre de la app',
  `app_description` text DEFAULT NULL COMMENT 'Descripción corta',
  `app_rating` decimal(3,1) DEFAULT NULL COMMENT 'Rating de la app (ej: 4.9)',
  `app_reviews_count` int(11) DEFAULT NULL COMMENT 'Cantidad de reviews',
  `qr_code_url` varchar(500) DEFAULT NULL COMMENT 'URL de imagen QR code',
  `banner_text` varchar(255) DEFAULT NULL COMMENT 'Texto personalizado del banner',
  `interstitial_enabled` tinyint(1) DEFAULT 0 COMMENT 'Mostrar intersticial en móviles',
  `interstitial_trigger_views` int(11) DEFAULT 3 COMMENT 'Después de cuántas vistas mostrar',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `app_download_config`:
--

--
-- Truncar tablas antes de insertar `app_download_config`
--

TRUNCATE TABLE `app_download_config`;
--
-- Volcado de datos para la tabla `app_download_config`
--

INSERT IGNORE INTO `app_download_config` (`id`, `active`, `android_url`, `ios_url`, `web_url`, `app_name`, `app_description`, `app_rating`, `app_reviews_count`, `qr_code_url`, `banner_text`, `interstitial_enabled`, `interstitial_trigger_views`, `created_at`, `updated_at`) VALUES
(1, 0, NULL, NULL, NULL, 'Rose Secret', 'La mejor experiencia de compra de lujo', NULL, NULL, NULL, NULL, 0, 3, '2025-12-26 16:02:11', '2025-12-26 16:02:11');
