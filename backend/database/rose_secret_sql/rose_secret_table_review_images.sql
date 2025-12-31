
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `review_images`
--
-- Creación: 23-12-2025 a las 21:06:20
--

DROP TABLE IF EXISTS `review_images`;
CREATE TABLE IF NOT EXISTS `review_images` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `review_id` int(11) NOT NULL,
  `image_url` varchar(500) NOT NULL,
  `sort_order` int(11) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_review` (`review_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- RELACIONES PARA LA TABLA `review_images`:
--   `review_id`
--       `reviews` -> `id`
--

--
-- Truncar tablas antes de insertar `review_images`
--

TRUNCATE TABLE `review_images`;