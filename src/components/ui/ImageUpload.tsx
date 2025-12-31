import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Loader2, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export interface ImageUploadProps {
  /** URL de la imagen actual (opcional) */
  currentImageUrl?: string | null;
  /** Callback cuando se sube exitosamente una imagen */
  onUploadSuccess: (url: string) => void;
  /** Callback cuando hay un error */
  onUploadError?: (error: string) => void;
  /** Tipo de preview: 'circle' para avatar, 'rect' para otros */
  previewType?: 'circle' | 'rect';
  /** Tamaño del preview en píxeles */
  previewSize?: number;
  /** Texto del botón */
  uploadButtonText?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Endpoint para subir la imagen */
  uploadEndpoint: string;
}

export function ImageUpload({
  currentImageUrl,
  onUploadSuccess,
  onUploadError,
  previewType = 'rect',
  previewSize = 200,
  uploadButtonText = 'Subir Imagen',
  disabled = false,
  uploadEndpoint
}: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  // Actualizar preview cuando currentImageUrl cambia
  useEffect(() => {
    setPreview(currentImageUrl || null);
  }, [currentImageUrl]);

  // Crear preview desde archivo
  const createPreview = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Manejar selección de archivo
  const handleFileSelect = useCallback(async (file: File) => {
    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'Por favor selecciona una imagen válida';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Validar tamaño (10MB máximo)
    if (file.size > 10 * 1024 * 1024) {
      const errorMsg = 'La imagen es demasiado grande. Tamaño máximo: 10MB';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      return;
    }

    // Crear preview inmediato
    createPreview(file);

    // Subir imagen
    setUploading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const token = localStorage.getItem('token');
      const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // NO establecer Content-Type cuando usamos FormData, el navegador lo hace automáticamente con el boundary correcto
      const headers: HeadersInit = {
        'Authorization': `Bearer ${token}`
      };
      
      const response = await fetch(`${apiBaseUrl}${uploadEndpoint}`, {
        method: 'POST',
        headers,
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || 'Error al subir imagen');
      }

      // Llamar callback con la URL
      onUploadSuccess(data.data.url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      const errorMsg = err.message || 'Error al subir imagen';
      setError(errorMsg);
      onUploadError?.(errorMsg);
      // Restaurar preview anterior en caso de error
      setPreview(currentImageUrl || null);
    } finally {
      setUploading(false);
    }
  }, [currentImageUrl, createPreview, onUploadSuccess, onUploadError, uploadEndpoint]);

  // Manejar cambio de input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Manejar drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  // Abrir selector de archivos
  const handleClick = () => {
    if (!disabled && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const previewStyle: React.CSSProperties = {
    width: previewType === 'circle' ? previewSize : '100%',
    height: previewType === 'circle' ? previewSize : previewSize,
    borderRadius: previewType === 'circle' ? '50%' : '8px'
  };

  return (
    <div className="space-y-4">
      {/* Preview de imagen */}
      <div className="flex items-start gap-4">
        <div
          className="relative flex-shrink-0 overflow-hidden bg-gray-100 border-2 border-dashed border-gray-300"
          style={previewStyle}
        >
          {preview ? (
            <motion.img
              src={preview}
              alt="Preview"
              className="w-full h-full object-cover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <ImageIcon className="h-12 w-12" />
            </div>
          )}

          {/* Overlay de estado */}
          {(uploading || success || error) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center"
            >
              {uploading && (
                <Loader2 className="h-8 w-8 text-white animate-spin" />
              )}
              {success && (
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              )}
              {error && (
                <AlertCircle className="h-8 w-8 text-red-400" />
              )}
            </motion.div>
          )}
        </div>

        {/* Controles */}
        <div className="flex-1 space-y-2">
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive
                ? 'border-rose-500 bg-rose-50'
                : 'border-gray-300 hover:border-gray-400'
            } ${disabled || uploading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={handleClick}
          >
            <div className="text-center">
              <Upload className={`h-8 w-8 mx-auto mb-2 ${dragActive ? 'text-rose-600' : 'text-gray-400'}`} />
              <p className="text-sm font-medium text-gray-700 mb-1">
                {uploading ? 'Subiendo...' : dragActive ? 'Suelta la imagen aquí' : 'Arrastra una imagen o haz clic'}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, WEBP hasta 10MB
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleInputChange}
            className="hidden"
            disabled={disabled || uploading}
          />

          <Button
            type="button"
            variant="outline"
            onClick={handleClick}
            disabled={disabled || uploading}
            className="w-full"
          >
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                {uploadButtonText}
              </>
            )}
          </Button>

          {/* Mensaje de error */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensaje de éxito */}
          <AnimatePresence>
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-3 bg-green-50 border border-green-200 rounded-lg"
              >
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">Imagen subida exitosamente</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

