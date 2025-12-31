
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `products`;
CREATE TABLE IF NOT EXISTS `products` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `short_description` text DEFAULT NULL,
  `price` decimal(10,2) NOT NULL,
  `compare_at_price` decimal(10,2) DEFAULT NULL,
  `category_id` int(11) NOT NULL,
  `brand` varchar(255) DEFAULT NULL,
  `sku` varchar(100) DEFAULT NULL,
  `barcode` varchar(100) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `low_stock_threshold` int(11) DEFAULT 5,
  `is_active` tinyint(1) DEFAULT 1,
  `is_featured` tinyint(1) DEFAULT 0,
  `is_new` tinyint(1) DEFAULT 0,
  `is_bestseller` tinyint(1) DEFAULT 0,
  `weight` decimal(8,2) DEFAULT NULL,
  `dimensions` varchar(100) DEFAULT NULL,
  `notes_top` text DEFAULT NULL,
  `notes_heart` text DEFAULT NULL,
  `notes_base` text DEFAULT NULL,
  `intensity` enum('Light','Moderate','Intense') DEFAULT NULL,
  `longevity` varchar(50) DEFAULT NULL,
  `sillage` varchar(50) DEFAULT NULL,
  `meta_title` varchar(255) DEFAULT NULL,
  `meta_description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `slug` (`slug`),
  UNIQUE KEY `sku` (`sku`),
  KEY `idx_slug` (`slug`),
  KEY `idx_category` (`category_id`),
  KEY `idx_active` (`is_active`),
  KEY `idx_featured` (`is_featured`),
  KEY `idx_sku` (`sku`),
  KEY `idx_products_category_active_created` (`category_id`,`is_active`,`created_at`),
  KEY `idx_products_active_created` (`is_active`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `products`:
--   `category_id`
--       `categories` -> `id`
--

--
-- Truncar tablas antes de insertar `products`
--

TRUNCATE TABLE `products`;
--
-- Volcado de datos para la tabla `products`
--

INSERT IGNORE INTO `products` (`id`, `name`, `slug`, `description`, `short_description`, `price`, `compare_at_price`, `category_id`, `brand`, `sku`, `barcode`, `stock`, `low_stock_threshold`, `is_active`, `is_featured`, `is_new`, `is_bestseller`, `weight`, `dimensions`, `notes_top`, `notes_heart`, `notes_base`, `intensity`, `longevity`, `sillage`, `meta_title`, `meta_description`, `created_at`, `updated_at`) VALUES
(1, 'Nuit de Rose - Eau de Parfum', 'nuit-de-rose-eau-de-parfum', 'Una fragancia cautivadora que captura la esencia de un jardín de rosas al anochecer.', NULL, 185.00, NULL, 1, 'Maison Lumière', NULL, NULL, 50, 5, 1, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(2, 'Lumière Dorée - Eau de Toilette', 'lumiere-doree-eau-de-toilette', 'Un rayo de sol capturado en una botella. Cítricos vibrantes y flores blancas.', NULL, 145.00, NULL, 1, 'Maison Lumière', NULL, NULL, 30, 5, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(3, 'Rouge Absolu - Matte Lipstick', 'rouge-absolu-matte-lipstick', 'Color intenso con un acabado mate aterciopelado que no reseca.', NULL, 45.00, NULL, 2, 'Élégance Parisienne', NULL, NULL, 100, 5, 1, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(4, 'Élixir de Jeunesse - Night Serum', 'elixir-de-jeunesse-night-serum', 'Suero reparador nocturno con retinol encapsulado y aceites botánicos raros.', NULL, 125.00, NULL, 3, 'Jardin Secret', NULL, NULL, 25, 5, 1, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(5, 'Silk Scarf - Jardin de Nuit', 'silk-scarf-jardin-de-nuit', 'Pañuelo de seda 100% con estampado floral exclusivo pintado a mano.', NULL, 180.00, NULL, 4, 'Aurore Dorée', NULL, NULL, 15, 5, 1, 1, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 21:06:21', '2025-12-23 21:06:21'),
(7, 'Velours Noir - Parfum Intense', 'velours-noir-parfum-intense', 'Una fragancia sofisticada y misteriosa con notas de cuero, tabaco y especias exóticas.', 'Fragancia intensa y sofisticada', 220.00, 260.00, 3, 'Maison Lumière', 'ML-VN-100', NULL, 25, 5, 1, 0, 0, 1, NULL, NULL, 'Pimienta Negra, Cardamomo', 'Rosa Negra, Cuero', 'Tabaco, Vainilla, Ámbar', 'Intense', '10-14 hours', 'Strong', NULL, NULL, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(8, 'Rose Secret - Body Lotion', 'rose-secret-body-lotion', 'Hidratante corporal con extracto de rosa y manteca de karité. Deja la piel suave y perfumada.', 'Hidratante corporal con extracto de rosa', 45.00, 55.00, 1, 'Rose Secret', 'RS-BL-250', NULL, 100, 5, 1, 0, 1, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-26 15:43:37', '2025-12-26 15:43:37'),
(9, 'Gardenia Blanca - Eau de Parfum', 'gardenia-blanca-eau-de-parfum', 'Fragancia floral pura con notas de gardenia, jazmín y lirio. Perfecta para ocasiones especiales.', 'Fragancia floral pura y elegante', 165.00, 195.00, 4, 'Maison Lumière', 'ML-GB-100', NULL, 40, 5, 1, 1, 0, 0, NULL, NULL, 'Gardenia, Lirio', 'Jazmín, Tuberosa', 'Musk, Sándalo', 'Moderate', '6-8 hours', 'Moderate', NULL, NULL, '2025-12-26 15:43:37', '2025-12-26 15:43:37');
