import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Package, Heart, MapPin, Settings as SettingsIcon, LogOut, Sparkles, ChevronRight, CreditCard, Clock, BarChart2, Shield } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoyaltyProgram } from '../components/loyalty/LoyaltyProgram';
import { SavedPaymentMethods } from '../components/account/SavedPaymentMethods';
import { AddressBook } from '../components/account/AddressBook';
import { SpendingInsights } from '../components/account/SpendingInsights';
import { Waitlist } from '../components/account/Waitlist';
import { Settings } from '../components/account/Settings';
import { Security } from '../components/account/Security';
import { ActivityHistory } from '../components/account/ActivityHistory';
import { AchievementBadge } from '../components/ui/AchievementBadge';
import { CircularProgress } from '../components/ui/CircularProgress';
import { ProgressBar } from '../components/ui/ProgressBar';
import { GlassCard } from '../components/ui/GlassCard';
import { api } from '../api/client';
import { useLoyaltyStore } from '../stores/loyaltyStore';
import { useBadgesStore } from '../stores/badgesStore';
import { useProfileStore } from '../stores/profileStore';

export function AccountPage() {
  const navigate = useNavigate();
  const {
    user,
    logout,
    isAuthenticated
  } = useAuthStore();
  const wishlistItems = useWishlistStore(state => state.items);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Stores para datos reales
  const { info: loyaltyInfo, loadLoyaltyInfo } = useLoyaltyStore();
  const { badges, loadBadges } = useBadgesStore();
  const { completion, loadCompletion } = useProfileStore();
  
  // Cargar pedidos desde la API - TODOS LOS HOOKS DEBEN ESTAR ANTES DEL RETURN
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [totalOrders, setTotalOrders] = useState(0);

  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  useEffect(() => {
    async function loadData() {
      if (!isAuthenticated) {
        setIsLoadingOrders(false);
        return;
      }

      try {
        setIsLoadingOrders(true);
        
        // Cargar órdenes
        const ordersResponse = await api.get('/orders');
        if (ordersResponse.success && ordersResponse.data) {
          // Tomar solo los primeros 3 pedidos más recientes
          const orders = ordersResponse.data.orders.slice(0, 3).map((order: any) => ({
            id: order.id.toString(),
            date: order.created_at,
            status: order.status,
            total: parseFloat(order.total),
            items: order.item_count || 0
          }));
          setRecentOrders(orders);
          // Guardar el total de órdenes
          setTotalOrders(ordersResponse.data.orders?.length || 0);
        }
        
        // Cargar datos de loyalty, badges y profile completion
        await Promise.all([
          loadLoyaltyInfo(),
          loadBadges(),
          loadCompletion()
        ]);
      } catch (error) {
        console.error('Error loading account data:', error);
      } finally {
        setIsLoadingOrders(false);
      }
    }
    loadData();
  }, [isAuthenticated, loadLoyaltyInfo, loadBadges, loadCompletion]);
  
  // Return condicional DESPUÉS de todos los hooks
  if (!user) {
    return null;
  }
  const renderOverview = () => <div className="space-y-8">

      {/* Profile Header with GlassCard */}
      <GlassCard className="p-6 bg-gradient-to-r from-rose-50 to-white" border={false}>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <CircularProgress value={completion?.percentage || 0} size={100} color="#E11D48" strokeWidth={6}>
              {user.avatar ? <img src={user.avatar} alt={user.name} className="h-20 w-20 rounded-full object-cover" /> : <div className="h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-2xl font-bold">
                  {user.name.charAt(0)}
                </div>}
            </CircularProgress>
            {badges.find(b => b.id === 'vip' && b.unlocked) && (
              <div className="absolute -bottom-2 -right-2">
                <AchievementBadge type="vip" size="sm" unlocked />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-serif font-bold text-gray-900">
              ¡Bienvenido de nuevo, {user.name}!
            </h2>
            <p className="text-gray-500 mb-4">{user.email}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              {badges.filter(b => b.unlocked).slice(0, 3).map(badge => (
                <AchievementBadge 
                  key={badge.id} 
                  type={badge.id as any} 
                  size="sm" 
                  unlocked={badge.unlocked} 
                />
              ))}
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between text-sm mb-2">
              <span className="font-medium text-gray-700">
                Completitud del Perfil
              </span>
              <span className="text-rose-600 font-bold">{completion?.percentage || 0}%</span>
            </div>
            <ProgressBar progress={completion?.percentage || 0} height={8} />
            <p className="text-xs text-gray-500 mt-2">
              Completa tu perfil para ganar {completion?.points_reward || 50} puntos
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Recomendaciones de Completitud */}
      {completion?.recommendations && completion.recommendations.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <h3 className="font-serif text-lg font-medium text-gray-900">
                Recomendaciones para completar tu perfil
              </h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completion.recommendations.map((rec, index) => (
                  <motion.div
                    key={rec.field}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index }}
                    className={`p-4 rounded-lg border ${
                      rec.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : rec.priority === 'medium'
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          {rec.priority === 'high' && (
                            <Badge variant="primary" className="bg-red-100 text-red-700 border-red-200 text-xs">
                              Importante
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{rec.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setActiveTab(rec.actionPath)}
                      >
                        {rec.action}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[{
        label: 'Pedidos',
        value: totalOrders.toString(),
        icon: Package,
        link: '/account/orders'
      }, {
        label: 'Lista de Deseos',
        value: wishlistItems.length.toString(),
        icon: Heart,
        link: '/wishlist'
      }, {
        label: 'Puntos',
        value: loyaltyInfo?.current_points?.toString() || '0',
        icon: Sparkles,
        link: '#',
        action: () => setActiveTab('loyalty')
      }].map((stat, index) => <motion.div key={stat.label} initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: index * 0.1
      }}>
            {stat.link !== '#' ? <Link to={stat.link}>
                <Card hover>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-serif font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-rose-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link> : <div onClick={stat.action} className="cursor-pointer">
                <Card hover>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 mb-1">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-serif font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                      <div className="h-12 w-12 bg-rose-50 rounded-full flex items-center justify-center">
                        <stat.icon className="h-6 w-6 text-rose-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>}
          </motion.div>)}
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="font-serif text-xl font-medium">Pedidos Recientes</h2>
          <Button variant="outline" size="sm" onClick={() => setActiveTab('orders')}>
            Ver Todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoadingOrders ? (
              <div className="text-center py-4 text-gray-500">Cargando pedidos...</div>
            ) : recentOrders.length > 0 ? (
              recentOrders.map(order => <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-lg border border-gray-200">
                    <Package className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{order.id}</p>
                    <p className="text-sm text-gray-500">
                      {order.date} • {order.items} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={order.status === 'Delivered' ? 'secondary' : 'primary'}>
                    {order.status}
                  </Badge>
                  <p className="font-bold text-gray-900">
                    ${order.total.toFixed(2)}
                  </p>
                </div>
              </div>)
            ) : (
              <div className="text-center py-4 text-gray-500">No hay pedidos recientes</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>;
  const renderOrders = () => <div className="space-y-6">
      <h2 className="font-serif text-2xl font-medium mb-6">Historial de Pedidos</h2>
      {isLoadingOrders ? (
        <div className="text-center py-8 text-gray-500">Cargando pedidos...</div>
      ) : recentOrders.length > 0 ? (
        recentOrders.map((order, idx) => <motion.div key={order.id} initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} transition={{
      delay: idx * 0.1
    }} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-wrap gap-4 justify-between items-center bg-gray-50/50">
            <div className="flex gap-8">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Fecha del Pedido
                </p>
                <p className="font-medium text-gray-900">{order.date}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Total
                </p>
                <p className="font-medium text-gray-900">
                  ${order.total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                  Enviar A
                </p>
                <p className="font-medium text-gray-900">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <p className="font-mono text-sm text-gray-500">
                Pedido # {order.id}
              </p>
              <div className="h-4 w-px bg-gray-300" />
              <Link to={`/account/orders`} className="text-sm text-rose-600 hover:text-rose-700 font-medium">
                Ver Detalles
              </Link>
            </div>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`h-3 w-3 rounded-full ${order.status === 'Delivered' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <h3 className="font-serif text-lg font-bold text-gray-900">
                  {order.status === 'Delivered' ? 'Entregado' : 'En Proceso'}
                </h3>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm">
                  Rastrear Paquete
                </Button>
                <Button size="sm">Comprar de Nuevo</Button>
              </div>
            </div>
          </div>
        </motion.div>)
      ) : (
        <div className="text-center py-8 text-gray-500">No hay pedidos</div>
      )}
    </div>;
  return <div className="bg-gray-50 min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="w-full md:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
              <div className="flex items-center gap-4 mb-6">
                {user.avatar ? <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" /> : <div className="h-12 w-12 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">
                    <User className="h-6 w-6" />
                  </div>}
                <div className="overflow-hidden">
                  <h3 className="font-medium text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              </div>

              <nav className="space-y-1">
                {[{
                id: 'overview',
                label: 'Resumen',
                icon: User
              }, {
                id: 'orders',
                label: 'Pedidos',
                icon: Package
              }, {
                id: 'loyalty',
                label: 'Rose Rewards',
                icon: Sparkles
              }, {
                id: 'insights',
                label: 'Análisis de Gastos',
                icon: BarChart2
              }, {
                id: 'addresses',
                label: 'Direcciones',
                icon: MapPin
              }, {
                id: 'payment',
                label: 'Métodos de Pago',
                icon: CreditCard
              }, {
                id: 'waitlist',
                label: 'Lista de Espera',
                icon: Clock
              }, {
                id: 'activity',
                label: 'Actividad',
                icon: Clock
              }, {
                id: 'security',
                label: 'Seguridad',
                icon: Shield
              }, {
                id: 'settings',
                label: 'Configuración',
                icon: SettingsIcon
              }].map(item => <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === item.id ? 'bg-rose-50 text-rose-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                    <div className="flex items-center gap-3">
                      <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-rose-600' : 'text-gray-400'}`} />
                      {item.label}
                    </div>
                    {activeTab === item.id && <ChevronRight className="h-4 w-4 text-rose-600" />}
                  </button>)}
              </nav>
            </div>

            <Button variant="outline" fullWidth onClick={handleLogout} className="border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-red-600">
              <LogOut className="mr-2 h-4 w-4" /> Cerrar Sesión
            </Button>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <motion.div key={activeTab} initial={{
            opacity: 0,
            x: 20
          }} animate={{
            opacity: 1,
            x: 0
          }} transition={{
            duration: 0.3
          }}>
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'loyalty' && <LoyaltyProgram />}
              {activeTab === 'insights' && <SpendingInsights />}
              {activeTab === 'addresses' && <AddressBook />}
              {activeTab === 'payment' && <SavedPaymentMethods />}
              {activeTab === 'waitlist' && <Waitlist />}
              {activeTab === 'activity' && <ActivityHistory />}
              {activeTab === 'security' && <Security />}
              {activeTab === 'settings' && <Settings />}
            </motion.div>
          </div>
        </div>
      </div>
    </div>;
}

export default AccountPage;