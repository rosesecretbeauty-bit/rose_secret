import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Percent, Tag, Calendar, DollarSign, Loader2 } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { DeleteConfirmationModal } from '../../components/admin/DeleteConfirmationModal';
import { PromotionModal } from '../../components/admin/PromotionModal';
import { getAllPromotions, createPromotion, updatePromotion, deletePromotion, Promotion } from '../../api/promotions';
import { useToastStore } from '../../stores/toastStore';

interface PromotionTableRow {
  id: string;
  title: string;
  type: string;
  discount: string;
  uses: number;
  limit: number | null;
  status: string;
  expires: string;
}

export function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [filter, setFilter] = useState<string>('Todas');
  const [promotionModal, setPromotionModal] = useState<{
    isOpen: boolean;
    promotion: Promotion | null;
  }>({
    isOpen: false,
    promotion: null
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    item: Promotion | null;
  }>({
    isOpen: false,
    item: null
  });
  
  const addToast = useToastStore(state => state.addToast);

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      setIsLoading(true);
      const data = await getAllPromotions();
      setPromotions(data);
    } catch (error: any) {
      console.error('Error cargando promociones:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar promociones'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreate = () => {
    setPromotionModal({
      isOpen: true,
      promotion: null
    });
  };

  const handleEdit = (promo: PromotionTableRow) => {
    const promotion = promotions.find(p => p.id.toString() === promo.id);
    if (promotion) {
      setPromotionModal({
        isOpen: true,
        promotion
      });
    }
  };

  const handleDelete = (promo: PromotionTableRow) => {
    const promotion = promotions.find(p => p.id.toString() === promo.id);
    if (promotion) {
      setDeleteModal({
        isOpen: true,
        item: promotion
      });
    }
  };

  const handleSubmitPromotion = async (data: Partial<Promotion>) => {
    try {
      if (promotionModal.promotion) {
        // Actualizar
        await updatePromotion(promotionModal.promotion.id, data);
        addToast({
          type: 'success',
          message: 'Promoción actualizada exitosamente'
        });
      } else {
        // Crear
        await createPromotion(data);
        addToast({
          type: 'success',
          message: 'Promoción creada exitosamente'
        });
      }
      setPromotionModal({ isOpen: false, promotion: null });
      loadPromotions();
    } catch (error: any) {
      console.error('Error guardando promoción:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar promoción'
      });
    }
  };

  const confirmDelete = async () => {
    if (!deleteModal.item) return;
    
    try {
      setIsDeleting(true);
      await deletePromotion(deleteModal.item.id);
      addToast({
        type: 'success',
        message: 'Promoción eliminada exitosamente'
      });
      setDeleteModal({ isOpen: false, item: null });
      loadPromotions();
    } catch (error: any) {
      console.error('Error eliminando promoción:', error);
      addToast({
        type: 'error',
        message: error.message || 'Error al eliminar promoción'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Transformar promociones a formato de tabla
  const getTableData = (): PromotionTableRow[] => {
    return promotions.map(promo => {
      const now = new Date();
      const startDate = new Date(promo.start_date);
      const endDate = new Date(promo.end_date);
      
      let status = 'Inactiva';
      if (promo.active) {
        if (now < startDate) {
          status = 'Programada';
        } else if (now >= startDate && now <= endDate) {
          status = 'Activa';
        } else {
          status = 'Expirada';
        }
      }

      const discount = promo.discount_type === 'percentage'
        ? `${promo.discount_percentage || 0}%`
        : `$${promo.discount_amount || 0}`;

      const typeLabel = {
        'banner': 'Banner',
        'flash_sale': 'Flash Sale',
        'popup': 'Popup',
        'homepage_section': 'Homepage'
      }[promo.type] || promo.type;

      return {
        id: promo.id.toString(),
        title: promo.title,
        type: typeLabel,
        discount,
        uses: promo.usage_count || 0,
        limit: promo.usage_limit || null,
        status,
        expires: new Date(promo.end_date).toLocaleDateString('es-ES')
      };
    });
  };

  // Filtrar promociones
  const getFilteredPromotions = (): PromotionTableRow[] => {
    const tableData = getTableData();
    
    if (filter === 'Todas') return tableData;
    if (filter === 'Activas') return tableData.filter(p => p.status === 'Activa');
    if (filter === 'Expiradas') return tableData.filter(p => p.status === 'Expirada');
    
    return tableData;
  };

  const promotionColumns = [
    {
      key: 'title' as const,
      label: 'Título',
      sortable: true,
      render: (promo: PromotionTableRow) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 rounded-lg flex items-center justify-center">
            <Tag className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <span className="font-semibold text-gray-900 dark:text-white block">
              {promo.title}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {promo.type}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'discount' as const,
      label: 'Descuento',
      sortable: true,
      render: (promo: PromotionTableRow) => (
        <span className="font-semibold text-green-600 dark:text-green-400">
          {promo.discount}
        </span>
      )
    },
    {
      key: 'uses' as const,
      label: 'Usos',
      sortable: true,
      render: (promo: PromotionTableRow) => (
        <span className="text-gray-900 dark:text-white">
          {promo.uses} {promo.limit && `/ ${promo.limit}`}
        </span>
      )
    },
    {
      key: 'status' as const,
      label: 'Estado',
      render: (promo: PromotionTableRow) => {
        const statusColors: Record<string, string> = {
          'Activa': 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
          'Expirada': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400',
          'Inactiva': 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
          'Programada': 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
        };
        
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[promo.status] || statusColors['Inactiva']}`}>
            {promo.status}
          </span>
        );
      }
    },
    {
      key: 'expires' as const,
      label: 'Expira',
      sortable: true
    }
  ];

  // Calcular estadísticas
  const tableData = getTableData();
  const totalPromotions = tableData.length;
  const activePromotions = tableData.filter(p => p.status === 'Activa').length;
  const totalUses = tableData.reduce((sum, p) => sum + p.uses, 0);
  
  // Calcular descuento promedio
  const avgDiscount = promotions.length > 0
    ? promotions.reduce((sum, p) => {
        const discount = p.discount_type === 'percentage' 
          ? (p.discount_percentage || 0)
          : 0;
        return sum + discount;
      }, 0) / promotions.length
    : 0;

  const filteredData = getFilteredPromotions();

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-rose-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Gestión de Promociones
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Crea y administra promociones y flash sales
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="h-5 w-5 mr-2" />
            Nueva Promoción
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Total Promociones" 
            value={totalPromotions} 
            icon={Percent} 
            color="green" 
          />
          <StatCard 
            title="Activas" 
            value={activePromotions} 
            icon={Tag} 
            color="blue" 
          />
          <StatCard 
            title="Total Usos" 
            value={totalUses} 
            icon={Calendar} 
            color="purple" 
          />
          <StatCard 
            title="Descuento Promedio" 
            value={`${avgDiscount.toFixed(1)}%`} 
            icon={DollarSign} 
            color="rose" 
          />
        </div>

        {/* Status Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-2 overflow-x-auto pb-2"
        >
          {['Todas', 'Activas', 'Expiradas'].map((filterOption, index) => (
            <motion.button
              key={filterOption}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => setFilter(filterOption)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption
                  ? 'bg-rose-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption}
            </motion.button>
          ))}
        </motion.div>

        {/* Promotions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <DataTable
            data={filteredData}
            columns={promotionColumns}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchPlaceholder="Buscar promociones por título..."
          />
        </motion.div>
      </div>

      {/* Promotion Modal */}
      <PromotionModal
        isOpen={promotionModal.isOpen}
        onClose={() => setPromotionModal({ isOpen: false, promotion: null })}
        promotion={promotionModal.promotion}
        onSubmit={handleSubmitPromotion}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, item: null })}
        onConfirm={confirmDelete}
        title="Eliminar Promoción"
        message="¿Estás segura de que deseas eliminar esta promoción?"
        itemName={deleteModal.item?.title}
        isDeleting={isDeleting}
      />
    </AdminLayout>
  );
}
