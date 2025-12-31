import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Star, GripVertical, X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { ImageUpload } from '../ui/ImageUpload';
import { useToastStore } from '../../stores/toastStore';
import {
  getProductImages,
  addProductImage,
  updateProductImage,
  deleteProductImage,
  reorderProductImages,
  uploadProductCoverImage,
  uploadProductGalleryImage,
  deleteProductGalleryImage,
  ProductImage
} from '../../api/products';
import { PremiumLoader } from '../ui/PremiumLoader';

interface ProductImagesManagerProps {
  productId: number;
  onImagesChange?: () => void;
}

export function ProductImagesManager({
  productId,
  onImagesChange
}: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [newImageAlt, setNewImageAlt] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const addToast = useToastStore(state => state.addToast);

  // Obtener imagen principal actual
  const primaryImage = images.find(img => img.is_primary);
  const galleryImages = images.filter(img => !img.is_primary);

  // Cargar imágenes
  useEffect(() => {
    loadImages();
  }, [productId]);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      const loadedImages = await getProductImages(productId);
      // Transformar imágenes del backend al formato del componente
      setImages(loadedImages);
    } catch (error: any) {
      console.error('Error loading images:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar imágenes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadCover = async (url: string) => {
    // La URL ya viene de ImageUpload después de subir exitosamente
    // No necesitamos hacer nada adicional aquí, ImageUpload ya actualizó la BD
    await loadImages();
    onImagesChange?.();
  };

  const handleUploadGallery = async (url: string) => {
    // La URL ya viene de ImageUpload después de subir exitosamente
    // Solo limpiamos el alt text
    setNewImageAlt('');
    await loadImages();
    onImagesChange?.();
  };

  const handleSetPrimary = async (imageId: number) => {
    try {
      await updateProductImage(productId, imageId, {
        is_primary: true
      });
      
      addToast({
        type: 'success',
        message: 'Imagen principal actualizada'
      });
      
      await loadImages();
      onImagesChange?.();
    } catch (error: any) {
      console.error('Error setting primary:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al actualizar imagen principal'
      });
    }
  };

  const handleDeleteImage = async (imageId: number, isPrimary: boolean) => {
    if (!confirm('¿Eliminar esta imagen?')) {
      return;
    }

    try {
      // Si es principal, usar el endpoint de cover, si no, el de galería
      if (isPrimary) {
        // Para imagen principal, necesitamos usar el endpoint legacy
        // porque no tenemos endpoint específico de eliminar cover
        await deleteProductImage(productId, imageId);
      } else {
        await deleteProductGalleryImage(productId, imageId);
      }
      
      addToast({
        type: 'success',
        message: 'Imagen eliminada exitosamente'
      });
      
      await loadImages();
      onImagesChange?.();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al eliminar imagen'
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);
    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      const imageIds = images.map(img => img.id);
      await reorderProductImages(productId, imageIds);
      
      addToast({
        type: 'success',
        message: 'Imágenes reordenadas exitosamente'
      });
      
      await loadImages();
      onImagesChange?.();
    } catch (error: any) {
      console.error('Error reordering images:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al reordenar imágenes'
      });
      // Recargar para restaurar orden original
      await loadImages();
    } finally {
      setDraggedIndex(null);
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
      {/* Imagen Principal */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Star className="h-5 w-5 text-rose-600" />
          Imagen Principal
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Esta es la imagen que se mostrará como principal del producto en el catálogo.
        </p>
        <ImageUpload
          currentImageUrl={primaryImage?.url || null}
          onUploadSuccess={handleUploadCover}
          onUploadError={(error) => {
            addToast({
              type: 'error',
              message: error
            });
          }}
          previewType="rect"
          previewSize={300}
          uploadButtonText="Subir Imagen Principal"
          disabled={isUploadingCover}
          uploadEndpoint={`/images/products/${productId}/cover`}
        />
      </div>

      {/* Galería de Imágenes */}
      <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="h-5 w-5 text-rose-600" />
          Galería de Imágenes
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Añade imágenes adicionales para mostrar diferentes ángulos o detalles del producto.
        </p>
        <div className="space-y-4">
          <ImageUpload
            currentImageUrl={null}
            onUploadSuccess={handleUploadGallery}
            onUploadError={(error) => {
              addToast({
                type: 'error',
                message: error
              });
            }}
            previewType="rect"
            previewSize={200}
            uploadButtonText="Añadir Imagen a la Galería"
            disabled={isUploadingGallery}
            uploadEndpoint={`/images/products/${productId}/gallery`}
          />
        </div>
      </div>

      {/* Lista de imágenes de galería */}
      {galleryImages.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Imágenes de la Galería ({galleryImages.length})
          </h3>
          <div className="space-y-3">
            {galleryImages.map((image, index) => {
              // Encontrar el índice real en el array completo para drag & drop
              const realIndex = images.findIndex(img => img.id === image.id);
              return (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                draggable
                onDragStart={() => handleDragStart(realIndex)}
                onDragOver={(e) => handleDragOver(e, realIndex)}
                onDragEnd={handleDragEnd}
                className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-rose-300 transition-all cursor-move"
              >
                {/* Drag handle */}
                <div className="text-gray-400 hover:text-gray-600">
                  <GripVertical className="h-5 w-5" />
                </div>

                {/* Imagen thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={image.url}
                    alt={image.alt || `Imagen ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect fill="%23fee2e2" width="80" height="80"/%3E%3Ctext fill="%23dc2626" font-family="sans-serif" font-size="10" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Información */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs text-gray-500">
                      Orden: {image.sort_order}
                    </span>
                  </div>
                  {image.alt && (
                    <p className="text-sm text-gray-600 truncate">
                      {image.alt}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 truncate">
                    {image.url}
                  </p>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSetPrimary(image.id)}
                  >
                    <Star className="h-4 w-4 mr-1" />
                    Principal
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteImage(image.id, false)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

