
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `influencer_products`
--
-- Creación: 26-12-2025 a las 22:48:55
--

DROP TABLE IF EXISTS `influencer_products`;
CREATE TABLE IF NOT EXISTS `influencer_products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `influencer_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `role` varchar(100) DEFAULT NULL COMMENT 'Rol del producto en la colección (ej: "Fragancia Principal", "Esencial")',
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_influencer_product` (`influencer_id`,`product_id`),
  KEY `idx_influencer` (`influencer_id`),
  KEY `idx_product` (`product_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `influencer_products`:
--   `influencer_id`
--       `influencers` -> `id`
--   `product_id`
--       `products` -> `id`
--

--
-- Truncar tablas antes de insertar `influencer_products`
--

TRUNCATE TABLE `influencer_products`;