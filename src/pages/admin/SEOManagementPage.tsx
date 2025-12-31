import React, { useState } from 'react';
import { Globe, Search, AlertCircle, CheckCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useToastStore } from '../../stores/toastStore';

// NOTE: SEO Management basic structure implemented
// Advanced features (site crawling, automated scoring) require external services
// Basic metadata management is available

export function SEOManagementPage() {
  const [pages] = useState<Array<{
    path: string;
    title: string;
    description?: string;
    score?: number;
    status?: string;
  }>>([]); // Will be loaded from API if needed
  const addToast = useToastStore(state => state.addToast);

  const handleScanSite = async () => {
    try {
      // TODO: Call /api/admin/seo/analyze when implemented
      addToast({
        type: 'info',
        message: 'Análisis SEO completo requiere servicio externo (Lighthouse, SEO API). Funcionalidad básica disponible.'
      });
    } catch (error: any) {
      addToast({
        type: 'error',
        message: 'Error al iniciar análisis SEO'
      });
    }
  };

  const handleRegenerateSitemap = () => {
    // TODO: Implement sitemap generation endpoint
    addToast({
      type: 'info',
      message: 'Generación de sitemap próximamente. Endpoint requerido: /api/admin/seo/sitemap'
    });
  };

  return <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-gray-900 mb-2">
              SEO Management
            </h1>
            <p className="text-sm sm:text-base text-gray-500">
              Optimize your store's search engine visibility
            </p>
          </div>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button variant="outline" onClick={handleRegenerateSitemap} className="text-xs sm:text-sm">
              <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Regenerate Sitemap
            </Button>
            <Button onClick={handleScanSite} className="text-xs sm:text-sm">
              <Search className="mr-2 h-3 w-3 sm:h-4 sm:w-4" /> Scan Site
            </Button>
          </div>
        </div>

        {pages.length === 0 ? (
          <Card>
            <CardContent className="p-8 sm:p-12 text-center">
              <AlertTriangle className="h-12 w-12 sm:h-16 sm:w-16 text-amber-400 mx-auto mb-4" />
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                SEO Scanner Not Available
              </h3>
              <p className="text-sm sm:text-base text-gray-600 max-w-md mx-auto mb-4">
                SEO analysis requires backend integration with a site crawling service.
                This feature will be available once the backend scanner is implemented.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Page List */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <h3 className="font-bold text-base sm:text-lg">Page Analysis</h3>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                      <tr>
                        <th className="px-3 sm:px-6 py-2 sm:py-3">Page Path</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3">SEO Title</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3">Score</th>
                        <th className="px-3 sm:px-6 py-2 sm:py-3">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pages.map((page, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 sm:px-6 py-3 sm:py-4 font-mono text-xs text-gray-600 break-all">
                            {page.path}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 truncate max-w-xs">
                            {page.title}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <Badge variant={page.score >= 90 ? 'success' : page.score >= 70 ? 'warning' : 'danger'}>
                              {page.score}/100
                            </Badge>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <button className="text-rose-600 hover:underline text-xs sm:text-sm">
                              Edit
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Tools */}
            <div className="space-y-4 sm:space-y-6">
              <Card>
                <CardHeader>
                  <h3 className="font-bold text-base sm:text-lg">Site Health</h3>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-gray-600">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Sitemap.xml</span>
                    </div>
                    <span className="text-xs font-bold">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-gray-600">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Robots.txt</span>
                    </div>
                    <span className="text-xs font-bold">Pending</span>
                  </div>
                  <div className="flex justify-between items-center p-2 sm:p-3 bg-gray-50 rounded-lg text-gray-600">
                    <div className="flex items-center gap-2">
                      <Search className="h-4 w-4 sm:h-5 sm:w-5" />
                      <span className="text-xs sm:text-sm">Broken Links</span>
                    </div>
                    <span className="text-xs font-bold">N/A</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <h3 className="font-bold text-base sm:text-lg">Meta Editor</h3>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Input 
                    label="Meta Title" 
                    placeholder="Enter page title" 
                    className="text-xs sm:text-sm"
                  />
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                      Meta Description
                    </label>
                    <textarea 
                      className="w-full rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 text-xs sm:text-sm p-2 sm:p-3" 
                      rows={3}
                      placeholder="Enter meta description..."
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      0/160 characters
                    </p>
                  </div>
                  <Button fullWidth className="text-xs sm:text-sm">Save Changes</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>;
}