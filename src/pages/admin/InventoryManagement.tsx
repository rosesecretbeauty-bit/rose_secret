import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Package, AlertTriangle, ArrowUpRight, ArrowDownRight, Filter, Download, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { DataTable } from '../../components/admin/DataTable';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

export function InventoryManagement() {
  const [filter, setFilter] = useState('all');
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/admin/products') as { success: boolean; data?: { products: any[] } };
      if (response.success && response.data?.products) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const inventoryStats = [{
    title: 'Valor del Inventario',
    value: '$45,280.00',
    trend: '+12.5%',
    isPositive: true,
    icon: Package,
    color: 'bg-blue-50 text-blue-600'
  }, {
    title: 'Stock Bajo',
    value: '12',
    trend: '4 críticos',
    isPositive: false,
    icon: AlertTriangle,
    color: 'bg-amber-50 text-amber-600'
  }, {
    title: 'Entradas (Mes)',
    value: '1,240',
    trend: '+8.2%',
    isPositive: true,
    icon: ArrowUpRight,
    color: 'bg-green-50 text-green-600'
  }, {
    title: 'Salidas (Mes)',
    value: '856',
    trend: '+15.3%',
    isPositive: true,
    icon: ArrowDownRight,
    color: 'bg-rose-50 text-rose-600'
  }];
  const columns = [{
    key: 'name',
    label: 'Producto',
    render: (row: any) => <div className="flex items-center gap-3">
          <img 
            src={row.images?.[0] || row.image_url || 'https://via.placeholder.com/40'} 
            alt={row.name} 
            className="h-10 w-10 rounded-lg object-cover" 
          />
          <div>
            <p className="font-medium text-gray-900">{row.name}</p>
            <p className="text-xs text-gray-500">
              SKU: {row.sku || row.id?.toString().substring(0, 8).toUpperCase() || 'N/A'}
            </p>
          </div>
        </div>
  }, {
    key: 'category',
    label: 'Categoría',
    render: (row: any) => <Badge variant="outline">{row.category_name || row.category || 'N/A'}</Badge>
  }, {
    key: 'stock',
    label: 'Stock Actual',
    sortable: true,
    render: (row: any) => {
      const stock = row.stock || 0;
      return <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${stock < 10 ? 'bg-red-500' : stock < 30 ? 'bg-amber-500' : 'bg-green-500'}`} />
          <span className={`font-medium ${stock < 10 ? 'text-red-600' : 'text-gray-900'}`}>
            {stock} unidades
          </span>
        </div>;
    }
  }, {
    key: 'price',
    label: 'Valor Unitario',
    render: (row: any) => `$${parseFloat(row.price || 0).toFixed(2)}`
  }, {
    key: 'status',
    label: 'Estado',
    render: (row: any) => {
      const stock = row.stock || 0;
      if (stock === 0) return <Badge variant="danger">Agotado</Badge>;
      if (stock < 10) return <Badge variant="warning">Crítico</Badge>;
      return <Badge variant="success">Normal</Badge>;
    }
  }];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <PremiumLoader />
        </div>
      </AdminLayout>
    );
  }

  // Filtrar productos según el filtro seleccionado
  const filteredProducts = filter === 'all' 
    ? products 
    : filter === 'low' 
      ? products.filter(p => (p.stock || 0) < 30 && (p.stock || 0) > 0)
      : products.filter(p => (p.stock || 0) === 0);

  return <AdminLayout>
      <PermissionGuard module="inventory" action="view" showError>
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Inventario
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona el stock y movimientos de productos
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
                Exportar
              </Button>
              <PermissionGuard module="inventory" action="create">
                <Button leftIcon={<Package className="h-4 w-4" />}>
                  Ajuste de Stock
                </Button>
              </PermissionGuard>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {inventoryStats.map((stat, index) => <motion.div key={stat.title} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-500">
                          {stat.title}
                        </p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-2">
                          {stat.value}
                        </h3>
                      </div>
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        <stat.icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center text-sm">
                      <span className={stat.isPositive ? 'text-green-600' : 'text-red-600'}>
                        {stat.trend}
                      </span>
                      <span className="text-gray-400 ml-2">
                        vs mes anterior
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>)}
          </div>

          {/* Filters & Actions */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="w-full md:w-96">
                  <Input placeholder="Buscar por nombre, SKU o categoría..." leftIcon={<Search className="h-4 w-4" />} />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant={filter === 'all' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('all')}>
                    Todos
                  </Button>
                  <Button variant={filter === 'low' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('low')}>
                    Stock Bajo
                  </Button>
                  <Button variant={filter === 'out' ? 'primary' : 'ghost'} size="sm" onClick={() => setFilter('out')}>
                    Agotados
                  </Button>
                  <Button variant="outline" size="sm" leftIcon={<Filter className="h-4 w-4" />}>
                    Más Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          {filteredProducts.length > 0 ? (
            <DataTable data={filteredProducts} columns={columns} onEdit={() => {}} onDelete={() => {}} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Package className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500">No hay productos en el inventario</p>
              </CardContent>
            </Card>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>;
}