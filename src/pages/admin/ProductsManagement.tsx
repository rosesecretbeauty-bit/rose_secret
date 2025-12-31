import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Plus, Package, Filter, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { BulkActionsBar } from '../../components/admin/BulkActionsBar';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../api/client';
import { Product } from '../../types';
import { PremiumLoader } from '../../components/ui/PremiumLoader';
import { ProductModal } from '../../components/admin/ProductModal';
import { ProductFormData } from '../../components/admin/ProductForm';
import { getCategories, Category } from '../../api/categories';
import { Input } from '../../components/ui/Input';

interface ProductStats {
  overview: {
    total: number;
    active: number;
    inactive: number;
    featured: number;
  };
  stock: {
    in_stock: number;
    low_stock: number;
    out_of_stock: number;
  };
  inventory_value: number;
}

export function ProductsManagement() {
  const [products, setProducts] = useState<(Product & { is_active?: boolean })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stats, setStats] = useState<ProductStats | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Filtros
  const [filters, setFilters] = useState({
    category_id: '',
    status: 'all',
    stock: 'all',
    featured: 'all',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  
  const addToast = useToastStore(state => state.addToast);

  // Cargar categorías
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Error loading categories:', err);
      }
    };
    loadCategories();
  }, []);

  // Cargar productos desde la API con filtros
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Construir query params
      const params = new URLSearchParams();
      if (filters.category_id) params.append('category_id', filters.category_id);
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.stock !== 'all') params.append('stock', filters.stock);
      if (filters.featured !== 'all') params.append('featured', filters.featured);
      if (filters.search) params.append('search', filters.search);
      
      const queryString = params.toString();
      const url = `/admin/products${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      
      if (response.success && response.data) {
        // Transformar datos del backend al formato del frontend
        const transformedProducts: (Product & { is_active?: boolean })[] = response.data.products.map((product: any) => ({
          id: product.id.toString(),
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price),
          category: product.category_slug || product.category_name || 'uncategorized',
          category_id: product.category_id,
          brand: product.brand || undefined,
          images: product.primary_image || product.image_url ? [product.primary_image || product.image_url] : ['data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E'],
          rating: 0,
          reviews: 0,
          stock: product.stock || 0,
          isNew: product.is_new || false,
          isBestSeller: product.is_bestseller || false,
          is_active: product.is_active !== undefined ? product.is_active : true
        }));
        
        setProducts(transformedProducts);
      }
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.message || 'Error al cargar productos');
      addToast({
        type: 'error',
        message: 'Error al cargar productos'
      });
    } finally {
      setLoading(false);
    }
  }, [filters, addToast]);

  // Cargar stats
  const loadStats = useCallback(async () => {
    try {
      const response = await api.get('/admin/products/stats');
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  }, []);

  // Cargar productos y stats al montar y cuando cambien los filtros
  useEffect(() => {
    loadProducts();
    loadStats();
  }, [loadProducts, loadStats]);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(products.map(p => p.id));
    } else {
      setSelectedIds([]);
    }
  };
  
  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  // Recargar productos después de operaciones
  const reloadProducts = async () => {
    await loadProducts();
    await loadStats();
  };
  
  // Manejar cambios de filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };
  
  const clearFilters = () => {
    setFilters({
      category_id: '',
      status: 'all',
      stock: 'all',
      featured: 'all',
      search: ''
    });
  };
  
  const hasActiveFilters = filters.category_id || filters.status !== 'all' || filters.stock !== 'all' || filters.featured !== 'all' || filters.search;
  const productColumns = [{
    key: 'select',
    label: <input type="checkbox" className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" onChange={handleSelectAll} checked={selectedIds.length === products.length && products.length > 0} />,
    render: (product: (typeof products)[0]) => <input type="checkbox" className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" checked={selectedIds.includes(product.id)} onChange={() => handleSelectOne(product.id)} />
  }, {
    key: 'images',
    label: 'Imagen',
    render: (product: (typeof products)[0]) => (
      <img 
        src={product.images && product.images.length > 0 ? product.images[0] : 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f3f4f6" width="400" height="400"/%3E%3Ctext fill="%239ca3af" font-family="sans-serif" font-size="18" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3ESin Imagen%3C/text%3E%3C/svg%3E'} 
        alt={product.name} 
        className="h-12 w-12 rounded-lg object-cover" 
      />
    )
  }, {
    key: 'name',
    label: 'Nombre',
    sortable: true
  }, {
    key: 'category',
    label: 'Categoría',
    sortable: true
  }, {
    key: 'price',
    label: 'Precio',
    sortable: true,
    render: (product: (typeof products)[0]) => `$${product.price.toFixed(2)}`
  }, {
    key: 'stock',
    label: 'Stock',
    sortable: true,
    render: (product: (typeof products)[0]) => <span className={`px-3 py-1 rounded-full text-xs font-semibold ${product.stock > 50 ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : product.stock > 20 ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400' : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
          {product.stock} unidades
        </span>
  }, {
    key: 'isNew',
    label: 'Estado',
    render: (product: (typeof products)[0]) => <div className="flex gap-2">
          {product.isNew && <Badge variant="champagne">NEW</Badge>}
          {product.isBestSeller && <Badge variant="secondary">BESTSELLER</Badge>}
        </div>
  }];
  const handleEdit = (product: any) => {
    // Asegurar que category_id esté presente
    const productWithCategoryId = {
      ...product,
      category_id: product.category_id || (product as any).category_id
    };
    setEditingProduct(productWithCategoryId);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (formData: ProductFormData) => {
    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name,
        description: formData.description || null,
        short_description: formData.short_description || null,
        price: parseFloat(formData.price),
        compare_at_price: formData.compare_at_price ? parseFloat(formData.compare_at_price) : null,
        category_id: parseInt(formData.category_id),
        brand: formData.brand || null,
        sku: formData.sku || null,
        stock: parseInt(formData.stock),
        low_stock_threshold: formData.low_stock_threshold ? parseInt(formData.low_stock_threshold) : 5,
        image_url: formData.image_url || null,
        is_active: formData.is_active,
        is_featured: formData.is_featured || false,
        is_new: formData.is_new || false,
        is_bestseller: formData.is_bestseller || false
      };

      if (editingProduct) {
        // Editar producto existente
        await api.put(`/admin/products/${editingProduct.id}`, payload);
        addToast({
          type: 'success',
          message: 'Producto actualizado exitosamente'
        });
      } else {
        // Crear nuevo producto
        await api.post('/admin/products', payload);
        addToast({
          type: 'success',
          message: 'Producto creado exitosamente'
        });
      }

      handleModalClose();
      await reloadProducts();
    } catch (err: any) {
      console.error('Error saving product:', err);
      addToast({
        type: 'error',
        message: err.message || 'Error al guardar producto'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (product: any) => {
    if (confirm(`¿Eliminar ${product.name}?`)) {
      try {
        await api.delete(`/admin/products/${product.id}`);
        addToast({
          type: 'success',
          message: 'Producto eliminado exitosamente'
        });
        await reloadProducts();
      } catch (err: any) {
        console.error('Error deleting product:', err);
        addToast({
          type: 'error',
          message: err.message || 'Error al eliminar producto'
        });
      }
    }
  };

  const handleBulkDelete = async () => {
    if (confirm(`¿Eliminar ${selectedIds.length} productos seleccionados?`)) {
      try {
        // Eliminar productos uno por uno
        for (const id of selectedIds) {
          await api.delete(`/admin/products/${id}`);
        }
        addToast({
          type: 'success',
          message: `${selectedIds.length} productos eliminados`
        });
        setSelectedIds([]);
        await reloadProducts();
      } catch (err: any) {
        console.error('Error deleting products:', err);
        addToast({
          type: 'error',
          message: 'Error al eliminar algunos productos'
        });
      }
    }
  };
  const handleBulkStatus = () => {
    addToast({
      type: 'info',
      message: 'Actualización de estado masiva'
    });
  };
  const handleBulkPrice = () => {
    addToast({
      type: 'info',
      message: 'Actualización de precio masiva'
    });
  };
  // Estado de carga
  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center py-20">
          <PremiumLoader />
        </div>
      </AdminLayout>
    );
  }

  // Estado de error
  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <div className="h-20 w-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-400">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white mb-2">
            Error al cargar productos
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Gestión de Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Administra tu catálogo de productos
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-5 w-5 mr-2" />
            Nuevo Producto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                <Package className="h-6 w-6 text-rose-600 dark:text-rose-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Productos</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.overview.total ?? products.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <Package className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">En Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.stock.in_stock ?? products.filter(p => p.stock > 0).length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <Package className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Stock Bajo</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.stock.low_stock ?? 0}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <Package className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Agotados</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats?.stock.out_of_stock ?? products.filter(p => p.stock === 0).length}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filtros */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <h3 className="font-medium text-gray-900 dark:text-white">Filtros</h3>
                {hasActiveFilters && (
                  <Badge variant="outline" className="ml-2">
                    {Object.values(filters).filter(v => v && v !== 'all').length} activos
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Limpiar
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
                  {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Búsqueda
                  </label>
                  <Input
                    placeholder="Nombre, SKU..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Categoría
                  </label>
                  <select
                    value={filters.category_id}
                    onChange={(e) => handleFilterChange('category_id', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    <option value="">Todas</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Estado
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="active">Activos</option>
                    <option value="inactive">Inactivos</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock
                  </label>
                  <select
                    value={filters.stock}
                    onChange={(e) => handleFilterChange('stock', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="in_stock">En Stock</option>
                    <option value="low_stock">Stock Bajo</option>
                    <option value="out_of_stock">Agotados</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Featured
                  </label>
                  <select
                    value={filters.featured}
                    onChange={(e) => handleFilterChange('featured', e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white"
                  >
                    <option value="all">Todos</option>
                    <option value="true">Featured</option>
                    <option value="false">No Featured</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.3
      }}>
          <DataTable data={products} columns={productColumns} onEdit={handleEdit} onDelete={handleDelete} searchPlaceholder="Buscar productos..." />
        </motion.div>

        <BulkActionsBar selectedCount={selectedIds.length} onClearSelection={() => setSelectedIds([])} onDelete={handleBulkDelete} onUpdateStatus={handleBulkStatus} onUpdatePrice={handleBulkPrice} />
      </div>

      {/* Modal de Crear/Editar Producto */}
      <ProductModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSubmit={handleFormSubmit}
        isLoading={isSubmitting}
      />
    </AdminLayout>
  );
}