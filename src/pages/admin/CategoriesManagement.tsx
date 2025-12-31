import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Tag, Folder, TrendingUp, Loader2, Edit, X } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { Category, CreateCategoryData } from '../../api/categories';
import { useCategoriesStore } from '../../stores/categoriesStore';
import { useToastStore } from '../../stores/toastStore';

interface CategoryWithStats extends Category {
  products?: number;
  subcategories?: number;
  status: string;
  created: string;
}

export function CategoriesManagement() {
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: CategoryWithStats | null;
  }>({
    isOpen: false,
    item: null
  });
  const [editModal, setEditModal] = useState<{
    isOpen: boolean;
    item: CategoryWithStats | null;
  }>({
    isOpen: false,
    item: null
  });
  const [createModal, setCreateModal] = useState(false);

  const addToast = useToastStore(state => state.addToast);
  const {
    categories: storeCategories,
    isLoading,
    error,
    loadAdminCategories,
    createCategory: createCategoryAction,
    updateCategory: updateCategoryAction,
    deleteCategory: deleteCategoryAction
  } = useCategoriesStore();

  // Transformar categorías para incluir stats
  const categories: CategoryWithStats[] = storeCategories.map(cat => {
    const subcategories = storeCategories.filter(
      c => c.parent_id === cat.id
    ).length;

    return {
      ...cat,
      products: cat.product_count || 0,
      subcategories,
      status: cat.is_active ? 'Activo' : 'Inactivo',
      created: cat.created_at ? new Date(cat.created_at).toLocaleDateString() : '-'
    };
  });

  // Cargar categorías desde API
  useEffect(() => {
    loadAdminCategories();
  }, [loadAdminCategories]);

  // Mostrar errores del store
  useEffect(() => {
    if (error) {
      addToast({
        type: 'error',
        message: error
      });
    }
  }, [error, addToast]);

  const categoryColumns = [
    {
      key: 'name',
      label: 'Categoría',
      sortable: true,
      render: (category: CategoryWithStats) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800 rounded-lg flex items-center justify-center">
            <Tag className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {category.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              /{category.slug}
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'products',
      label: 'Productos',
      sortable: true,
      render: (category: CategoryWithStats) => (
        <span className="text-gray-600 dark:text-gray-400">
          {category.products ?? '-'}
        </span>
      )
    },
    {
      key: 'subcategories',
      label: 'Subcategorías',
      sortable: true,
      render: (category: CategoryWithStats) => (
        <span className="text-gray-600 dark:text-gray-400">
          {category.subcategories ?? 0}
        </span>
      )
    },
    {
      key: 'status',
      label: 'Estado',
      render: (category: CategoryWithStats) => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          category.is_active
            ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
        }`}>
          {category.status}
        </span>
      )
    },
    {
      key: 'created',
      label: 'Creado',
      sortable: true
    }
  ];

  const handleEdit = (category: CategoryWithStats) => {
    setEditModal({
      isOpen: true,
      item: category
    });
  };

  const handleDelete = (category: CategoryWithStats) => {
    setDeleteModal({
      isOpen: true,
      item: category
    });
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;

    try {
      await deleteCategoryAction(deleteModal.item.id);
      addToast({
        type: 'success',
        message: 'Categoría eliminada exitosamente'
      });
    } catch (error: any) {
      // El error ya se maneja en el store
      let errorMessage = 'Error al eliminar categoría';
      if (error.message?.includes('subcategorías')) {
        errorMessage = 'No se puede eliminar una categoría que tiene subcategorías';
      } else if (error.message?.includes('productos')) {
        errorMessage = 'No se puede eliminar una categoría que tiene productos asociados';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      addToast({
        type: 'error',
        message: errorMessage
      });
    } finally {
      setDeleteModal({
        isOpen: false,
        item: null
      });
    }
  };

  const handleCreate = async (data: CreateCategoryData) => {
    try {
      await createCategoryAction(data);
      addToast({
        type: 'success',
        message: 'Categoría creada exitosamente'
      });
      setCreateModal(false);
    } catch (error: any) {
      // El error ya se maneja en el store
      addToast({
        type: 'error',
        message: error.message || 'Error al crear categoría'
      });
    }
  };

  const handleUpdate = async (id: number, data: Partial<CreateCategoryData>) => {
    try {
      await updateCategoryAction(id, data);
      addToast({
        type: 'success',
        message: 'Categoría actualizada exitosamente'
      });
      setEditModal({ isOpen: false, item: null });
    } catch (error: any) {
      // El error ya se maneja en el store
      addToast({
        type: 'error',
        message: error.message || 'Error al actualizar categoría'
      });
    }
  };

  // Calcular estadísticas
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, c) => sum + (c.subcategories || 0), 0);
  const totalProducts = categories.reduce((sum, c) => sum + (c.products || 0), 0);
  const avgProductsPerCategory = totalCategories > 0 
    ? Math.round(totalProducts / totalCategories) 
    : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Gestión de Categorías
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Organiza y administra las categorías de productos
            </p>
          </div>
          <Button onClick={() => setCreateModal(true)}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Categoría
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Categorías" 
            value={totalCategories} 
            change={undefined} 
            icon={Tag} 
            color="purple" 
          />
          <StatCard 
            title="Subcategorías" 
            value={totalSubcategories} 
            change={undefined} 
            icon={Folder} 
            color="blue" 
          />
          <StatCard 
            title="Total Productos" 
            value={totalProducts} 
            change={undefined} 
            icon={TrendingUp} 
            color="green" 
          />
          <StatCard 
            title="Promedio/Categoría" 
            value={avgProductsPerCategory} 
            icon={Tag} 
            color="rose" 
          />
        </div>

        {/* Categories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-12">
              <Tag className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No hay categorías
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                Comienza creando tu primera categoría
              </p>
              <Button onClick={() => setCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Categoría
              </Button>
            </div>
          ) : (
            <DataTable
              data={categories}
              columns={categoryColumns}
              onEdit={handleEdit}
              onDelete={handleDelete}
              searchPlaceholder="Buscar categorías..."
            />
          )}
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Eliminar Categoría"
        message="¿Estás segura de que deseas eliminar esta categoría? Esta acción no se puede deshacer."
        itemName={deleteModal.item?.name}
      />

      {/* Create Category Modal */}
      {createModal && (
        <CategoryFormModal
          isOpen={createModal}
          onClose={() => setCreateModal(false)}
          onSubmit={handleCreate}
          categories={categories}
        />
      )}

      {/* Edit Category Modal */}
      {editModal.isOpen && editModal.item && (
        <CategoryFormModal
          isOpen={editModal.isOpen}
          onClose={() => setEditModal({ isOpen: false, item: null })}
          onSubmit={(data) => handleUpdate(editModal.item!.id, data)}
          categories={categories}
          initialData={editModal.item}
        />
      )}
    </AdminLayout>
  );
}

// ============================================
// Category Form Modal Component
// ============================================
interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCategoryData) => Promise<void>;
  categories: CategoryWithStats[];
  initialData?: CategoryWithStats;
}

function CategoryFormModal({
  isOpen,
  onClose,
  onSubmit,
  categories,
  initialData
}: CategoryFormModalProps) {
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    parent_id: initialData?.parent_id || null,
    image_url: initialData?.image_url || '',
    is_active: initialData?.is_active ?? true,
    sort_order: initialData?.sort_order || 0,
    meta_title: initialData?.meta_title || '',
    meta_description: initialData?.meta_description || ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        slug: initialData.slug,
        description: initialData.description || '',
        parent_id: initialData.parent_id || null,
        image_url: initialData.image_url || '',
        is_active: initialData.is_active,
        sort_order: initialData.sort_order || 0,
        meta_title: initialData.meta_title || '',
        meta_description: initialData.meta_description || ''
      });
    } else {
      setFormData({
        name: '',
        slug: '',
        description: '',
        parent_id: null,
        image_url: '',
        is_active: true,
        sort_order: 0,
        meta_title: '',
        meta_description: ''
      });
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Generar slug automáticamente desde el nombre
  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleNameChange = (name: string) => {
    setFormData(prev => ({
      ...prev,
      name,
      slug: prev.slug || generateSlug(name)
    }));
  };

  if (!isOpen) return null;

  // Filtrar categorías para el selector de padre (excluir la actual si es edición)
  const availableParents = categories.filter(
    cat => !initialData || cat.id !== initialData.id
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4"
      >
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">
            {initialData ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Slug *
            </label>
            <input
              type="text"
              required
              pattern="[a-z0-9-]+"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase() }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-xs text-gray-500">Solo minúsculas, números y guiones</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Categoría Padre
            </label>
            <select
              value={formData.parent_id || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, parent_id: e.target.value ? parseInt(e.target.value) : null }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Ninguna (Categoría raíz)</option>
              {availableParents.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Orden
              </label>
              <input
                type="number"
                value={formData.sort_order}
                onChange={(e) => setFormData(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-rose-600 border-gray-300 rounded focus:ring-rose-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Activa
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Título (SEO)
            </label>
            <input
              type="text"
              value={formData.meta_title}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Meta Descripción (SEO)
            </label>
            <textarea
              value={formData.meta_description}
              onChange={(e) => setFormData(prev => ({ ...prev, meta_description: e.target.value }))}
              rows={2}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  {initialData ? <Edit className="h-4 w-4 mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  {initialData ? 'Actualizar' : 'Crear'}
                </>
              )}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
