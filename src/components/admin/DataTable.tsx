import React, { useState, useMemo, useCallback, memo } from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronDown, ChevronUp, MoreVertical, Edit, Trash2 } from 'lucide-react';
interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
}
// Memoizar el componente para evitar re-renders innecesarios
export const DataTable = memo(<T extends { id: string }>({
  data,
  columns,
  onEdit,
  onDelete,
  searchable = true,
  searchPlaceholder = 'Buscar...'
}: DataTableProps<T>) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  
  // Memoizar datos filtrados
  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const query = searchQuery.toLowerCase();
    return data.filter(item => {
      return Object.values(item).some(value => String(value).toLowerCase().includes(query));
    });
  }, [data, searchQuery]);
  
  // Memoizar datos ordenados
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortColumn as keyof T];
      const bValue = b[sortColumn as keyof T];
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortColumn, sortDirection]);
  const handleSort = useCallback((columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  }, [sortColumn, sortDirection]);
  return <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Search */}
      {searchable && <div className="p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="text" placeholder={searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 dark:text-white" />
          </div>
        </div>}

      {/* Mobile Cards View (small screens) */}
      <div className="block lg:hidden space-y-2 sm:space-y-3 p-3 sm:p-4">
        {sortedData.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-3 sm:p-4 space-y-2 sm:space-y-3"
          >
            {columns.slice(0, 3).map(column => (
              <div key={String(column.key)} className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                <span className="text-[10px] sm:text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">
                  {column.label}:
                </span>
                <span className="text-xs sm:text-sm text-gray-900 dark:text-white sm:text-right flex-1 break-words">
                  {column.render ? column.render(item) : String(item[column.key as keyof T] || '-')}
                </span>
              </div>
            ))}
            {(onEdit || onDelete) && (
              <div className="flex flex-col sm:flex-row gap-2 pt-2 sm:pt-3 border-t border-gray-200 dark:border-gray-700">
                {onEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition-colors"
                  >
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(item)}
                    className="flex-1 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    Eliminar
                  </button>
                )}
              </div>
            )}
          </motion.div>
        ))}
        {sortedData.length === 0 && (
          <div className="text-center py-8 sm:py-12 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            No se encontraron resultados
          </div>
        )}
      </div>

      {/* Desktop/Tablet Table View */}
      <div className="hidden lg:block overflow-x-auto custom-scrollbar">
        <div className="inline-block min-w-full align-middle">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                {columns.map(column => (
                  <th key={String(column.key)} className="px-4 xl:px-6 py-3 xl:py-4 text-left text-xs xl:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    {column.sortable ? (
                      <button 
                        onClick={() => handleSort(String(column.key))} 
                        className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white transition-colors"
                      >
                        {column.label}
                        {sortColumn === column.key && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                            {sortDirection === 'asc' ? (
                              <ChevronUp className="h-3 w-3 xl:h-4 xl:w-4" />
                            ) : (
                              <ChevronDown className="h-3 w-3 xl:h-4 xl:w-4" />
                            )}
                          </motion.div>
                        )}
                      </button>
                    ) : (
                      column.label
                    )}
                  </th>
                ))}
                {(onEdit || onDelete) && (
                  <th className="px-4 xl:px-6 py-3 xl:py-4 text-right text-xs xl:text-sm font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider whitespace-nowrap">
                    Acciones
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {sortedData.map((item, index) => (
                <motion.tr 
                  key={item.id} 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {columns.map(column => (
                    <td 
                      key={String(column.key)} 
                      className="px-4 xl:px-6 py-3 xl:py-4 text-xs xl:text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap"
                    >
                      {column.render ? column.render(item) : String(item[column.key as keyof T] || '-')}
                    </td>
                  ))}
                  {(onEdit || onDelete) && (
                    <td className="px-4 xl:px-6 py-3 xl:py-4 text-right">
                      <div className="relative inline-block">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
                          className="p-1.5 xl:p-2 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                        >
                          <MoreVertical className="h-4 w-4 xl:h-5 xl:w-5 text-gray-600 dark:text-gray-300" />
                        </motion.button>

                        {activeMenu === item.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            className="absolute right-0 mt-2 w-40 xl:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-premium-lg border border-gray-200 dark:border-gray-700 py-1 z-10"
                          >
                            {onEdit && (
                              <button
                                onClick={() => {
                                  onEdit(item);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 text-xs xl:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                              >
                                <Edit className="h-3 w-3 xl:h-4 xl:w-4" />
                                Editar
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => {
                                  onDelete(item);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center gap-2 xl:gap-3 px-3 xl:px-4 py-2 text-xs xl:text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                              >
                                <Trash2 className="h-3 w-3 xl:h-4 xl:w-4" />
                                Eliminar
                              </button>
                            )}
                          </motion.div>
                        )}
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))}
            </tbody>
          </table>
          {sortedData.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm xl:text-base text-gray-500 dark:text-gray-400">
                No se encontraron resultados
              </p>
            </div>
          )}
        </div>
      </div>
    </div>;
}) as <T extends { id: string }>(props: DataTableProps<T>) => JSX.Element;