import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, UserX, Crown } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DataTable } from '../../components/admin/DataTable';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { getAdminUsers, AdminUser } from '../../api/admin';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

export function UsersManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Todos');

  useEffect(() => {
    loadUsers();
  }, [currentPage, selectedFilter, searchTerm]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      const filters: any = {
        page: currentPage,
        limit: 20,
      };

      // Aplicar filtros
      if (searchTerm) {
        filters.search = searchTerm;
      }

      if (selectedFilter === 'Admin') {
        filters.role = 'admin';
      } else if (selectedFilter === 'Cliente') {
        filters.role = 'customer';
      }

      const response = await getAdminUsers(filters);
      
      if (response.success && response.data) {
        setUsers(response.data.users);
        setTotalUsers(response.data.pagination.total);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleEdit = (user: AdminUser) => {
    console.log('Edit user:', user);
    // Open edit modal
  };
  const handleDelete = (user: AdminUser) => {
    if (user.role === 'admin' || user.role === 'Admin') {
      alert('No se puede eliminar un usuario Admin');
      return;
    }
    if (confirm(`¿Eliminar usuario ${user.name}?`)) {
      console.log('Delete user:', user);
      // TODO: Implementar eliminación de usuario
    }
  };

  // Calculate stats from loaded users
  const activeUsers = users.filter(u => u.status === 'Activo').length;
  const adminUsers = users.filter(u => u.role?.toLowerCase() === 'admin').length;
  const totalRevenue = users.reduce((sum, u) => sum + u.spent, 0);

  const userColumns = [{
    key: 'name',
    label: 'Usuario',
    sortable: true,
    render: (user: AdminUser) => <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-gradient-to-br from-rose-100 to-rose-200 dark:from-rose-900 dark:to-rose-800 rounded-full flex items-center justify-center">
            <span className="text-rose-600 dark:text-rose-400 font-bold text-sm">
              {user.name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">
              {user.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>
  }, {
    key: 'role',
    label: 'Rol',
    sortable: true,
    render: (user: AdminUser) => {
      const isAdmin = user.role?.toLowerCase() === 'admin';
      return <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${isAdmin ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400' : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'}`}>
          {isAdmin && <Crown className="h-3 w-3" />}
          {user.role === 'admin' ? 'Admin' : user.role === 'customer' ? 'Cliente' : user.role}
        </span>;
    }
  }, {
    key: 'status',
    label: 'Estado',
    render: (user: AdminUser) => <span className={`px-3 py-1 rounded-full text-xs font-semibold ${user.status === 'Activo' ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'}`}>
          {user.status}
        </span>
  }, {
    key: 'orders',
    label: 'Órdenes',
    sortable: true
  }, {
    key: 'spent',
    label: 'Total Gastado',
    sortable: true,
    render: (user: AdminUser) => <span className="font-semibold text-gray-900 dark:text-white">
          ${user.spent.toFixed(2)}
        </span>
  }, {
    key: 'joined',
    label: 'Registro',
    sortable: true
  }];
  return <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">
              Gestión de Usuarios
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Administra usuarios, roles y permisos
            </p>
          </div>
          <Button className="w-full sm:w-auto">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Nuevo Usuario
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <StatCard title="Total Usuarios" value={totalUsers} change={5.2} icon={Users} color="blue" />
          <StatCard title="Usuarios Activos" value={activeUsers} change={3.1} icon={UserCheck} color="green" />
          <StatCard title="Administradores" value={adminUsers} icon={Crown} color="purple" />
          <StatCard title="Ingresos Totales" value={`$${totalRevenue.toFixed(2)}`} change={12.5} icon={Users} color="rose" />
        </div>

        {/* Role Filter Tabs */}
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2
      }} className="flex gap-2 overflow-x-auto pb-2">
          {['Todos', 'Admin', 'Cliente', 'Activos', 'Inactivos'].map((filter, index) => <motion.button key={filter} whileHover={{
          scale: 1.05
        }} whileTap={{
          scale: 0.95
        }} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }} onClick={() => setSelectedFilter(filter)} className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${selectedFilter === filter ? 'bg-rose-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
                {filter}
              </motion.button>)}
        </motion.div>

        {/* Users Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <PremiumLoader />
          </div>
        ) : (
          <motion.div initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: 0.3
        }}>
            <DataTable 
              data={users} 
              columns={userColumns} 
              onEdit={handleEdit} 
              onDelete={handleDelete} 
              searchPlaceholder="Buscar usuarios por nombre o email..."
            />
          </motion.div>
        )}
      </div>
    </AdminLayout>;
}