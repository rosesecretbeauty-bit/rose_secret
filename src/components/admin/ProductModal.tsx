import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { ProductForm, ProductFormData } from './ProductForm';
import { ProductImagesManager } from './ProductImagesManager';
import { ProductVariantsManager } from './ProductVariantsManager';
import { Image, Package } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: {
    id: string;
    name: string;
    description: string;
    price: number;
    category?: string;
    category_id?: number;
    brand?: string;
    stock: number;
    images: string[];
    is_active?: boolean;
    is_featured?: boolean;
    is_new?: boolean;
    is_bestseller?: boolean;
  } | null;
  onSubmit: (data: ProductFormData) => Promise<void>;
  isLoading?: boolean;
}

export function ProductModal({
  isOpen,
  onClose,
  product,
  onSubmit,
  isLoading = false
}: ProductModalProps) {
  const isEditing = !!product;
  const [activeTab, setActiveTab] = useState<'details' | 'images' | 'variants'>('details');
  const [hasVariants, setHasVariants] = useState(false);
  
  // Verificar si el producto tiene variantes
  useEffect(() => {
    if (product && isEditing) {
      checkVariants();
    } else {
      setHasVariants(false);
    }
  }, [product, isEditing]);
  
  const checkVariants = async () => {
    if (!product) return;
    try {
      const { getProductVariants } = await import('../../api/products');
      const variants = await getProductVariants(parseInt(product.id));
      setHasVariants(variants.length > 0);
    } catch (error) {
      console.error('Error checking variants:', error);
      setHasVariants(false);
    }
  };

  // Transformar producto a formato del formulario
  const initialData: Partial<ProductFormData> = product
    ? {
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        category_id: product.category_id?.toString() || '',
        brand: product.brand || '',
        stock: product.stock.toString(),
        image_url: product.images && product.images.length > 0 ? product.images[0] : '',
        is_active: product.is_active !== undefined ? product.is_active : true,
        is_featured: product.is_featured || false,
        is_new: product.is_new || false,
        is_bestseller: product.is_bestseller || false
      }
    : undefined;

  const handleImagesChange = () => {
    // Recargar productos si es necesario
    // Esto se manejará desde ProductsManagement
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Producto' : 'Nuevo Producto'}
      size="lg"
    >
      {isEditing ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('details')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'details'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Detalles
            </button>
            <button
              onClick={() => setActiveTab('images')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'images'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Image className="h-4 w-4" />
              Imágenes
            </button>
            <button
              onClick={() => setActiveTab('variants')}
              className={`px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 ${
                activeTab === 'variants'
                  ? 'text-rose-600 border-b-2 border-rose-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Package className="h-4 w-4" />
              Variantes
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'details' ? (
            <ProductForm
              initialData={initialData}
              onSubmit={onSubmit}
              onCancel={onClose}
              isLoading={isLoading}
              hasVariants={hasVariants}
            />
          ) : activeTab === 'images' ? (
            <ProductImagesManager
              productId={parseInt(product.id)}
              onImagesChange={handleImagesChange}
            />
          ) : (
            <ProductVariantsManager
              productId={parseInt(product.id)}
              onVariantsChange={() => {
                handleImagesChange();
                checkVariants(); // Re-verificar variantes después de cambios
              }}
            />
          )}
        </>
      ) : (
        <ProductForm
          initialData={initialData}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
}

