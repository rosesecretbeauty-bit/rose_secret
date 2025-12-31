import React from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { useForm } from '../../hooks/useForm';
import { Promotion } from '../../api/promotions';

interface PromotionFormData {
  type: 'flash_sale' | 'banner' | 'popup' | 'homepage_section';
  title: string;
  description: string;
  discount_percentage: string;
  discount_amount: string;
  discount_type: 'percentage' | 'fixed';
  start_date: string;
  end_date: string;
  active: boolean;
  cta_text: string;
  cta_url: string;
  banner_position: 'top' | 'header' | 'homepage' | 'floating';
  min_purchase: string;
  max_discount: string;
  usage_limit: string;
  image_url: string;
  background_color: string;
  text_color: string;
  show_countdown: boolean;
  priority: string;
}

interface PromotionModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotion?: Promotion | null;
  onSubmit: (data: Partial<Promotion>) => Promise<void>;
  isLoading?: boolean;
}

const initialValues: PromotionFormData = {
  type: 'banner',
  title: '',
  description: '',
  discount_percentage: '',
  discount_amount: '',
  discount_type: 'percentage',
  start_date: '',
  end_date: '',
  active: true,
  cta_text: 'Comprar Ahora',
  cta_url: '',
  banner_position: 'header',
  min_purchase: '',
  max_discount: '',
  usage_limit: '',
  image_url: '',
  background_color: '',
  text_color: '',
  show_countdown: true,
  priority: '0'
};

const validationRules = {
  title: { required: true },
  start_date: { required: true },
  end_date: { required: true },
  cta_text: { required: true }
};

export function PromotionModal({
  isOpen,
  onClose,
  promotion,
  onSubmit,
  isLoading = false
}: PromotionModalProps) {
  const isEditing = !!promotion;

  // Transformar promoción a formato del formulario
  const getInitialData = (): PromotionFormData => {
    if (promotion) {
      const startDate = promotion.start_date ? new Date(promotion.start_date).toISOString().slice(0, 16) : '';
      const endDate = promotion.end_date ? new Date(promotion.end_date).toISOString().slice(0, 16) : '';
      
      return {
        type: promotion.type,
        title: promotion.title,
        description: promotion.description || '',
        discount_percentage: promotion.discount_percentage?.toString() || '',
        discount_amount: promotion.discount_amount?.toString() || '',
        discount_type: promotion.discount_type,
        start_date: startDate,
        end_date: endDate,
        active: promotion.active !== undefined ? promotion.active : true,
        cta_text: promotion.cta_text || 'Comprar Ahora',
        cta_url: promotion.cta_url || '',
        banner_position: promotion.banner_position,
        min_purchase: promotion.min_purchase?.toString() || '',
        max_discount: promotion.max_discount?.toString() || '',
        usage_limit: promotion.usage_limit?.toString() || '',
        image_url: promotion.image_url || '',
        background_color: promotion.background_color || '',
        text_color: promotion.text_color || '',
        show_countdown: promotion.show_countdown !== undefined ? promotion.show_countdown : true,
        priority: promotion.priority?.toString() || '0'
      };
    }
    return initialValues;
  };

  const initialFormData = React.useMemo(() => {
    return { ...initialValues, ...getInitialData() };
  }, [promotion?.id, isOpen]);

  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue
  } = useForm<PromotionFormData>(initialFormData, validationRules);

  // Actualizar valores cuando cambia la promoción o se abre el modal
  React.useEffect(() => {
    if (isOpen) {
      const data = getInitialData();
      Object.keys(data).forEach(key => {
        setFieldValue(key, data[key as keyof PromotionFormData]);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, promotion?.id]);

  const handleFormSubmit = async () => {
    await handleSubmit(async (formValues) => {
      const promotionData: Partial<Promotion> = {
        type: formValues.type,
        title: formValues.title,
        description: formValues.description || undefined,
        discount_type: formValues.discount_type,
        discount_percentage: formValues.discount_percentage ? parseFloat(formValues.discount_percentage) : undefined,
        discount_amount: formValues.discount_amount ? parseFloat(formValues.discount_amount) : undefined,
        start_date: new Date(formValues.start_date).toISOString(),
        end_date: new Date(formValues.end_date).toISOString(),
        active: formValues.active,
        cta_text: formValues.cta_text,
        cta_url: formValues.cta_url || undefined,
        banner_position: formValues.banner_position,
        min_purchase: formValues.min_purchase ? parseFloat(formValues.min_purchase) : undefined,
        max_discount: formValues.max_discount ? parseFloat(formValues.max_discount) : undefined,
        usage_limit: formValues.usage_limit ? parseInt(formValues.usage_limit) : undefined,
        image_url: formValues.image_url || undefined,
        background_color: formValues.background_color || undefined,
        text_color: formValues.text_color || undefined,
        show_countdown: formValues.show_countdown,
        priority: parseInt(formValues.priority)
      };

      await onSubmit(promotionData);
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Promoción' : 'Nueva Promoción'}
      size="lg"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit(); }} className="space-y-6">
        {/* Información Básica */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Información Básica</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Promoción *
            </label>
            <select
              value={values.type}
              onChange={(e) => handleChange('type', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="banner">Banner</option>
              <option value="flash_sale">Flash Sale</option>
              <option value="popup">Popup</option>
              <option value="homepage_section">Sección Homepage</option>
            </select>
          </div>

          <Input
            label="Título *"
            name="title"
            value={values.title}
            onChange={(e) => handleChange('title', e.target.value)}
            onBlur={() => handleBlur('title')}
            error={touched.title ? errors.title : undefined}
            placeholder="Ej: Oferta Especial de Verano"
            required
          />

          <Textarea
            label="Descripción"
            name="description"
            value={values.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Descripción de la promoción..."
            rows={3}
          />
        </div>

        {/* Descuento */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Descuento</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tipo de Descuento *
            </label>
            <select
              value={values.discount_type}
              onChange={(e) => handleChange('discount_type', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="percentage">Porcentaje</option>
              <option value="fixed">Monto Fijo</option>
            </select>
          </div>

          {values.discount_type === 'percentage' ? (
            <Input
              label="Porcentaje de Descuento (%)"
              name="discount_percentage"
              value={values.discount_percentage}
              onChange={(e) => handleChange('discount_percentage', e.target.value)}
              placeholder="20"
              type="number"
              min="0"
              max="100"
              step="0.01"
            />
          ) : (
            <Input
              label="Monto de Descuento"
              name="discount_amount"
              value={values.discount_amount}
              onChange={(e) => handleChange('discount_amount', e.target.value)}
              placeholder="50.00"
              type="number"
              min="0"
              step="0.01"
            />
          )}

          <Input
            label="Descuento Máximo"
            name="max_discount"
            value={values.max_discount}
            onChange={(e) => handleChange('max_discount', e.target.value)}
            placeholder="100.00"
            type="number"
            min="0"
            step="0.01"
            helperText="Límite máximo del descuento (opcional)"
          />
        </div>

        {/* Fechas y Estado */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Fechas y Estado</h3>
          
          <Input
            label="Fecha de Inicio *"
            name="start_date"
            value={values.start_date}
            onChange={(e) => handleChange('start_date', e.target.value)}
            onBlur={() => handleBlur('start_date')}
            error={touched.start_date ? errors.start_date : undefined}
            type="datetime-local"
            required
          />

          <Input
            label="Fecha de Fin *"
            name="end_date"
            value={values.end_date}
            onChange={(e) => handleChange('end_date', e.target.value)}
            onBlur={() => handleBlur('end_date')}
            error={touched.end_date ? errors.end_date : undefined}
            type="datetime-local"
            required
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="active"
              checked={values.active}
              onChange={(e) => handleChange('active', e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Activa
            </label>
          </div>
        </div>

        {/* CTA y Posición */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Call to Action</h3>
          
          <Input
            label="Texto del Botón *"
            name="cta_text"
            value={values.cta_text}
            onChange={(e) => handleChange('cta_text', e.target.value)}
            onBlur={() => handleBlur('cta_text')}
            error={touched.cta_text ? errors.cta_text : undefined}
            placeholder="Comprar Ahora"
            required
          />

          <Input
            label="URL del CTA"
            name="cta_url"
            value={values.cta_url}
            onChange={(e) => handleChange('cta_url', e.target.value)}
            placeholder="/shop o /category/perfumes"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Posición del Banner
            </label>
            <select
              value={values.banner_position}
              onChange={(e) => handleChange('banner_position', e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
            >
              <option value="top">Superior</option>
              <option value="header">Header</option>
              <option value="homepage">Homepage</option>
              <option value="floating">Flotante</option>
            </select>
          </div>
        </div>

        {/* Configuración Adicional */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Configuración Adicional</h3>
          
          <Input
            label="Compra Mínima"
            name="min_purchase"
            value={values.min_purchase}
            onChange={(e) => handleChange('min_purchase', e.target.value)}
            placeholder="100.00"
            type="number"
            min="0"
            step="0.01"
            helperText="Monto mínimo de compra requerido (opcional)"
          />

          <Input
            label="Límite de Usos"
            name="usage_limit"
            value={values.usage_limit}
            onChange={(e) => handleChange('usage_limit', e.target.value)}
            placeholder="1000"
            type="number"
            min="0"
            helperText="Número máximo de veces que se puede usar (opcional)"
          />

          <Input
            label="Prioridad"
            name="priority"
            value={values.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            placeholder="0"
            type="number"
            helperText="Mayor número = mayor prioridad (aparece primero)"
          />

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="show_countdown"
              checked={values.show_countdown}
              onChange={(e) => handleChange('show_countdown', e.target.checked)}
              className="h-5 w-5 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
            />
            <label htmlFor="show_countdown" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Mostrar cuenta regresiva
            </label>
          </div>
        </div>

        {/* Apariencia */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Apariencia</h3>
          
          <Input
            label="URL de Imagen"
            name="image_url"
            value={values.image_url}
            onChange={(e) => handleChange('image_url', e.target.value)}
            placeholder="https://example.com/image.jpg"
            type="url"
          />

          <Input
            label="Color de Fondo (hex)"
            name="background_color"
            value={values.background_color}
            onChange={(e) => handleChange('background_color', e.target.value)}
            placeholder="#FF6B9D"
            type="text"
          />

          <Input
            label="Color de Texto (hex)"
            name="text_color"
            value={values.text_color}
            onChange={(e) => handleChange('text_color', e.target.value)}
            placeholder="#FFFFFF"
            type="text"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading || isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isLoading || isSubmitting}
            disabled={isLoading || isSubmitting}
          >
            {isEditing ? 'Actualizar' : 'Crear'} Promoción
          </Button>
        </div>
      </form>
    </Modal>
  );
}

