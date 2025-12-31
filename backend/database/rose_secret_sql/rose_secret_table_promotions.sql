
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promotions`
--
-- Creación: 26-12-2025 a las 16:05:49
--

DROP TABLE IF EXISTS `promotions`;
CREATE TABLE IF NOT EXISTS `promotions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `type` enum('flash_sale','banner','popup','homepage_section') DEFAULT 'banner' COMMENT 'Tipo de promoción',
  `title` varchar(255) NOT NULL COMMENT 'Título de la promoción',
  `description` text DEFAULT NULL COMMENT 'Descripción',
  `discount_percentage` decimal(5,2) DEFAULT NULL COMMENT 'Porcentaje de descuento (ej: 40.00)',
  `discount_amount` decimal(10,2) DEFAULT NULL COMMENT 'Descuento fijo',
  `discount_type` enum('percentage','fixed') DEFAULT 'percentage',
  `start_date` timestamp NULL DEFAULT NULL COMMENT 'Fecha de inicio',
  `end_date` timestamp NULL DEFAULT NULL COMMENT 'Fecha de fin',
  `active` tinyint(1) DEFAULT 1 COMMENT 'Si está activa',
  `cta_text` varchar(100) DEFAULT 'Comprar Ahora' COMMENT 'Texto del botón CTA',
  `cta_url` varchar(500) DEFAULT NULL COMMENT 'URL del CTA (ej: /sale, /category/perfumes)',
  `banner_position` enum('top','header','homepage','floating') DEFAULT 'header' COMMENT 'Dónde mostrar el banner',
  `target_categories` text DEFAULT NULL COMMENT 'JSON array de category_ids',
  `target_products` text DEFAULT NULL COMMENT 'JSON array de product_ids',
  `min_purchase` decimal(10,2) DEFAULT NULL COMMENT 'Compra mínima requerida',
  `max_discount` decimal(10,2) DEFAULT NULL COMMENT 'Descuento máximo',
  `usage_limit` int(11) DEFAULT NULL COMMENT 'Límite de usos totales',
  `usage_count` int(11) DEFAULT 0 COMMENT 'Usos actuales',
  `image_url` varchar(500) DEFAULT NULL COMMENT 'Imagen del banner',
  `background_color` varchar(50) DEFAULT NULL COMMENT 'Color de fondo (hex)',
  `text_color` varchar(50) DEFAULT NULL COMMENT 'Color de texto (hex)',
  `show_countdown` tinyint(1) DEFAULT 1 COMMENT 'Mostrar countdown',
  `priority` int(11) DEFAULT 0 COMMENT 'Prioridad (mayor = primero)',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_active` (`active`),
  KEY `idx_type` (`type`),
  KEY `idx_dates` (`start_date`,`end_date`),
  KEY `idx_position` (`banner_position`),
  KEY `idx_priority` (`priority`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `promotions`:
--

--
-- Truncar tablas antes de insertar `promotions`
--

TRUNCATE TABLE `promotions`;