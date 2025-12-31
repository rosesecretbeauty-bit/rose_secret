import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Tag, Percent, X, CheckSquare } from 'lucide-react';
import { Button } from '../ui/Button';
interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onDelete: () => void;
  onUpdateStatus: () => void;
  onUpdatePrice: () => void;
}
export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onDelete,
  onUpdateStatus,
  onUpdatePrice
}: BulkActionsBarProps) {
  return <AnimatePresence>
      {selectedCount > 0 && <motion.div initial={{
      y: 100,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} exit={{
      y: 100,
      opacity: 0
    }} className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 flex items-center gap-6 min-w-[500px]">
          <div className="flex items-center gap-3 border-r border-gray-200 dark:border-gray-700 pr-6">
            <div className="bg-rose-100 dark:bg-rose-900/30 p-2 rounded-lg">
              <CheckSquare className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <span className="font-medium text-gray-900 dark:text-white">
              {selectedCount} seleccionados
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1">
            <Button variant="outline" size="sm" onClick={onUpdateStatus}>
              <Tag className="h-4 w-4 mr-2" />
              Estado
            </Button>
            <Button variant="outline" size="sm" onClick={onUpdatePrice}>
              <Percent className="h-4 w-4 mr-2" />
              Precio
            </Button>
            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300" onClick={onDelete}>
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>

          <button onClick={onClearSelection} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </motion.div>}
    </AnimatePresence>;
}