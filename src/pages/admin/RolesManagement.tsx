import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, Plus, Edit2, Trash2, Users } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { usePermissionsStore } from '../../stores/permissionsStore';
export function RolesManagement() {
  const {
    roles
  } = usePermissionsStore();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const modules = ['products', 'orders', 'users', 'categories', 'promotions', 'inventory', 'coupons', 'settings', 'analytics', 'logs'];
  const actions = ['view', 'create', 'edit', 'delete'];
  return <AdminLayout>
      <PermissionGuard module="settings" action="view" showError>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Gestión de Roles
              </h1>
              <p className="text-gray-500 mt-1">
                Administra roles y permisos del sistema
              </p>
            </div>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Crear Rol</Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {roles.map((role, index) => <motion.div key={role.id} initial={{
            opacity: 0,
            y: 20
          }} animate={{
            opacity: 1,
            y: 0
          }} transition={{
            delay: index * 0.1
          }}>
                <Card hover className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 bg-rose-100 rounded-lg">
                      <Shield className="h-6 w-6 text-rose-600" />
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <Edit2 className="h-4 w-4 text-gray-600" />
                      </button>
                      {role.id !== 'admin' && <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </button>}
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {role.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {role.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Users className="h-4 w-4" />
                    <span>3 usuarios</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-gray-500 uppercase">
                      Permisos
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {role.permissions.slice(0, 3).map(perm => <Badge key={perm.module} variant="secondary" className="text-xs">
                          {perm.module}
                        </Badge>)}
                      {role.permissions.length > 3 && <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} más
                        </Badge>}
                    </div>
                  </div>

                  <Button variant="outline" size="sm" fullWidth className="mt-4" onClick={() => setSelectedRole(role.id)}>
                    Ver Detalles
                  </Button>
                </Card>
              </motion.div>)}
          </div>

          {/* Permission Matrix */}
          {selectedRole && <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                Matriz de Permisos -{' '}
                {roles.find(r => r.id === selectedRole)?.name}
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">
                        Módulo
                      </th>
                      {actions.map(action => <th key={action} className="text-center py-3 px-4 font-semibold text-gray-700 capitalize">
                          {action}
                        </th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {modules.map(module => {
                  const rolePermissions = roles.find(r => r.id === selectedRole)?.permissions.find(p => p.module === module);
                  return <tr key={module} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900 capitalize">
                            {module}
                          </td>
                          {actions.map(action => <td key={action} className="text-center py-3 px-4">
                              <input type="checkbox" checked={rolePermissions?.actions.includes(action as any) || false} className="h-4 w-4 text-rose-600 rounded border-gray-300 focus:ring-rose-500" readOnly />
                            </td>)}
                        </tr>;
                })}
                  </tbody>
                </table>
              </div>
            </Card>}
        </div>
      </PermissionGuard>
    </AdminLayout>;
}