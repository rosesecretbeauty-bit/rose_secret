import React from 'react';
import { motion } from 'framer-motion';
import { FileEdit, Eye, Save } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
export function ContentManagement() {
  const pages = [{
    id: 1,
    name: 'Sobre Nosotros',
    slug: 'about',
    lastEdited: '2024-01-15'
  }, {
    id: 2,
    name: 'Términos y Condiciones',
    slug: 'terms',
    lastEdited: '2024-01-10'
  }, {
    id: 3,
    name: 'Política de Privacidad',
    slug: 'privacy',
    lastEdited: '2024-01-10'
  }, {
    id: 4,
    name: 'Preguntas Frecuentes',
    slug: 'faq',
    lastEdited: '2024-01-20'
  }];
  return <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-serif font-bold text-gray-900">
            Gestión de Contenido
          </h1>
          <p className="text-gray-500 mt-1">
            Edita las páginas estáticas del sitio web
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {pages.map((page, index) => <motion.div key={page.id} initial={{
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
                    <FileEdit className="h-6 w-6 text-rose-600" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {page.name}
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  Última edición: {page.lastEdited}
                </p>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" fullWidth leftIcon={<Eye className="h-4 w-4" />}>
                    Vista Previa
                  </Button>
                  <Button size="sm" fullWidth leftIcon={<FileEdit className="h-4 w-4" />}>
                    Editar
                  </Button>
                </div>
              </Card>
            </motion.div>)}
        </div>
      </div>
    </AdminLayout>;
}