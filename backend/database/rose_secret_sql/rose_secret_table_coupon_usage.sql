
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `coupon_usage`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `coupon_usage`;
CREATE TABLE IF NOT EXISTS `coupon_usage` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `coupon_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `discount_amount` decimal(10,2) NOT NULL,
  `used_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_coupon` (`coupon_id`),
  KEY `idx_user` (`user_id`),
  KEY `idx_order` (`order_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `coupon_usage`:
--   `coupon_id`
--       `coupons` -> `id`
--   `user_id`
--       `users` -> `id`
--   `order_id`
--       `orders` -> `id`
--

--
-- Truncar tablas antes de insertar `coupon_usage`
--

TRUNCATE TABLE `coupon_usage`;