
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--
-- Creación: 23-12-2025 a las 17:18:50
--

DROP TABLE IF EXISTS `order_items`;
CREATE TABLE IF NOT EXISTS `order_items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_id` int(11) DEFAULT NULL,
  `product_name` varchar(255) NOT NULL,
  `product_sku` varchar(100) DEFAULT NULL,
  `variant_name` varchar(255) DEFAULT NULL,
  `product_price` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `product_id` (`product_id`),
  KEY `variant_id` (`variant_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `order_items`:
--   `order_id`
--       `orders` -> `id`
--   `product_id`
--       `products` -> `id`
--   `variant_id`
--       `product_variants` -> `id`
--

--
-- Truncar tablas antes de insertar `order_items`
--

TRUNCATE TABLE `order_items`;
--
-- Volcado de datos para la tabla `order_items`
--

INSERT IGNORE INTO `order_items` (`id`, `order_id`, `product_id`, `variant_id`, `product_name`, `product_sku`, `variant_name`, `product_price`, `quantity`, `subtotal`, `created_at`) VALUES
(1, 1, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 2, 440.00, '2025-12-26 15:43:37'),
(2, 2, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:43:37'),
(3, 3, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 1, 45.00, '2025-12-26 15:43:37'),
(4, 4, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 1, 220.00, '2025-12-26 15:43:37'),
(5, 5, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 1, 185.00, '2025-12-26 15:43:37'),
(6, 6, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 2, 370.00, '2025-12-26 15:43:37'),
(7, 7, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:43:37'),
(8, 8, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 1, 185.00, '2025-12-26 15:43:37'),
(9, 9, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 1, 185.00, '2025-12-26 15:43:37'),
(10, 10, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 3, 495.00, '2025-12-26 15:43:37'),
(11, 11, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 2, 370.00, '2025-12-26 15:43:37'),
(12, 12, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 3, 555.00, '2025-12-26 15:43:37'),
(13, 13, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 3, 135.00, '2025-12-26 15:43:37'),
(14, 14, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:43:37'),
(15, 15, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 1, 45.00, '2025-12-26 15:43:37'),
(16, 16, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 2, 330.00, '2025-12-26 15:46:17'),
(17, 17, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:46:17'),
(18, 18, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:46:17'),
(19, 19, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 3, 660.00, '2025-12-26 15:46:17'),
(20, 20, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:46:17'),
(21, 21, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 2, 440.00, '2025-12-26 15:46:17'),
(22, 22, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:46:17'),
(23, 23, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:46:17'),
(24, 24, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 3, 435.00, '2025-12-26 15:46:17'),
(25, 25, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 2, 330.00, '2025-12-26 15:46:17'),
(26, 26, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 2, 440.00, '2025-12-26 15:46:17'),
(27, 27, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 3, 660.00, '2025-12-26 15:46:17'),
(28, 28, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 2, 440.00, '2025-12-26 15:46:17'),
(29, 29, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 1, 45.00, '2025-12-26 15:46:17'),
(30, 30, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 1, 45.00, '2025-12-26 15:46:17'),
(31, 31, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 2, 290.00, '2025-12-26 15:47:27'),
(32, 32, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 2, 290.00, '2025-12-26 15:47:27'),
(33, 33, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 2, 370.00, '2025-12-26 15:47:27'),
(34, 34, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 2, 290.00, '2025-12-26 15:47:27'),
(35, 35, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 1, 165.00, '2025-12-26 15:47:27'),
(36, 36, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 1, 220.00, '2025-12-26 15:47:27'),
(37, 37, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 3, 435.00, '2025-12-26 15:47:27'),
(38, 38, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:47:27'),
(39, 39, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:47:27'),
(40, 40, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 1, 165.00, '2025-12-26 15:47:27'),
(41, 41, 7, NULL, 'Velours Noir - Parfum Intense', 'ML-VN-100', NULL, 220.00, 1, 220.00, '2025-12-26 15:47:27'),
(42, 42, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 1, 165.00, '2025-12-26 15:47:27'),
(43, 43, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 2, 330.00, '2025-12-26 15:47:27'),
(44, 44, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 1, 185.00, '2025-12-26 15:47:27'),
(45, 45, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 2, 370.00, '2025-12-26 15:47:28'),
(46, 46, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 1, 45.00, '2025-12-26 15:48:08'),
(47, 47, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 2, 370.00, '2025-12-26 15:48:08'),
(48, 48, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 3, 135.00, '2025-12-26 15:48:08'),
(49, 49, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 2, 290.00, '2025-12-26 15:48:08'),
(50, 50, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 1, 165.00, '2025-12-26 15:48:08'),
(51, 51, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 2, 290.00, '2025-12-26 15:48:08'),
(52, 52, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 3, 435.00, '2025-12-26 15:48:08'),
(53, 53, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 3, 435.00, '2025-12-26 15:48:08'),
(54, 54, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 1, 185.00, '2025-12-26 15:48:08'),
(55, 55, 8, NULL, 'Rose Secret - Body Lotion', 'RS-BL-250', NULL, 45.00, 2, 90.00, '2025-12-26 15:48:08'),
(56, 56, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:48:08'),
(57, 57, 1, NULL, 'Nuit de Rose - Eau de Parfum', 'ML-NR-100', NULL, 185.00, 3, 555.00, '2025-12-26 15:48:08'),
(58, 58, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 3, 435.00, '2025-12-26 15:48:08'),
(59, 59, 2, NULL, 'Lumière Dorée - Eau de Toilette', 'ML-LD-50', NULL, 145.00, 1, 145.00, '2025-12-26 15:48:08'),
(60, 60, 9, NULL, 'Gardenia Blanca - Eau de Parfum', 'ML-GB-100', NULL, 165.00, 1, 165.00, '2025-12-26 15:48:08');
