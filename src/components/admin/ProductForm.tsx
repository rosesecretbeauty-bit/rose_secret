import React, { useState, useEffect } from 'react';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useForm } from '../../hooks/useForm';
import { getCategories } from '../../api/categories';

export interface ProductFormData {
  name: string;
  description: string;
  short_description?: string;
  price: string;
  compare_at_price?: string;
  category_id: string;
  brand: string;
  sku?: string;
  stock: string;
  low_stock_threshold?: string;
  image_url: string;
  is_active: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  is_bestseller?: boolean;
}

interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const initialValues: ProductFormData = {
  name: '',
  description: '',
  short_description: '',
  price: '',
  compare_at_price: '',
  category_id: '',
  brand: '',
  sku: '',
  stock: '',
  low_stock_threshold: '5',
  image_url: '',
  is_active: true,
  is_featured: false,
  is_new: false,
  is_bestseller: false
};

const validationRules = {
  name: { required: true },
  price: { 
    required: true,
    custom: (value: string) => {
      const num = parseFloat(value);
      if (isNaN(num) || num <= 0) {
        return 'El precio debe ser mayor a 0';
      }
      return null;
    }
  },
  stock: {
    required: true,
    custom: (value: string) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 0) {
        return 'El stock debe ser mayor o igual a 0';
      }
      return null;
    }
  },
  category_id: { required: true }
};

export function ProductForm({ initialData, onSubmit, onCancel, isLoading = false, hasVariants = false }: ProductFormProps) {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  useEffect(() => {
    async function loadCategories() {
      try {
        setIsLoadingCategories(true);
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = useForm<ProductFormData>(
    { ...initialValues, ...initialData },
    validationRules
  );

  const handleFormSubmit = async () => {
    await handleSubmit(async (formValues) => {
      await onSubmit(formValues);
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Nombre */}
        <div className="md:col-span-2">
          <Input
            label="Nombre del Producto *"
            name="name"
            value={values.name}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            error={touched.name ? errors.name : undefined}
            placeholder="Ej: Nuit de Rose - Eau de Parfum"
            required
          />
        </div>

        {/* Descripción */}
        <div className="md:col-span-2">
          <div className="w-full">
            <label className="block text-sm font-medium text-charcoal-700 mb-1.5 ml-1">
              Descripción
            </label>
            <textarea
              name="description"
              value={values.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción detallada del producto..."
              rows={4}
              className="flex min-h-[100px] w-full rounded-xl border border-gray-200 bg-white/50 px-4 py-2 text-sm text-charcoal-900 placeholder:text-gray-400 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400 focus:bg-white resize-y"
            />
          </div>
        </div>

        {/* Aviso si tiene variantes */}
        {hasVariants && (
          <div className="md:col-span-2 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                  Este producto tiene variantes configuradas
                </h4>
                <p className="text-xs text-yellow-700">
                  El precio y stock del producto base se ignoran cuando hay variantes. 
                  Gestiona los precios y stock desde la pestaña "Variantes".
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Precio */}
        <div>
          <Input
            label="Precio *"
            name="price"
            type="number"
            step="0.01"
            min="0"
            value={values.price}
            onChange={(e) => handleChange('price', e.target.value)}
            onBlur={() => handleBlur('price')}
            error={touched.price ? errors.price : undefined}
            placeholder="0.00"
            required
          />
        </div>

        {/* Stock */}
        <div>
          <Input
            label="Stock *"
            name="stock"
            type="number"
            min="0"
            value={values.stock}
            onChange={(e) => handleChange('stock', e.target.value)}
            onBlur={() => handleBlur('stock')}
            error={touched.stock ? errors.stock : undefined}
            placeholder="0"
            required
          />
        </div>

        {/* Categoría */}
        <div>
          <label className="block text-sm font-medium text-charcoal-700 mb-1.5 ml-1">
            Categoría *
          </label>
          {isLoadingCategories ? (
            <div className="text-sm text-gray-500">Cargando categorías...</div>
          ) : (
            <select
              name="category_id"
              value={values.category_id}
              onChange={(e) => handleChange('category_id', e.target.value)}
              onBlur={() => handleBlur('category_id')}
              className={`flex w-full rounded-xl border ${
                touched.category_id && errors.category_id
                  ? 'border-red-300 focus:ring-red-500'
                  : 'border-gray-200 focus:ring-rose-500'
              } bg-white/50 px-4 py-2 text-sm text-charcoal-900 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:border-rose-400 focus:bg-white`}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
          {touched.category_id && errors.category_id && (
            <p className="mt-1 text-sm text-red-600">{errors.category_id}</p>
          )}
        </div>

        {/* Marca */}
        <div>
          <Input
            label="Marca"
            name="brand"
            value={values.brand}
            onChange={(e) => handleChange('brand', e.target.value)}
            placeholder="Ej: Maison Lumière"
          />
        </div>

        {/* SKU */}
        <div>
          <Input
            label="SKU"
            name="sku"
            value={values.sku || ''}
            onChange={(e) => handleChange('sku', e.target.value)}
            placeholder="Código único del producto"
          />
        </div>

        {/* Precio de Comparación */}
        <div>
          <Input
            label="Precio de Comparación"
            name="compare_at_price"
            type="number"
            step="0.01"
            min="0"
            value={values.compare_at_price || ''}
            onChange={(e) => handleChange('compare_at_price', e.target.value)}
            placeholder="Precio original (opcional)"
          />
        </div>

        {/* Descripción Corta */}
        <div className="md:col-span-2">
          <Textarea
            label="Descripción Corta"
            name="short_description"
            value={values.short_description || ''}
            onChange={(e) => handleChange('short_description', e.target.value)}
            placeholder="Descripción breve para listados..."
            rows={2}
          />
        </div>

        {/* Stock Mínimo */}
        <div>
          <Input
            label="Stock Mínimo"
            name="low_stock_threshold"
            type="number"
            min="0"
            value={values.low_stock_threshold || '5'}
            onChange={(e) => handleChange('low_stock_threshold', e.target.value)}
            placeholder="5"
          />
        </div>

        {/* URL de Imagen */}
        <div className="md:col-span-2">
          <Input
            label="URL de Imagen"
            name="image_url"
            type="url"
            value={values.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        {/* Estados */}
        <div className="md:col-span-2 space-y-2">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_active"
              checked={values.is_active}
              onChange={(e) => setFieldValue('is_active', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Producto activo (visible en la tienda)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_featured"
              checked={values.is_featured || false}
              onChange={(e) => setFieldValue('is_featured', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
              Producto destacado
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_new"
              checked={values.is_new || false}
              onChange={(e) => setFieldValue('is_new', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_new" className="text-sm font-medium text-gray-700">
              Producto nuevo
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_bestseller"
              checked={values.is_bestseller || false}
              onChange={(e) => setFieldValue('is_bestseller', e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="is_bestseller" className="text-sm font-medium text-gray-700">
              Best Seller
            </label>
          </div>
        </div>
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          isLoading={isSubmitting || isLoading}
          disabled={isSubmitting || isLoading}
        >
          {initialData ? 'Guardar Cambios' : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
}

