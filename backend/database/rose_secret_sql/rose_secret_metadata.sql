
--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `products`
--
ALTER TABLE `products` ADD FULLTEXT KEY `idx_search` (`name`,`description`,`short_description`);

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `addresses`
--
ALTER TABLE `addresses`
  ADD CONSTRAINT `addresses_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `attribute_values`
--
ALTER TABLE `attribute_values`
  ADD CONSTRAINT `attribute_values_ibfk_1` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `banners`
--
ALTER TABLE `banners`
  ADD CONSTRAINT `fk_banners_user` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `blogs`
--
ALTER TABLE `blogs`
  ADD CONSTRAINT `fk_blogs_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `blog_images`
--
ALTER TABLE `blog_images`
  ADD CONSTRAINT `fk_blog_images_blog` FOREIGN KEY (`blog_id`) REFERENCES `blogs` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `categories`
--
ALTER TABLE `categories`
  ADD CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`parent_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `coupon_usage`
--
ALTER TABLE `coupon_usage`
  ADD CONSTRAINT `coupon_usage_ibfk_1` FOREIGN KEY (`coupon_id`) REFERENCES `coupons` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `coupon_usage_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `email_verification_tokens`
--
ALTER TABLE `email_verification_tokens`
  ADD CONSTRAINT `email_verification_tokens_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `influencer_products`
--
ALTER TABLE `influencer_products`
  ADD CONSTRAINT `influencer_products_ibfk_1` FOREIGN KEY (`influencer_id`) REFERENCES `influencers` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `influencer_products_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventory`
--
ALTER TABLE `inventory`
  ADD CONSTRAINT `inventory_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `inventory_movements`
--
ALTER TABLE `inventory_movements`
  ADD CONSTRAINT `inventory_movements_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `inventory_movements_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `loyalty_points`
--
ALTER TABLE `loyalty_points`
  ADD CONSTRAINT `fk_loyalty_points_tier` FOREIGN KEY (`tier_id`) REFERENCES `loyalty_tiers` (`id`),
  ADD CONSTRAINT `fk_loyalty_points_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `loyalty_redemptions`
--
ALTER TABLE `loyalty_redemptions`
  ADD CONSTRAINT `fk_loyalty_red_reward` FOREIGN KEY (`reward_id`) REFERENCES `loyalty_rewards` (`id`),
  ADD CONSTRAINT `fk_loyalty_red_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `loyalty_transactions`
--
ALTER TABLE `loyalty_transactions`
  ADD CONSTRAINT `fk_loyalty_trans_order` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_loyalty_trans_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `notification_preferences`
--
ALTER TABLE `notification_preferences`
  ADD CONSTRAINT `notification_preferences_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Filtros para la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`),
  ADD CONSTRAINT `order_items_ibfk_3` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `order_status_history`
--
ALTER TABLE `order_status_history`
  ADD CONSTRAINT `order_status_history_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_status_history_ibfk_2` FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD CONSTRAINT `fk_password_reset_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD CONSTRAINT `fk_payment_methods_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Filtros para la tabla `product_attributes`
--
ALTER TABLE `product_attributes`
  ADD CONSTRAINT `product_attributes_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_attributes_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `recently_viewed`
--
ALTER TABLE `recently_viewed`
  ADD CONSTRAINT `recently_viewed_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `recently_viewed_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `reviews_ibfk_3` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `review_images`
--
ALTER TABLE `review_images`
  ADD CONSTRAINT `review_images_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `review_replies`
--
ALTER TABLE `review_replies`
  ADD CONSTRAINT `review_replies_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_replies_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `review_votes`
--
ALTER TABLE `review_votes`
  ADD CONSTRAINT `review_votes_ibfk_1` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `review_votes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `role_permissions`
--
ALTER TABLE `role_permissions`
  ADD CONSTRAINT `role_permissions_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `role_permissions_ibfk_2` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `saved_searches`
--
ALTER TABLE `saved_searches`
  ADD CONSTRAINT `saved_searches_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `social_posts`
--
ALTER TABLE `social_posts`
  ADD CONSTRAINT `social_posts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `social_post_likes`
--
ALTER TABLE `social_post_likes`
  ADD CONSTRAINT `social_post_likes_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `social_post_likes_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `social_post_media`
--
ALTER TABLE `social_post_media`
  ADD CONSTRAINT `social_post_media_ibfk_1` FOREIGN KEY (`post_id`) REFERENCES `social_posts` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tracking_events`
--
ALTER TABLE `tracking_events`
  ADD CONSTRAINT `tracking_events_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_badges`
--
ALTER TABLE `user_badges`
  ADD CONSTRAINT `user_badges_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_roles`
--
ALTER TABLE `user_roles`
  ADD CONSTRAINT `user_roles_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `user_roles_ibfk_2` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `user_settings`
--
ALTER TABLE `user_settings`
  ADD CONSTRAINT `fk_user_settings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `variant_attribute_values`
--
ALTER TABLE `variant_attribute_values`
  ADD CONSTRAINT `variant_attribute_values_ibfk_1` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `variant_attribute_values_ibfk_2` FOREIGN KEY (`attribute_id`) REFERENCES `attributes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `variant_attribute_values_ibfk_3` FOREIGN KEY (`attribute_value_id`) REFERENCES `attribute_values` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `waitlist`
--
ALTER TABLE `waitlist`
  ADD CONSTRAINT `fk_waitlist_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_waitlist_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_waitlist_variant` FOREIGN KEY (`variant_id`) REFERENCES `product_variants` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;


--
-- Metadatos
--
USE `phpmyadmin`;

--
-- Metadatos para la tabla abandoned_carts
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla addresses
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla app_download_config
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla app_settings
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla attributes
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla attribute_values
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla audit_logs
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla banners
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla blogs
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla blog_images
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla cart_items
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla categories
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla coupons
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla coupon_usage
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla email_config
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla email_templates
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla email_verification_tokens
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla influencers
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla influencer_products
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla inventory
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla inventory_movements
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla loyalty_points
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla loyalty_redemptions
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla loyalty_rewards
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla loyalty_tiers
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla loyalty_transactions
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla notifications
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla notification_preferences
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla orders
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla order_items
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla order_status_history
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla password_reset_tokens
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla payments
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla payment_methods
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla permissions
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla products
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla product_attributes
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla product_images
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla product_variants
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla promotions
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla recently_viewed
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla reviews
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla review_images
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla review_replies
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla review_votes
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla roles
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla role_permissions
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla saved_searches
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla social_posts
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla social_post_likes
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla social_post_media
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla stripe_events
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla tracking_events
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla users
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla user_badges
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla user_roles
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla user_settings
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla variant_attribute_values
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla waitlist
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la tabla wishlists
--
-- Error leyendo datos de la tabla phpmyadmin.pma__column_info: #1100 - Tabla &#039;pma__column_info&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__table_uiprefs: #1100 - Tabla &#039;pma__table_uiprefs&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__tracking: #1100 - Tabla &#039;pma__tracking&#039; no fue trabada con LOCK TABLES

--
-- Metadatos para la base de datos rose_secret
--
-- Error leyendo datos de la tabla phpmyadmin.pma__bookmark: #1100 - Tabla &#039;pma__bookmark&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__relation: #1100 - Tabla &#039;pma__relation&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__savedsearches: #1100 - Tabla &#039;pma__savedsearches&#039; no fue trabada con LOCK TABLES
-- Error leyendo datos de la tabla phpmyadmin.pma__central_columns: #1100 - Tabla &#039;pma__central_columns&#039; no fue trabada con LOCK TABLES
