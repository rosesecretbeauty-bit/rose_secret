import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Check } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToastStore } from '../../stores/toastStore';
import {
  getProductVariants,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  ProductVariant
} from '../../api/products';
import { PremiumLoader } from '../ui/PremiumLoader';
import { Badge } from '../ui/Badge';

interface ProductVariantsManagerProps {
  productId: number;
  onVariantsChange?: () => void;
}

export function ProductVariantsManager({
  productId,
  onVariantsChange
}: ProductVariantsManagerProps) {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  // Form state
  const [formData, setFormData] = useState<{
    name: string;
    sku?: string;
    price?: number;
    compare_at_price?: number;
    stock?: number;
    weight?: number;
    attributes?: any;
    is_active?: boolean;
  }>({
    name: '',
    sku: '',
    price: undefined,
    compare_at_price: undefined,
    stock: 0,
    weight: undefined,
    attributes: {},
    is_active: true
  });

  // Cargar variantes
  useEffect(() => {
    loadVariants();
  }, [productId]);

  const loadVariants = async () => {
    try {
      setIsLoading(true);
      const loadedVariants = await getProductVariants(productId);
      // Marcar la primera como default implícitamente
      const variantsWithDefault = loadedVariants.map((v, index) => ({
        ...v,
        is_default: index === 0
      }));
      setVariants(variantsWithDefault);
    } catch (error: any) {
      console.error('Error loading variants:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar variantes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      sku: '',
      price: undefined,
      compare_at_price: undefined,
      stock: 0,
      weight: undefined,
      attributes: {},
      is_active: true
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (variant: ProductVariant) => {
    setFormData({
      name: variant.name,
      sku: variant.sku || '',
      price: variant.price || undefined,
      compare_at_price: variant.compare_at_price || undefined,
      stock: variant.stock,
      weight: variant.weight || undefined,
      attributes: variant.attributes || {},
      is_active: variant.is_active
    });
    setEditingId(variant.id);
    setShowForm(true);
  };

  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      addToast({
        type: 'error',
        message: 'El nombre de la variante es requerido'
      });
      return;
    }

    try {
      setIsAdding(true);

      // Validar precio requerido
      if (!formData.price || formData.price <= 0) {
        addToast({
          type: 'error',
          message: 'El precio es requerido y debe ser mayor a 0'
        });
        return;
      }

      if (editingId) {
        await updateProductVariant(productId, editingId, formData);
        addToast({
          type: 'success',
          message: 'Variante actualizada exitosamente'
        });
      } else {
        await createProductVariant(productId, {
          name: formData.name,
          price: formData.price,
          sku: formData.sku,
          compare_at_price: formData.compare_at_price,
          stock: formData.stock || 0,
          weight: formData.weight,
          attributes: formData.attributes,
          is_active: formData.is_active !== false
        });
        addToast({
          type: 'success',
          message: 'Variante creada exitosamente'
        });
      }

      resetForm();
      await loadVariants();
      onVariantsChange?.();
    } catch (error: any) {
      console.error('Error saving variant:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar variante'
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDelete = async (variantId: number) => {
    if (!confirm('¿Eliminar esta variante? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await deleteProductVariant(productId, variantId);
      addToast({
        type: 'success',
        message: 'Variante eliminada exitosamente'
      });
      await loadVariants();
      onVariantsChange?.();
    } catch (error: any) {
      console.error('Error deleting variant:', error);
      let errorMessage = 'Error al eliminar variante';
      if (error.message?.includes('única variante')) {
        errorMessage = 'No se puede eliminar la única variante del producto';
      } else if (error.message?.includes('carrito')) {
        errorMessage = 'No se puede eliminar: hay items en carrito con esta variante';
      } else if (error.message?.includes('pedidos')) {
        errorMessage = 'No se puede eliminar: hay items en pedidos con esta variante';
      } else if (error.message) {
        errorMessage = error.message;
      }
      addToast({
        type: 'error',
        message: errorMessage
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Variantes del Producto
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {variants.length} variante{variants.length !== 1 ? 's' : ''} configurada{variants.length !== 1 ? 's' : ''}
          </p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Añadir Variante
          </Button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-6 border border-gray-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-semibold text-gray-900">
              {editingId ? 'Editar Variante' : 'Nueva Variante'}
            </h4>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Nombre *"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Ej: 50ml, Rojo, Grande"
            />
            <Input
              label="SKU"
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
              placeholder="Código único"
            />
            <Input
              label="Precio *"
              type="number"
              step="0.01"
              min="0.01"
              required
              value={formData.price?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, price: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="0.00"
            />
            <Input
              label="Precio Comparación"
              type="number"
              step="0.01"
              min="0"
              value={formData.compare_at_price?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, compare_at_price: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="0.00"
            />
            <Input
              label="Stock"
              type="number"
              min="0"
              value={formData.stock?.toString() || '0'}
              onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
            />
            <Input
              label="Peso (kg)"
              type="number"
              step="0.01"
              min="0"
              value={formData.weight?.toString() || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value ? parseFloat(e.target.value) : undefined })}
              placeholder="0.00"
            />
          </div>

          <div className="flex items-center gap-3 mt-4">
            <input
              type="checkbox"
              id="is_active_variant"
              checked={formData.is_active !== undefined ? formData.is_active : true}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_active_variant" className="text-sm font-medium text-gray-700">
              Variante activa
            </label>
          </div>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={handleSubmit}
              isLoading={isAdding}
              disabled={isAdding || !formData.name.trim() || !formData.price || formData.price <= 0}
            >
              <Check className="h-4 w-4 mr-2" />
              {editingId ? 'Actualizar' : 'Crear'} Variante
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              disabled={isAdding}
            >
              Cancelar
            </Button>
          </div>
        </motion.div>
      )}

      {/* Lista de variantes */}
      {variants.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-gray-500 mb-4">No hay variantes para este producto</p>
          <p className="text-sm text-gray-400">
            Las variantes permiten ofrecer diferentes tamaños, colores o presentaciones del mismo producto
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {variants.map((variant, index) => (
            <motion.div
              key={variant.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-rose-300 transition-all"
            >
              {/* Información principal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h5 className="font-semibold text-gray-900">{variant.name}</h5>
                  {!variant.is_active && (
                    <Badge variant="secondary" className="text-xs">
                      Inactiva
                    </Badge>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  {variant.sku && (
                    <span>
                      <span className="font-medium">SKU:</span> {variant.sku}
                    </span>
                  )}
                  <span>
                    <span className="font-medium">Precio:</span> ${variant.price?.toFixed(2) || '0.00'}
                  </span>
                  <span>
                    <span className="font-medium">Stock:</span> {variant.stock}
                  </span>
                  {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                    <span>
                      <span className="font-medium">Atributos:</span>{' '}
                      {Object.entries(variant.attributes).map(([key, value]) => `${key}: ${value}`).join(', ')}
                    </span>
                  )}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(variant)}
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(variant.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

