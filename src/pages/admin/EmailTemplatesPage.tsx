import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, Edit, Eye, ToggleLeft, ToggleRight, Save, X, Plus } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Badge } from '../../components/ui/Badge';
import { PermissionGuard } from '../../components/admin/PermissionGuard';
import { useToastStore } from '../../stores/toastStore';
import { api } from '../../api/client';
import { PremiumLoader } from '../../components/ui/PremiumLoader';

interface EmailTemplate {
  id: number;
  name: string;
  displayName: string;
  subject: string;
  bodyHtml: string;
  bodyText: string | null;
  variables: Record<string, string> | null;
  isActive: boolean;
  category: string;
  description: string | null;
}

export function EmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const addToast = useToastStore(state => state.addToast);

  const [formData, setFormData] = useState({
    name: '',
    displayName: '',
    subject: '',
    bodyHtml: '',
    bodyText: '',
    category: 'general',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/email-templates') as { success: boolean; data: EmailTemplate[] };
      if (response.success) {
        setTemplates(response.data);
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cargar plantillas'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      displayName: template.displayName,
      subject: template.subject,
      bodyHtml: template.bodyHtml,
      bodyText: template.bodyText || '',
      category: template.category,
      description: template.description || '',
      isActive: template.isActive
    });
    setIsModalOpen(true);
    setPreviewMode(false);
  };

  const handleCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      displayName: '',
      subject: '',
      bodyHtml: '',
      bodyText: '',
      category: 'general',
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
    setPreviewMode(false);
  };

  const handleSave = async () => {
    try {
      if (editingTemplate) {
        await api.put(`/email-templates/${editingTemplate.id}`, formData);
        addToast({
          type: 'success',
          message: 'Plantilla actualizada exitosamente'
        });
      } else {
        await api.post('/email-templates', formData);
        addToast({
          type: 'success',
          message: 'Plantilla creada exitosamente'
        });
      }
      setIsModalOpen(false);
      loadTemplates();
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al guardar plantilla'
      });
    }
  };

  const handleToggle = async (id: number, isActive: boolean) => {
    try {
      await api.patch(`/email-templates/${id}/toggle`, { isActive: !isActive });
      addToast({
        type: 'success',
        message: `Plantilla ${!isActive ? 'activada' : 'desactivada'} exitosamente`
      });
      loadTemplates();
    } catch (error: any) {
      addToast({
        type: 'error',
        message: error.message || 'Error al cambiar estado'
      });
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: 'bg-blue-100 text-blue-700',
      order: 'bg-green-100 text-green-700',
      notification: 'bg-purple-100 text-purple-700',
      general: 'bg-gray-100 text-gray-700'
    };
    return colors[category] || colors.general;
  };

  if (loading) {
    return (
      <AdminLayout>
        <PremiumLoader />
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <PermissionGuard module="settings" action="view" showError>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">
                Plantillas de Email
              </h1>
              <p className="text-gray-500 mt-1">
                Gestiona las plantillas de correo electrónico
              </p>
            </div>
            <Button onClick={handleCreate} leftIcon={<Plus className="h-4 w-4" />}>
              Nueva Plantilla
            </Button>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full flex flex-col">
                  <CardHeader className="border-b border-gray-50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-5 w-5 text-rose-600" />
                          <CardTitle className="text-lg">{template.displayName}</CardTitle>
                        </div>
                        <CardDescription className="text-sm">
                          {template.description || 'Sin descripción'}
                        </CardDescription>
                      </div>
                      <Badge className={getCategoryColor(template.category)}>
                        {template.category}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Asunto:</strong> {template.subject}
                      </p>
                      <p className="text-xs text-gray-500">
                        Nombre interno: <code className="bg-gray-100 px-1 rounded">{template.name}</code>
                      </p>
                    </div>

                    <div className="mt-auto flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(template)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(template.id, template.isActive)}
                        className={template.isActive ? 'text-green-600' : 'text-gray-400'}
                      >
                        {template.isActive ? (
                          <ToggleRight className="h-4 w-4" />
                        ) : (
                          <ToggleLeft className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Edit Modal */}
          {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
              >
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}
                  </h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPreviewMode(!previewMode)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      {previewMode ? 'Editar' : 'Vista Previa'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                  {previewMode ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Asunto:</h3>
                        <p>{formData.subject}</p>
                      </div>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold mb-2">Contenido HTML:</h3>
                        <div
                          className="prose max-w-none"
                          dangerouslySetInnerHTML={{ __html: formData.bodyHtml }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Nombre Interno"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          disabled={!!editingTemplate}
                          helperText="No se puede cambiar después de crear"
                        />
                        <Input
                          label="Nombre para Mostrar"
                          value={formData.displayName}
                          onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                        />
                      </div>

                      <Input
                        label="Categoría"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        helperText="auth, order, notification, general"
                      />

                      <Input
                        label="Asunto del Email"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="Puede usar variables {{variable}}"
                      />

                      <Textarea
                        label="Descripción"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={2}
                      />

                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Cuerpo HTML
                        </label>
                        <Textarea
                          value={formData.bodyHtml}
                          onChange={(e) => setFormData({ ...formData, bodyHtml: e.target.value })}
                          rows={15}
                          className="font-mono text-sm"
                          helperText="Usa {{variable}} para variables dinámicas. {{email_header}} y {{email_footer}} se insertan automáticamente."
                        />
                      </div>

                      <Textarea
                        label="Versión Texto Plano (Opcional)"
                        value={formData.bodyText}
                        onChange={(e) => setFormData({ ...formData, bodyText: e.target.value })}
                        rows={5}
                      />

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isActive"
                          checked={formData.isActive}
                          onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                          className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                        />
                        <label htmlFor="isActive" className="text-sm text-gray-700">
                          Plantilla activa
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleSave} leftIcon={<Save className="h-4 w-4" />}>
                    Guardar
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </AdminLayout>
  );
}

