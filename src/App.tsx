import React, { useState, Suspense, lazy, startTransition, Component, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import { useWishlistStore } from './stores/wishlistStore';
import { useAppSettingsStore } from './stores/appSettingsStore';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { CartDrawer } from './components/cart/CartDrawer';
import { FloatingActionButton } from './components/ui/FloatingActionButton';
import { ToastContainer } from './components/ui/Toast';
import { SearchModal } from './components/search/SearchModal';
import { ExitIntentModal } from './components/ui/ExitIntentModal';
import { SocialProof } from './components/products/SocialProof';
import { PageTransition } from './components/ui/PageTransition';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { PermissionProtectedRoute } from './components/auth/PermissionProtectedRoute';
import { PremiumLoader } from './components/ui/PremiumLoader';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Button } from './components/ui/Button';
import { KeyboardShortcutsHelper } from './components/ui/KeyboardShortcutsHelper';
import { useNotifications } from './hooks/useNotifications';
import { SyncIndicator } from './components/sync/SyncIndicator';
import { usePageTracking } from './hooks/usePageTracking';
import { AppConfigProvider } from './components/config/AppConfigProvider';
// Global Components
import { LiveChatWidget } from './components/ui/LiveChatWidget';
import { CookieConsent } from './components/ui/CookieConsent';
import { MobileAppBanner } from './components/ui/MobileAppBanner';
import { SocialProofNotification } from './components/ui/SocialProofNotification';
import { WelcomeModal } from './components/onboarding/WelcomeModal';
import { RecentlyViewedSidebar } from './components/products/RecentlyViewedSidebar';
import { AppDownloadInterstitial } from './components/mobile/AppDownloadInterstitial';
import { ComparisonFloatingBar } from './components/products/ComparisonFloatingBar';
import { AbandonedCartRecovery } from './components/cart/AbandonedCartRecovery';
import { SmartAssistant } from './components/assistant/SmartAssistant';
import { VisualShoppingJourney } from './components/navigation/VisualShoppingJourney';
import { PWAInstallPrompt } from './components/pwa/PWAInstallPrompt';
import { NetworkStatus } from './components/pwa/NetworkStatus';
// Lazy Load Pages
const HomePage = lazy(() => import('./pages/HomePage').then(module => ({
  default: module.HomePage
})));
const ShopPage = lazy(() => import('./pages/ShopPage').then(module => ({
  default: module.ShopPage
})));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage').then(module => ({
  default: module.ProductDetailPage
})));
const CartPage = lazy(() => import('./pages/CartPage').then(module => ({
  default: module.CartPage
})));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage').then(module => ({
  default: module.OrderSuccessPage
})));
const LoginPage = lazy(() => import('./pages/LoginPage').then(module => ({
  default: module.LoginPage
})));
const RegisterPage = lazy(() => import('./pages/RegisterPage').then(module => ({
  default: module.RegisterPage
})));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const WishlistPage = lazy(() => import('./pages/WishlistPage').then(module => ({
  default: module.WishlistPage
})));
const OrdersPage = lazy(() => import('./pages/OrdersPage').then(module => ({
  default: module.OrdersPage
})));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage').then(module => ({
  default: module.OrderDetailPage
})));
const ContactPage = lazy(() => import('./pages/ContactPage').then(module => ({
  default: module.ContactPage
})));
const FAQPage = lazy(() => import('./pages/FAQPage').then(module => ({
  default: module.FAQPage
})));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(module => ({
  default: module.PrivacyPage
})));
const TermsPage = lazy(() => import('./pages/TermsPage').then(module => ({
  default: module.TermsPage
})));
const AboutPage = lazy(() => import('./pages/AboutPage').then(module => ({
  default: module.AboutPage
})));
const TrackOrderPage = lazy(() => import('./pages/TrackOrderPage').then(module => ({
  default: module.TrackOrderPage
})));
const CategoryPage = lazy(() => import('./pages/CategoryPage').then(module => ({
  default: module.CategoryPage
})));
const PromotionsPage = lazy(() => import('./pages/PromotionsPage').then(module => ({
  default: module.PromotionsPage
})));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(module => ({
  default: module.NotFoundPage
})));
const NotificationsPreferencesPage = lazy(() => import('./pages/NotificationsPreferencesPage').then(module => ({
  default: module.NotificationsPreferencesPage
})));
// New Feature Pages
const StyleQuizPage = lazy(() => import('./pages/StyleQuizPage').then(module => ({
  default: module.StyleQuizPage
})));
const LiveShoppingPage = lazy(() => import('./pages/LiveShoppingPage').then(module => ({
  default: module.LiveShoppingPage
})));
const InfluencerCollectionsPage = lazy(() => import('./pages/InfluencerCollectionsPage').then(module => ({
  default: module.InfluencerCollectionsPage
})));
const BeautyAcademyPage = lazy(() => import('./pages/BeautyAcademyPage').then(module => ({
  default: module.BeautyAcademyPage
})));
const LookbooksPage = lazy(() => import('./pages/LookbooksPage').then(module => ({
  default: module.LookbooksPage
})));
const VirtualTryOnPage = lazy(() => import('./pages/VirtualTryOnPage').then(module => ({
  default: module.VirtualTryOnPage
})));
const ReferralProgramPage = lazy(() => import('./pages/ReferralProgramPage').then(module => ({
  default: module.ReferralProgramPage
})));
const GiftCardPage = lazy(() => import('./pages/GiftCardPage').then(module => ({
  default: module.GiftCardPage
})));
const SearchResultsPage = lazy(() => import('./pages/SearchResultsPage').then(module => ({
  default: module.SearchResultsPage
})));
const ComparisonPage = lazy(() => import('./pages/ComparisonPage').then(module => ({
  default: module.ComparisonPage
})));
const LoyaltyDashboardPage = lazy(() => import('./pages/LoyaltyDashboardPage').then(module => ({
  default: module.LoyaltyDashboardPage
})));
const NewArrivalsPage = lazy(() => import('./pages/NewArrivalsPage').then(module => ({
  default: module.NewArrivalsPage
})));
const SalePage = lazy(() => import('./pages/SalePage').then(module => ({
  default: module.SalePage
})));
const BestSellersPage = lazy(() => import('./pages/BestSellersPage').then(module => ({
  default: module.BestSellersPage
})));
const PreOrdersPage = lazy(() => import('./pages/PreOrdersPage').then(module => ({
  default: module.PreOrdersPage
})));
const BackInStockAlertsPage = lazy(() => import('./pages/BackInStockAlertsPage').then(module => ({
  default: module.BackInStockAlertsPage
})));
const BundleBuilderPage = lazy(() => import('./pages/BundleBuilderPage').then(module => ({
  default: module.BundleBuilderPage
})));
const FragranceLayeringPage = lazy(() => import('./pages/FragranceLayeringPage').then(module => ({
  default: module.FragranceLayeringPage
})));
const ShopTheLookPage = lazy(() => import('./pages/ShopTheLookPage').then(module => ({
  default: module.ShopTheLookPage
})));
const FitGuidePage = lazy(() => import('./pages/FitGuidePage').then(module => ({
  default: module.FitGuidePage
})));
const CustomerStoriesPage = lazy(() => import('./pages/CustomerStoriesPage').then(module => ({
  default: module.CustomerStoriesPage
})));
const BrandTimelinePage = lazy(() => import('./pages/BrandTimelinePage').then(module => ({
  default: module.BrandTimelinePage
})));
const SeasonalCollectionsPage = lazy(() => import('./pages/SeasonalCollectionsPage').then(module => ({
  default: module.SeasonalCollectionsPage
})));
const MobileCheckoutPage = lazy(() => import('./pages/MobileCheckoutPage').then(module => ({
  default: module.MobileCheckoutPage
})));
const FlashSalePage = lazy(() => import('./pages/FlashSalePage').then(module => ({
  default: module.FlashSalePage
})));
const SavedSearchesPage = lazy(() => import('./pages/SavedSearchesPage').then(module => ({
  default: module.SavedSearchesPage
})));
// Admin Pages
const AdminDashboard = lazy(() => import('./pages/AdminDashboard').then(module => ({
  default: module.AdminDashboard
})));
const ProductsManagement = lazy(() => import('./pages/admin/ProductsManagement').then(module => ({
  default: module.ProductsManagement
})));
const OrdersManagement = lazy(() => import('./pages/admin/OrdersManagement').then(module => ({
  default: module.OrdersManagement
})));
const UsersManagement = lazy(() => import('./pages/admin/UsersManagement').then(module => ({
  default: module.UsersManagement
})));
const CategoriesManagement = lazy(() => import('./pages/admin/CategoriesManagement').then(module => ({
  default: module.CategoriesManagement
})));
const PromotionsManagement = lazy(() => import('./pages/admin/PromotionsManagement').then(module => ({
  default: module.PromotionsManagement
})));
const AppConfigManagement = lazy(() => import('./pages/admin/AppConfigManagement').then(module => ({
  default: module.AppConfigManagement
})));
const AnalyticsDashboard = lazy(() => import('./pages/admin/AnalyticsDashboard').then(module => ({
  default: module.AnalyticsDashboard
})));
const ActivityLogs = lazy(() => import('./pages/admin/ActivityLogs').then(module => ({
  default: module.ActivityLogs
})));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage').then(module => ({
  default: module.SettingsPage
})));
const InventoryManagement = lazy(() => import('./pages/admin/InventoryManagement').then(module => ({
  default: module.InventoryManagement
})));
const CouponsManagement = lazy(() => import('./pages/admin/CouponsManagement').then(module => ({
  default: module.CouponsManagement
})));
const StoreSettings = lazy(() => import('./pages/admin/StoreSettings').then(module => ({
  default: module.StoreSettings
})));
const EmailTemplatesPage = lazy(() => import('./pages/admin/EmailTemplatesPage').then(module => ({
  default: module.EmailTemplatesPage
})));
const EmailConfigPage = lazy(() => import('./pages/admin/EmailConfigPage').then(module => ({
  default: module.EmailConfigPage
})));
const SecuritySettingsPage = lazy(() => import('./pages/admin/SecuritySettingsPage').then(module => ({
  default: module.SecuritySettingsPage
})));
const RolesManagement = lazy(() => import('./pages/admin/RolesManagement').then(module => ({
  default: module.RolesManagement
})));
const NotificationsPage = lazy(() => import('./pages/admin/NotificationsPage').then(module => ({
  default: module.NotificationsPage
})));
const ContentManagement = lazy(() => import('./pages/admin/ContentManagement').then(module => ({
  default: module.ContentManagement
})));
const AuditPage = lazy(() => import('./pages/admin/AuditPage').then(module => ({
  default: module.AuditPage
})));
const AbandonedCartsPage = lazy(() => import('./pages/admin/AbandonedCartsPage').then(module => ({
  default: module.AbandonedCartsPage
})));
const CustomerSegmentsPage = lazy(() => import('./pages/admin/CustomerSegmentsPage').then(module => ({
  default: module.CustomerSegmentsPage
})));
const EmailCampaignsPage = lazy(() => import('./pages/admin/EmailCampaignsPage').then(module => ({
  default: module.EmailCampaignsPage
})));
const PerformanceDashboard = lazy(() => import('./pages/admin/PerformanceDashboard').then(module => ({
  default: module.PerformanceDashboard
})));
const SEOManagementPage = lazy(() => import('./pages/admin/SEOManagementPage').then(module => ({
  default: module.SEOManagementPage
})));
// Other
const POSSystem = lazy(() => import('./pages/POSSystem').then(module => ({
  default: module.POSSystem
})));
const BlogPage = lazy(() => import('./pages/BlogPage').then(module => ({
  default: module.BlogPage
})));
const BlogPostPage = lazy(() => import('./pages/BlogPostPage').then(module => ({
  default: module.BlogPostPage
})));
const AIShopperPage = lazy(() => import('./pages/AIShopperPage').then(module => ({
  default: module.AIShopperPage
})));
const SocialShoppingPage = lazy(() => import('./pages/SocialShoppingPage').then(module => ({
  default: module.SocialShoppingPage
})));
const ScentJournalPage = lazy(() => import('./pages/ScentJournalPage').then(module => ({
  default: module.ScentJournalPage
})));
const StyleDNAPage = lazy(() => import('./pages/StyleDNAPage').then(module => ({
  default: module.StyleDNAPage
})));
const ExpertConsultationPage = lazy(() => import('./pages/ExpertConsultationPage').then(module => ({
  default: module.ExpertConsultationPage
})));
const PressPage = lazy(() => import('./pages/PressPage').then(module => ({
  default: module.PressPage
})));
const SustainabilityPage = lazy(() => import('./pages/SustainabilityPage').then(module => ({
  default: module.SustainabilityPage
})));
const PartnershipsPage = lazy(() => import('./pages/PartnershipsPage').then(module => ({
  default: module.PartnershipsPage
})));
const GiftFinderPage = lazy(() => import('./pages/GiftFinderPage').then(module => ({
  default: module.GiftFinderPage
})));
const OccasionShoppingPage = lazy(() => import('./pages/OccasionShoppingPage').then(module => ({
  default: module.OccasionShoppingPage
})));
const SiteMapPage = lazy(() => import('./components/navigation/SiteMap').then(module => ({
  default: module.SiteMap
})));
const CompleteYourLookPage = lazy(() => import('./pages/CompleteYourLookPage').then(module => ({
  default: module.CompleteYourLookPage
})));
const VerifyEmailPage = lazy(() => import('./pages/VerifyEmailPage').then(module => ({
  default: module.VerifyEmailPage
})));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage').then(module => ({
  default: module.ForgotPasswordPage
})));
const PasswordRecoveryPage = lazy(() => import('./pages/PasswordRecoveryPage').then(module => ({
  default: module.PasswordRecoveryPage
})));
function AppContent() {
  const location = useLocation();
  const [isRecentlyViewedOpen, setIsRecentlyViewedOpen] = useState(false);
  const { loadProfile, isAuthenticated } = useAuthStore();
  const { loadCart } = useCartStore();
  const { loadWishlist } = useWishlistStore();
  const { loadSettings } = useAppSettingsStore();
  
  // Cargar configuraciones de la app al iniciar
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);
  
  // Initialize simulated notifications
  // Auto-cargar notificaciones si está autenticado
  useNotifications({ autoRefresh: true });
  // Track page views
  usePageTracking();
  
  // Cargar perfil al iniciar
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);
  
  // Cargar carrito al iniciar (usuarios y guests)
  useEffect(() => {
    // Intentar cargar carrito, pero no fallar si el backend no está disponible
    loadCart().catch((error: any) => {
      // Silencioso: si es error de red, continuar sin carrito
      if (!error?.isNetworkError) {
        console.error('Error loading cart:', error);
      }
    });
    
    // Cargar descuentos automáticos después de cargar el carrito
    const loadDiscounts = async () => {
      const { useDiscountStore } = await import('./stores/discountStore');
      const discountStore = useDiscountStore.getState();
      await discountStore.loadAutomaticDiscounts();
    };
    
    // Delay para asegurar que el carrito se haya cargado
    setTimeout(loadDiscounts, 500);
  }, [loadCart]);
  
  // Cargar wishlist cuando el usuario esté autenticado
  useEffect(() => {
    if (isAuthenticated) {
      loadWishlist();
      
      // Cargar notificaciones cuando el usuario esté autenticado
      const loadNotifications = async () => {
        const { useNotificationStore } = await import('./stores/notificationStore');
        const notificationStore = useNotificationStore.getState();
        await notificationStore.loadPreferences();
        await notificationStore.refreshUnreadCount();
      };
      
      loadNotifications();
      
      // Cargar permisos cuando el usuario esté autenticado
      const loadPermissions = async () => {
        const { usePermissionStore } = await import('./stores/permissionStore');
        const permissionStore = usePermissionStore.getState();
        await permissionStore.loadPermissions();
      };
      
      loadPermissions();
    }
  }, [isAuthenticated, loadWishlist]);
  // Check if we're in admin panel
  const isAdminRoute = location.pathname.startsWith('/admin');
  // Pages that should not show breadcrumbs
  const noBreadcrumbs = ['/', '/login', '/register', '/admin', '/pos', '/virtual-try-on', '/live-shopping', '/mobile-checkout'];
  const showBreadcrumbs = !noBreadcrumbs.includes(location.pathname) && !isAdminRoute;
  // Pages that should not show mobile bottom nav
  const noBottomNav = ['/admin', '/pos', '/checkout', '/virtual-try-on', '/mobile-checkout'];
  const showBottomNav = !noBottomNav.some(path => location.pathname.startsWith(path));
  // Don't show customer UI elements in admin panel
  const showCustomerUI = !isAdminRoute && !location.pathname.startsWith('/pos') && location.pathname !== '/mobile-checkout';
  return <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900 font-sans text-gray-900 antialiased">
      {showCustomerUI && <MobileAppBanner />}
      {showCustomerUI && <Header />}

      <main className={`flex-grow ${showCustomerUI ? 'pb-20 md:pb-0' : ''}`}>
        {showBreadcrumbs && <div className="container-custom">
            <Breadcrumbs />
          </div>}

        <ErrorBoundary>
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Suspense fallback={<PremiumLoader />}>
                <Routes location={location}>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/shop" element={<ShopPage />} />
                  <Route path="/product/:id" element={<ProductDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={
                    <ErrorBoundary fallback={
                      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
                          <h1 className="text-2xl font-serif font-bold text-gray-900 mb-2">
                            Error al cargar el checkout
                          </h1>
                          <p className="text-gray-600 mb-6">
                            Por favor, intenta recargar la página o vuelve al carrito.
                          </p>
                          <Button onClick={() => window.location.href = '/cart'}>
                            Volver al Carrito
                          </Button>
                        </div>
                      </div>
                    }>
                      <CheckoutPage />
                    </ErrorBoundary>
                  } />
                  <Route path="/order-success/:orderId?" element={<OrderSuccessPage />} />
                  <Route path="/mobile-checkout" element={<MobileCheckoutPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/wishlist" element={<WishlistPage />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/comparison" element={<ComparisonPage />} />
                  <Route path="/loyalty" element={<LoyaltyDashboardPage />} />
                  <Route path="/new-arrivals" element={<NewArrivalsPage />} />
                  <Route path="/sale" element={<SalePage />} />
                  <Route path="/best-sellers" element={<BestSellersPage />} />
                  <Route path="/pre-orders" element={<PreOrdersPage />} />
                  <Route path="/back-in-stock" element={<BackInStockAlertsPage />} />
                  <Route path="/bundle-builder" element={<BundleBuilderPage />} />
                  <Route path="/fragrance-layering" element={<FragranceLayeringPage />} />
                  <Route path="/shop-the-look" element={<ShopTheLookPage />} />
                  <Route path="/fit-guide" element={<FitGuidePage />} />
                  <Route path="/customer-stories" element={<CustomerStoriesPage />} />
                  <Route path="/brand-timeline" element={<BrandTimelinePage />} />
                  <Route path="/seasonal-collections" element={<SeasonalCollectionsPage />} />
                  <Route path="/flash-sale" element={<FlashSalePage />} />
                  <Route path="/saved-searches" element={<SavedSearchesPage />} />

                  {/* Blog Routes */}
                  <Route path="/blog" element={<BlogPage />} />
                  <Route path="/blog/:id" element={<BlogPostPage />} />

                  {/* Unique Feature Routes */}
                  <Route path="/style-quiz" element={<StyleQuizPage />} />
                  <Route path="/style-dna" element={<StyleDNAPage />} />
                  <Route path="/live-shopping" element={<LiveShoppingPage />} />
                  <Route path="/social-shopping" element={<SocialShoppingPage />} />
                  <Route path="/ai-shopper" element={<AIShopperPage />} />
                  <Route path="/scent-journal" element={<ScentJournalPage />} />
                  <Route path="/expert-consultation" element={<ExpertConsultationPage />} />
                  <Route path="/influencers" element={<InfluencerCollectionsPage />} />
                  <Route path="/academy" element={<BeautyAcademyPage />} />
                  <Route path="/lookbooks" element={<LookbooksPage />} />
                  <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
                  <Route path="/referral" element={<ReferralProgramPage />} />
                  <Route path="/gift-cards" element={<GiftCardPage />} />
                  <Route path="/gift-finder" element={<GiftFinderPage />} />
                  <Route path="/occasions" element={<OccasionShoppingPage />} />

                  {/* Brand Pages */}
                  <Route path="/press" element={<PressPage />} />
                  <Route path="/sustainability" element={<SustainabilityPage />} />
                  <Route path="/partnerships" element={<PartnershipsPage />} />

                  {/* Standard Pages */}
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/faq" element={<FAQPage />} />
                  <Route path="/privacy" element={<PrivacyPage />} />
                  <Route path="/terms" element={<TermsPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/track-order" element={<TrackOrderPage />} />
                  <Route path="/category/:slug" element={<CategoryPage />} />
                  <Route path="/promotions" element={<PromotionsPage />} />

                  {/* Auth Routes */}
                  <Route path="/verify-email" element={<VerifyEmailPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/password-recovery" element={<PasswordRecoveryPage />} />
                  <Route path="/reset-password" element={<PasswordRecoveryPage />} />

                  {/* Account Routes */}
                  <Route path="/account" element={<AccountPage />} />
                  <Route path="/account/orders" element={<OrdersPage />} />
                  <Route path="/account/orders/:id" element={<OrderDetailPage />} />
                  <Route path="/account/notifications" element={<NotificationsPreferencesPage />} />

                  {/* Admin Routes - Protected by Permissions */}
                  <Route path="/admin" element={<PermissionProtectedRoute permission="analytics.read">
                        <AdminDashboard />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/products" element={<PermissionProtectedRoute permission="products.read">
                        <ProductsManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/categories" element={<PermissionProtectedRoute permission="categories.read">
                        <CategoriesManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/inventory" element={<PermissionProtectedRoute permission="inventory.read">
                        <InventoryManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/orders" element={<PermissionProtectedRoute permission="orders.read">
                        <OrdersManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/coupons" element={<PermissionProtectedRoute permission="coupons.read">
                        <CouponsManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/promotions" element={<PermissionProtectedRoute permission="promotions.read">
                        <PromotionsManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/app-config" element={<PermissionProtectedRoute permission="settings.read">
                        <AppConfigManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/users" element={<PermissionProtectedRoute permission="users.read">
                        <UsersManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/roles" element={<PermissionProtectedRoute permission="roles.read">
                        <RolesManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/analytics" element={<PermissionProtectedRoute permission="analytics.read">
                        <AnalyticsDashboard />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/notifications" element={<PermissionProtectedRoute permission="users.read">
                        <NotificationsPage />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/content" element={<PermissionProtectedRoute permission="products.read">
                        <ContentManagement />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/audit" element={<PermissionProtectedRoute permission="audit.read">
                        <AuditPage />
                      </PermissionProtectedRoute>} />
                  <Route path="/admin/logs" element={<ProtectedRoute requireAdmin>
                        <ActivityLogs />
                      </ProtectedRoute>} />
                  <Route path="/admin/store-settings" element={<ProtectedRoute requireAdmin>
                        <StoreSettings />
                      </ProtectedRoute>} />
                  <Route path="/admin/email-templates" element={<ProtectedRoute requireAdmin>
                        <EmailTemplatesPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/email-config" element={<ProtectedRoute requireAdmin>
                        <EmailConfigPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/security-settings" element={<ProtectedRoute requireAdmin>
                        <SecuritySettingsPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/settings" element={<ProtectedRoute requireAdmin>
                        <SettingsPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/abandoned-carts" element={<ProtectedRoute requireAdmin>
                        <AbandonedCartsPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/segments" element={<ProtectedRoute requireAdmin>
                        <CustomerSegmentsPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/email-campaigns" element={<ProtectedRoute requireAdmin>
                        <EmailCampaignsPage />
                      </ProtectedRoute>} />
                  <Route path="/admin/performance" element={<ProtectedRoute requireAdmin>
                        <PerformanceDashboard />
                      </ProtectedRoute>} />
                  <Route path="/admin/seo" element={<ProtectedRoute requireAdmin>
                        <SEOManagementPage />
                      </ProtectedRoute>} />

                  {/* POS Route */}
                  <Route path="/pos" element={<POSSystem />} />

                  {/* 404 */}
                  <Route path="*" element={<NotFoundPage />} />

                  {/* Add SiteMap route */}
                  <Route path="/sitemap" element={<SiteMapPage />} />

                  {/* Complete Your Look Route */}
                  <Route path="/complete-your-look" element={<CompleteYourLookPage />} />
                </Routes>
              </Suspense>
            </PageTransition>
          </AnimatePresence>
        </ErrorBoundary>
      </main>

      {showCustomerUI && <>
          <VisualShoppingJourney />
          <NetworkStatus />
          <Footer />
          {showBottomNav && <MobileBottomNav />}
          <FloatingActionButton />
          <CartDrawer />
          <SearchModal />
          <ExitIntentModal />
          <SocialProof />
          <WelcomeModal />
          <RecentlyViewedSidebar isOpen={isRecentlyViewedOpen} onClose={() => setIsRecentlyViewedOpen(false)} />
          <AppDownloadInterstitial />
          <ComparisonFloatingBar />
          <AbandonedCartRecovery />
          <KeyboardShortcutsHelper />
          <SyncIndicator />

          {/* New Global Features */}
          <LiveChatWidget />
          <CookieConsent />
          <SocialProofNotification />
          <SmartAssistant />
          <PWAInstallPrompt />

          {/* Trigger for Recently Viewed - Hidden but accessible via event or state */}
          <button id="trigger-recently-viewed" className="hidden" onClick={() => setIsRecentlyViewedOpen(true)} />
        </>}

      <ToastContainer />
    </div>;
}
export function App() {
  return <Router future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true
  }}>
      <AppConfigProvider>
      <AppContent />
      </AppConfigProvider>
    </Router>;
}