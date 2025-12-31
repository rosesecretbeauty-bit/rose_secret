
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--
-- Creación: 29-12-2025 a las 21:16:04
--

DROP TABLE IF EXISTS `orders`;
CREATE TABLE IF NOT EXISTS `orders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `order_number` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `status` enum('pending','pending_payment','processing','shipped','delivered','cancelled','refunded','payment_failed') DEFAULT 'pending',
  `previous_status` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') DEFAULT 'pending',
  `payment_intent_id` varchar(255) DEFAULT NULL,
  `paid_at` timestamp NULL DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_provider` varchar(30) DEFAULT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) DEFAULT 0.00,
  `shipping_cost` decimal(10,2) DEFAULT 0.00,
  `discount` decimal(10,2) DEFAULT 0.00,
  `total` decimal(10,2) NOT NULL,
  `shipping_name` varchar(255) NOT NULL,
  `shipping_street` varchar(255) NOT NULL,
  `shipping_city` varchar(255) NOT NULL,
  `shipping_state` varchar(100) NOT NULL,
  `shipping_zip` varchar(20) NOT NULL,
  `shipping_country` varchar(100) NOT NULL,
  `shipping_phone` varchar(20) DEFAULT NULL,
  `billing_name` varchar(255) DEFAULT NULL,
  `billing_street` varchar(255) DEFAULT NULL,
  `billing_city` varchar(255) DEFAULT NULL,
  `billing_state` varchar(100) DEFAULT NULL,
  `billing_zip` varchar(20) DEFAULT NULL,
  `billing_country` varchar(100) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `tracking_number` varchar(100) DEFAULT NULL,
  `shipped_at` timestamp NULL DEFAULT NULL,
  `delivered_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_number` (`order_number`),
  KEY `idx_user` (`user_id`),
  KEY `idx_order_number` (`order_number`),
  KEY `idx_status` (`status`),
  KEY `idx_payment_status` (`payment_status`),
  KEY `idx_payment_intent_id` (`payment_intent_id`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_order_status` (`status`),
  KEY `idx_orders_user_status_created` (`user_id`,`status`,`created_at`),
  KEY `idx_orders_user_created` (`user_id`,`created_at`),
  KEY `idx_orders_status_created` (`status`,`created_at`)
) ENGINE=InnoDB AUTO_INCREMENT=61 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `orders`:
--   `user_id`
--       `users` -> `id`
--

--
-- Truncar tablas antes de insertar `orders`
--

TRUNCATE TABLE `orders`;
--
-- Volcado de datos para la tabla `orders`
--

INSERT IGNORE INTO `orders` (`id`, `order_number`, `user_id`, `status`, `previous_status`, `payment_status`, `payment_intent_id`, `paid_at`, `payment_method`, `payment_provider`, `subtotal`, `tax`, `shipping_cost`, `discount`, `total`, `shipping_name`, `shipping_street`, `shipping_city`, `shipping_state`, `shipping_zip`, `shipping_country`, `shipping_phone`, `billing_name`, `billing_street`, `billing_city`, `billing_state`, `billing_zip`, `billing_country`, `notes`, `tracking_number`, `shipped_at`, `delivered_at`, `created_at`, `updated_at`) VALUES
(1, 'RS63817103387', 5, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 440.00, 70.40, 99.00, 0.00, 609.40, 'Luis López', 'Calle 66 #51', 'Ciudad de México', 'CDMX', '10809', 'México', '5509620314', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 15:43:37', '2025-12-26 15:43:37'),
(2, 'RS63817141548', 6, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 0.00, 267.20, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-07 15:43:37', '2025-12-26 15:43:37'),
(3, 'RS63817153278', 4, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 45.00, 7.20, 99.00, 0.00, 151.20, 'Ana Martínez', 'Calle 21 #91', 'Ciudad de México', 'CDMX', '10968', 'México', '5505019782', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-11 15:43:37', '2025-12-26 15:43:37'),
(4, 'RS63817161318', 5, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 220.00, 35.20, 99.00, 22.00, 332.20, 'Luis López', 'Calle 66 #51', 'Ciudad de México', 'CDMX', '10809', 'México', '5509620314', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 15:43:37', '2025-12-26 15:43:37'),
(5, 'RS63817171216', 4, 'pending', NULL, 'paid', NULL, NULL, NULL, NULL, 185.00, 29.60, 99.00, 0.00, 313.60, 'Ana Martínez', 'Calle 21 #91', 'Ciudad de México', 'CDMX', '10968', 'México', '5505019782', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 15:43:37', '2025-12-26 15:43:37'),
(6, 'RS63817177934', 6, 'processing', NULL, 'failed', NULL, NULL, NULL, NULL, 370.00, 59.20, 99.00, 0.00, 528.20, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:43:37', '2025-12-26 15:43:37'),
(7, 'RS63817189475', 5, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 0.00, 203.40, 'Luis López', 'Calle 66 #51', 'Ciudad de México', 'CDMX', '10809', 'México', '5509620314', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-13 15:43:37', '2025-12-26 15:43:37'),
(8, 'RS63817197589', 3, 'processing', NULL, 'failed', NULL, NULL, NULL, NULL, 185.00, 29.60, 99.00, 0.00, 313.60, 'Carlos Rodríguez', 'Calle 48 #28', 'Ciudad de México', 'CDMX', '10923', 'México', '5509491914', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 15:43:37', '2025-12-26 15:43:37'),
(9, 'RS63817204558', 6, 'pending', NULL, 'failed', NULL, NULL, NULL, NULL, 185.00, 29.60, 99.00, 0.00, 313.60, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-27 15:43:37', '2025-12-26 15:43:37'),
(10, 'RS63817211207', 5, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 495.00, 79.20, 99.00, 0.00, 673.20, 'Luis López', 'Calle 66 #51', 'Ciudad de México', 'CDMX', '10809', 'México', '5509620314', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22 15:43:37', '2025-12-26 15:43:37'),
(11, 'RS63817219927', 6, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 370.00, 59.20, 99.00, 0.00, 528.20, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 15:43:37', '2025-12-26 15:43:37'),
(12, 'RS63817229713', 6, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 555.00, 88.80, 99.00, 55.50, 687.30, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-08 15:43:37', '2025-12-26 15:43:37'),
(13, 'RS63817238953', 3, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 135.00, 21.60, 99.00, 13.50, 242.10, 'Carlos Rodríguez', 'Calle 48 #28', 'Ciudad de México', 'CDMX', '10923', 'México', '5509491914', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 15:43:37', '2025-12-26 15:43:37'),
(14, 'RS63817244798', 3, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 0.00, 267.20, 'Carlos Rodríguez', 'Calle 48 #28', 'Ciudad de México', 'CDMX', '10923', 'México', '5509491914', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-25 15:43:37', '2025-12-26 15:43:37'),
(15, 'RS63817252108', 6, 'pending', NULL, 'paid', NULL, NULL, NULL, NULL, 45.00, 7.20, 99.00, 0.00, 151.20, 'Sofía Hernández', 'Calle 50 #88', 'Ciudad de México', 'CDMX', '10128', 'México', '5509718273', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 15:43:37', '2025-12-26 15:43:37'),
(16, 'RS63977001361', 5, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 330.00, 52.80, 99.00, 0.00, 481.80, 'Luis López', 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-24 15:46:17', '2025-12-26 15:46:17'),
(17, 'RS63977037512', 4, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 0.00, 203.40, 'Ana Martínez', 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-05 15:46:17', '2025-12-26 15:46:17'),
(18, 'RS63977046435', 5, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 14.50, 252.70, 'Luis López', 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:46:17', '2025-12-26 15:46:17'),
(19, 'RS63977053468', 5, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 660.00, 105.60, 99.00, 66.00, 798.60, 'Luis López', 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:46:17', '2025-12-26 15:46:17'),
(20, 'RS63977074706', 4, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 9.00, 194.40, 'Ana Martínez', 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 15:46:17', '2025-12-26 15:46:17'),
(21, 'RS63977086160', 5, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 440.00, 70.40, 99.00, 0.00, 609.40, 'Luis López', 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-19 15:46:17', '2025-12-26 15:46:17'),
(22, 'RS63977093332', 4, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 9.00, 194.40, 'Ana Martínez', 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 15:46:17', '2025-12-26 15:46:17'),
(23, 'RS63977103343', 6, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 14.50, 252.70, 'Sofía Hernández', 'Calle 73 #72', 'Ciudad de México', 'CDMX', '10941', 'México', '5506750178', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 15:46:17', '2025-12-26 15:46:17'),
(24, 'RS63977112062', 2, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 435.00, 69.60, 99.00, 0.00, 603.60, 'María García', 'Calle 99 #8', 'Ciudad de México', 'CDMX', '10487', 'México', '5508800508', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-12 15:46:17', '2025-12-26 15:46:17'),
(25, 'RS63977121142', 6, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 330.00, 52.80, 99.00, 33.00, 448.80, 'Sofía Hernández', 'Calle 73 #72', 'Ciudad de México', 'CDMX', '10941', 'México', '5506750178', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 15:46:17', '2025-12-26 15:46:17'),
(26, 'RS63977134855', 6, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 440.00, 70.40, 99.00, 44.00, 565.40, 'Sofía Hernández', 'Calle 73 #72', 'Ciudad de México', 'CDMX', '10941', 'México', '5506750178', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-01 15:46:17', '2025-12-26 15:46:17'),
(27, 'RS63977141616', 3, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 660.00, 105.60, 99.00, 0.00, 864.60, 'Carlos Rodríguez', 'Calle 66 #9', 'Ciudad de México', 'CDMX', '10904', 'México', '5500327674', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-09 15:46:17', '2025-12-26 15:46:17'),
(28, 'RS63977150927', 4, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 440.00, 70.40, 99.00, 0.00, 609.40, 'Ana Martínez', 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-13 15:46:17', '2025-12-26 15:46:17'),
(29, 'RS63977157615', 5, 'pending', NULL, 'paid', NULL, NULL, NULL, NULL, 45.00, 7.20, 99.00, 0.00, 151.20, 'Luis López', 'Calle 64 #99', 'Ciudad de México', 'CDMX', '10527', 'México', '5501948378', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 15:46:17', '2025-12-26 15:46:17'),
(30, 'RS63977170018', 4, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 45.00, 7.20, 99.00, 4.50, 146.70, 'Ana Martínez', 'Calle 75 #50', 'Ciudad de México', 'CDMX', '10014', 'México', '5501753441', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 15:46:17', '2025-12-26 15:46:17'),
(31, 'RS64047881823', 2, 'pending', NULL, 'failed', NULL, NULL, NULL, NULL, 290.00, 46.40, 99.00, 29.00, 406.40, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-16 15:47:27', '2025-12-26 15:47:27'),
(32, 'RS64047890819', 6, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 290.00, 46.40, 99.00, 0.00, 435.40, 'Sofía Hernández', 'Calle 31 #12', 'Ciudad de México', 'CDMX', '10787', 'México', '5500867389', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-18 15:47:27', '2025-12-26 15:47:27'),
(33, 'RS64047897793', 5, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 370.00, 59.20, 99.00, 0.00, 528.20, 'Luis López', 'Calle 7 #98', 'Ciudad de México', 'CDMX', '10383', 'México', '5502001723', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-04 15:47:27', '2025-12-26 15:47:27'),
(34, 'RS64047907327', 2, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 290.00, 46.40, 99.00, 0.00, 435.40, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-11 15:47:27', '2025-12-26 15:47:27'),
(35, 'RS64047913101', 3, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 165.00, 26.40, 99.00, 0.00, 290.40, 'Carlos Rodríguez', 'Calle 89 #62', 'Ciudad de México', 'CDMX', '10618', 'México', '5501385005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 15:47:27', '2025-12-26 15:47:27'),
(36, 'RS64047929766', 4, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 220.00, 35.20, 99.00, 0.00, 354.20, 'Ana Martínez', 'Calle 50 #6', 'Ciudad de México', 'CDMX', '10010', 'México', '5507388200', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-13 15:47:27', '2025-12-26 15:47:27'),
(37, 'RS64047940321', 2, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 435.00, 69.60, 99.00, 0.00, 603.60, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 15:47:27', '2025-12-26 15:47:27'),
(38, 'RS64047948047', 5, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 14.50, 252.70, 'Luis López', 'Calle 7 #98', 'Ciudad de México', 'CDMX', '10383', 'México', '5502001723', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-29 15:47:27', '2025-12-26 15:47:27'),
(39, 'RS64047957305', 3, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 0.00, 203.40, 'Carlos Rodríguez', 'Calle 89 #62', 'Ciudad de México', 'CDMX', '10618', 'México', '5501385005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-19 15:47:27', '2025-12-26 15:47:27'),
(40, 'RS64047962793', 6, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 165.00, 26.40, 99.00, 0.00, 290.40, 'Sofía Hernández', 'Calle 31 #12', 'Ciudad de México', 'CDMX', '10787', 'México', '5500867389', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-12 15:47:27', '2025-12-26 15:47:27'),
(41, 'RS64047968737', 2, 'pending', NULL, 'paid', NULL, NULL, NULL, NULL, 220.00, 35.20, 99.00, 0.00, 354.20, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-02 15:47:27', '2025-12-26 15:47:27'),
(42, 'RS64047977956', 2, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 165.00, 26.40, 99.00, 0.00, 290.40, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 15:47:27', '2025-12-26 15:47:27'),
(43, 'RS64047988095', 4, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 330.00, 52.80, 99.00, 33.00, 448.80, 'Ana Martínez', 'Calle 50 #6', 'Ciudad de México', 'CDMX', '10010', 'México', '5507388200', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-11-28 15:47:27', '2025-12-26 15:47:27'),
(44, 'RS64047995563', 3, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 185.00, 29.60, 99.00, 0.00, 313.60, 'Carlos Rodríguez', 'Calle 89 #62', 'Ciudad de México', 'CDMX', '10618', 'México', '5501385005', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-06 15:47:27', '2025-12-26 15:47:27'),
(45, 'RS64048002529', 2, 'pending', NULL, 'paid', NULL, NULL, NULL, NULL, 370.00, 59.20, 99.00, 0.00, 528.20, 'María García', 'Calle 48 #55', 'Ciudad de México', 'CDMX', '10860', 'México', '5506447029', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-26 15:47:28', '2025-12-26 15:47:28'),
(46, 'RS64088694297', 6, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 45.00, 7.20, 99.00, 0.00, 151.20, 'Sofía Hernández', 'Calle 48 #53', 'Ciudad de México', 'CDMX', '10825', 'México', '5500570612', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:48:08', '2025-12-26 15:48:08'),
(47, 'RS64088703596', 3, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 370.00, 59.20, 99.00, 37.00, 491.20, 'Carlos Rodríguez', 'Calle 88 #39', 'Ciudad de México', 'CDMX', '10068', 'México', '5509235388', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-23 15:48:08', '2025-12-26 15:48:08'),
(48, 'RS64088729007', 6, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 135.00, 21.60, 99.00, 0.00, 255.60, 'Sofía Hernández', 'Calle 48 #53', 'Ciudad de México', 'CDMX', '10825', 'México', '5500570612', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-12 15:48:08', '2025-12-26 15:48:08'),
(49, 'RS64088739356', 4, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 290.00, 46.40, 99.00, 0.00, 435.40, 'Ana Martínez', 'Calle 54 #96', 'Ciudad de México', 'CDMX', '10968', 'México', '5509632781', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-22 15:48:08', '2025-12-26 15:48:08'),
(50, 'RS64088748784', 3, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 165.00, 26.40, 99.00, 16.50, 273.90, 'Carlos Rodríguez', 'Calle 88 #39', 'Ciudad de México', 'CDMX', '10068', 'México', '5509235388', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-08 15:48:08', '2025-12-26 15:48:08'),
(51, 'RS64088769213', 2, 'processing', NULL, 'failed', NULL, NULL, NULL, NULL, 290.00, 46.40, 99.00, 0.00, 435.40, 'María García', 'Calle 85 #8', 'Ciudad de México', 'CDMX', '10880', 'México', '5504021689', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-07 15:48:08', '2025-12-26 15:48:08'),
(52, 'RS64088775433', 2, 'processing', NULL, 'failed', NULL, NULL, NULL, NULL, 435.00, 69.60, 99.00, 43.50, 560.10, 'María García', 'Calle 85 #8', 'Ciudad de México', 'CDMX', '10880', 'México', '5504021689', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:48:08', '2025-12-26 15:48:08'),
(53, 'RS64088784851', 3, 'cancelled', NULL, 'failed', NULL, NULL, NULL, NULL, 435.00, 69.60, 99.00, 43.50, 560.10, 'Carlos Rodríguez', 'Calle 88 #39', 'Ciudad de México', 'CDMX', '10068', 'México', '5509235388', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-21 15:48:08', '2025-12-26 15:48:08'),
(54, 'RS64088796627', 2, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 185.00, 29.60, 99.00, 0.00, 313.60, 'María García', 'Calle 85 #8', 'Ciudad de México', 'CDMX', '10880', 'México', '5504021689', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-15 15:48:08', '2025-12-26 15:48:08'),
(55, 'RS64088802810', 4, 'delivered', NULL, 'paid', NULL, NULL, NULL, NULL, 90.00, 14.40, 99.00, 9.00, 194.40, 'Ana Martínez', 'Calle 54 #96', 'Ciudad de México', 'CDMX', '10968', 'México', '5509632781', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-07 15:48:08', '2025-12-26 15:48:08'),
(56, 'RS64088811149', 5, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 0.00, 267.20, 'Luis López', 'Calle 10 #35', 'Ciudad de México', 'CDMX', '10187', 'México', '5506128920', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-26 15:48:08', '2025-12-26 15:48:08'),
(57, 'RS64088819415', 5, 'processing', NULL, 'paid', NULL, NULL, NULL, NULL, 555.00, 88.80, 99.00, 0.00, 742.80, 'Luis López', 'Calle 10 #35', 'Ciudad de México', 'CDMX', '10187', 'México', '5506128920', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-03 15:48:08', '2025-12-26 15:48:08'),
(58, 'RS64088827372', 2, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 435.00, 69.60, 99.00, 0.00, 603.60, 'María García', 'Calle 85 #8', 'Ciudad de México', 'CDMX', '10880', 'México', '5504021689', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-20 15:48:08', '2025-12-26 15:48:08'),
(59, 'RS64088833693', 6, 'shipped', NULL, 'paid', NULL, NULL, NULL, NULL, 145.00, 23.20, 99.00, 0.00, 267.20, 'Sofía Hernández', 'Calle 48 #53', 'Ciudad de México', 'CDMX', '10825', 'México', '5500570612', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-07 15:48:08', '2025-12-26 15:48:08'),
(60, 'RS64088842844', 6, 'processing', NULL, 'pending', NULL, NULL, NULL, NULL, 165.00, 26.40, 99.00, 0.00, 290.40, 'Sofía Hernández', 'Calle 48 #53', 'Ciudad de México', 'CDMX', '10825', 'México', '5500570612', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-12-26 15:48:08', '2025-12-26 15:48:08');
