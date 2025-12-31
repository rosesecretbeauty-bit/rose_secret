// src/components/admin/BannersManager.tsx

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit2, Image as ImageIcon, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import { useToastStore } from '../../stores/toastStore';
import { Banner, getBanners, uploadBanner, updateBanner, deleteBanner } from '../../api/banners';
import { PremiumLoader } from '../ui/PremiumLoader';

export function BannersManager() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<Banner['type']>('home');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadBanners();
  }, []);

  const loadBanners = async () => {
    try {
      setLoading(true);
      const loadedBanners = await getBanners();
      setBanners(loadedBanners);
    } catch (error: any) {
      console.error('Error loading banners:', error);
      addToast({
        type: 'error',
        message: 'Error al cargar banners'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredBanners = banners.filter(b => b.type === selectedType);

  const handleUploadSuccess = async (url: string) => {
    await loadBanners();
    setIsModalOpen(false);
    setEditingBanner(null);
    addToast({
      type: 'success',
      message: editingBanner ? 'Banner actualizado exitosamente' : 'Banner creado exitosamente'
    });
  };

  const handleDelete = async (bannerId: number) => {
    if (!confirm('¿Eliminar este banner?')) {
      return;
    }

    try {
      setIsDeleting(bannerId);
      await deleteBanner(bannerId);
      await loadBanners();
      addToast({
        type: 'success',
        message: 'Banner eliminado exitosamente'
      });
    } catch (error: any) {
      console.error('Error deleting banner:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al eliminar banner'
      });
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (banner: Banner) => {
    try {
      const newStatus = banner.status === 'active' ? 'inactive' : 'active';
      await updateBanner(banner.id, { status: newStatus });
      await loadBanners();
      addToast({
        type: 'success',
        message: `Banner ${newStatus === 'active' ? 'activado' : 'desactivado'} exitosamente`
      });
    } catch (error: any) {
      console.error('Error toggling status:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al cambiar estado'
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <PremiumLoader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtros por tipo */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        {(['home', 'promotion', 'sidebar', 'popup'] as Banner['type'][]).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 text-sm font-medium transition-colors ${
              selectedType === type
                ? 'text-rose-600 border-b-2 border-rose-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {type === 'home' ? 'Home' : type === 'promotion' ? 'Promociones' : type === 'sidebar' ? 'Sidebar' : 'Popup'}
          </button>
        ))}
      </div>

      {/* Botón para crear nuevo banner */}
      <div className="flex justify-end">
        <Button
          onClick={() => {
            setEditingBanner(null);
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Crear Nuevo Banner
        </Button>
      </div>

      {/* Lista de banners */}
      {filteredBanners.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No hay banners de tipo "{selectedType}"</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBanners.map((banner) => (
            <motion.div
              key={banner.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Imagen del banner */}
              <div className="relative aspect-video bg-gray-100">
                <img
                  src={banner.image_url}
                  alt={banner.title || 'Banner'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant={banner.status === 'active' ? 'success' : 'secondary'}>
                    {banner.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>

              {/* Información */}
              <div className="p-4 space-y-3">
                {banner.title && (
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                )}
                <div className="text-xs text-gray-500">
                  Orden: {banner.display_order}
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleStatus(banner)}
                  >
                    {banner.status === 'active' ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-1" />
                        Desactivar
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-1" />
                        Activar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingBanner(banner);
                      setIsModalOpen(true);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(banner.id)}
                    disabled={isDeleting === banner.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para crear/editar banner */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingBanner(null);
        }}
        title={editingBanner ? 'Editar Banner' : 'Crear Nuevo Banner'}
        size="lg"
      >
        <BannerForm
          banner={editingBanner}
          type={selectedType}
          onSuccess={handleUploadSuccess}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingBanner(null);
          }}
        />
      </Modal>
    </div>
  );
}

interface BannerFormProps {
  banner?: Banner | null;
  type: Banner['type'];
  onSuccess: (url: string) => void;
  onCancel: () => void;
}

function BannerForm({ banner, type, onSuccess, onCancel }: BannerFormProps) {
  const [title, setTitle] = useState(banner?.title || '');
  const [linkUrl, setLinkUrl] = useState(banner?.link_url || '');
  const [linkText, setLinkText] = useState(banner?.link_text || '');
  const [status, setStatus] = useState<Banner['status']>(banner?.status || 'inactive');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(banner?.image_url || null);
  const [isUploading, setIsUploading] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    if (!selectedFile && !banner) {
      addToast({
        type: 'error',
        message: 'Por favor selecciona una imagen'
      });
      return;
    }

    try {
      setIsUploading(true);
      
      if (banner) {
        // Actualizar banner existente
        if (selectedFile) {
          // Actualizar con nueva imagen
          await updateBanner(banner.id, {
            title: title || undefined,
            link_url: linkUrl || undefined,
            link_text: linkText || undefined,
            status
          }, selectedFile);
        } else {
          // Solo actualizar campos sin cambiar imagen
          await updateBanner(banner.id, {
            title: title || undefined,
            link_url: linkUrl || undefined,
            link_text: linkText || undefined,
            status
          });
        }
        onSuccess(banner.image_url);
      } else {
        // Crear nuevo banner
        if (!selectedFile) {
          addToast({
            type: 'error',
            message: 'Por favor selecciona una imagen'
          });
          return;
        }

        await uploadBanner(selectedFile, {
          type,
          title: title || undefined,
          link_url: linkUrl || undefined,
          link_text: linkText || undefined,
          status
        });
        onSuccess('');
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar banner'
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Input
        label="Título (Opcional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Título del banner"
      />

      <Input
        label="URL de Enlace (Opcional)"
        value={linkUrl}
        onChange={(e) => setLinkUrl(e.target.value)}
        placeholder="https://ejemplo.com"
        type="url"
      />

      <Input
        label="Texto del Enlace (Opcional)"
        value={linkText}
        onChange={(e) => setLinkText(e.target.value)}
        placeholder="Ver más"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Estado
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as Banner['status'])}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-rose-100 focus:border-rose-400"
        >
          <option value="inactive">Inactivo</option>
          <option value="active">Activo</option>
          <option value="scheduled">Programado</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagen del Banner {!banner && '*'}
        </label>
        {imagePreview && (
          <div className="mb-4">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            file:bg-rose-50 file:text-rose-700
            hover:file:bg-rose-100
            file:cursor-pointer
            cursor-pointer
            border border-gray-200 rounded-lg"
        />
        <p className="mt-2 text-xs text-gray-500">
          PNG, JPG, WEBP hasta 5MB. Recomendado: 1920x1080px
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
        <Button variant="outline" onClick={onCancel} disabled={isUploading}>
          Cancelar
        </Button>
        <Button onClick={handleSave} isLoading={isUploading} disabled={!selectedFile && !banner}>
          {banner ? 'Actualizar Banner' : 'Crear Banner'}
        </Button>
      </div>
    </div>
  );
}

