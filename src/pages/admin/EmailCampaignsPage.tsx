import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Send, Calendar, Layout, Users, BarChart2, Edit3, Trash2, Eye, CheckCircle } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '../../components/ui/Button';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
export function EmailCampaignsPage() {
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState(1);
  const campaigns = [{
    id: 1,
    name: 'Summer Sale Announcement',
    status: 'Sent',
    sentDate: '2024-06-01',
    segment: 'All Customers',
    openRate: '45%',
    clickRate: '12%'
  }, {
    id: 2,
    name: 'VIP Exclusive Access',
    status: 'Scheduled',
    sentDate: '2024-06-15',
    segment: 'VIP Customers',
    openRate: '-',
    clickRate: '-'
  }, {
    id: 3,
    name: 'Abandoned Cart Recovery',
    status: 'Active',
    sentDate: 'Automated',
    segment: 'Cart Abandoners',
    openRate: '62%',
    clickRate: '18%'
  }, {
    id: 4,
    name: 'New Collection Teaser',
    status: 'Draft',
    sentDate: '-',
    segment: 'Newsletter Subs',
    openRate: '-',
    clickRate: '-'
  }];
  const renderWizard = () => <div className="max-w-4xl mx-auto">
      {/* Steps Indicator */}
      <div className="flex justify-between items-center mb-8 relative">
        <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-200 -z-10" />
        {['Template', 'Segment', 'Content', 'Schedule'].map((label, idx) => <div key={label} className={`flex flex-col items-center gap-2 bg-white px-2 ${step > idx + 1 ? 'text-rose-600' : step === idx + 1 ? 'text-rose-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${step > idx + 1 ? 'bg-rose-600 border-rose-600 text-white' : step === idx + 1 ? 'border-rose-600 text-rose-600 bg-white' : 'border-gray-300 bg-white'}`}>
              {step > idx + 1 ? <CheckCircle className="h-5 w-5" /> : idx + 1}
            </div>
            <span className="text-xs font-medium">{label}</span>
          </div>)}
      </div>

      <Card>
        <CardContent className="p-8">
          {step === 1 && <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Choose a Template</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Newsletter', 'Sale Announcement', 'Product Launch', 'Welcome Series', 'Simple Text'].map(template => <div key={template} className="border border-gray-200 rounded-xl p-4 hover:border-rose-500 hover:bg-rose-50 cursor-pointer transition-all text-center group">
                    <div className="h-32 bg-gray-100 rounded-lg mb-4 group-hover:bg-white transition-colors flex items-center justify-center">
                      <Layout className="h-8 w-8 text-gray-400 group-hover:text-rose-500" />
                    </div>
                    <p className="font-medium text-gray-900">{template}</p>
                  </div>)}
              </div>
            </div>}

          {step === 2 && <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Select Audience</h2>
              <div className="space-y-4">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="segment" className="text-rose-600 focus:ring-rose-500" defaultChecked />
                  <div>
                    <p className="font-bold text-gray-900">All Customers</p>
                    <p className="text-sm text-gray-500">
                      Send to entire database (1,240 contacts)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="segment" className="text-rose-600 focus:ring-rose-500" />
                  <div>
                    <p className="font-bold text-gray-900">VIP Customers</p>
                    <p className="text-sm text-gray-500">
                      High value customers only (124 contacts)
                    </p>
                  </div>
                </label>
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50">
                  <input type="radio" name="segment" className="text-rose-600 focus:ring-rose-500" />
                  <div>
                    <p className="font-bold text-gray-900">New Subscribers</p>
                    <p className="text-sm text-gray-500">
                      Joined in last 30 days (85 contacts)
                    </p>
                  </div>
                </label>
              </div>
            </div>}

          {step === 3 && <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Edit Content</h2>
              <div className="space-y-4">
                <Input label="Subject Line" placeholder="e.g., Don't miss out on our Summer Sale!" />
                <Input label="Preheader Text" placeholder="e.g., Up to 50% off select items..." />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Content
                  </label>
                  <textarea className="w-full h-64 rounded-lg border-gray-300 focus:ring-rose-500 focus:border-rose-500 font-mono text-sm p-4" placeholder="<h1>Hello {name},</h1>..." defaultValue="<h1>Welcome to Rose Secret</h1><p>We are delighted to have you...</p>" />
                </div>
              </div>
            </div>}

          {step === 4 && <div className="space-y-6">
              <h2 className="text-xl font-bold mb-4">Review & Schedule</h2>
              <div className="bg-gray-50 p-6 rounded-xl space-y-4">
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Campaign Name</span>
                  <span className="font-medium">Summer Sale 2024</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Audience</span>
                  <span className="font-medium">All Customers (1,240)</span>
                </div>
                <div className="flex justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-500">Subject</span>
                  <span className="font-medium">
                    Don't miss out on our Summer Sale!
                  </span>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Date
                  </label>
                  <input type="date" className="w-full rounded-lg border-gray-300" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Send Time
                  </label>
                  <input type="time" className="w-full rounded-lg border-gray-300" />
                </div>
              </div>
            </div>}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            <Button variant="outline" onClick={() => step > 1 ? setStep(step - 1) : setIsCreating(false)}>
              {step === 1 ? 'Cancel' : 'Back'}
            </Button>
            <Button onClick={() => step < 4 ? setStep(step + 1) : setIsCreating(false)}>
              {step === 4 ? 'Schedule Campaign' : 'Next Step'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
  return <AdminLayout>
      <div className="space-y-8">
        {!isCreating && <>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
                  Email Campaigns
                </h1>
                <p className="text-gray-500">
                  Manage your email marketing and newsletters
                </p>
              </div>
              <Button onClick={() => setIsCreating(true)}>
                <Mail className="mr-2 h-4 w-4" /> Create Campaign
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">
                    Total Subscribers
                  </p>
                  <p className="text-2xl font-bold">1,240</p>
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +12% this month
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Avg. Open Rate</p>
                  <p className="text-2xl font-bold">42.5%</p>
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +2.1% vs last month
                  </span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">Avg. Click Rate</p>
                  <p className="text-2xl font-bold">15.8%</p>
                  <span className="text-xs text-gray-500 mt-1">Stable</span>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-500 mb-1">
                    Revenue Generated
                  </p>
                  <p className="text-2xl font-bold">$12,450</p>
                  <span className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-3 w-3 mr-1" /> +8.5% this month
                  </span>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardContent className="p-0">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-6 py-4">Campaign Name</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Segment</th>
                      <th className="px-6 py-4">Sent Date</th>
                      <th className="px-6 py-4">Performance</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map(campaign => <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {campaign.name}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={campaign.status === 'Sent' ? 'success' : campaign.status === 'Scheduled' ? 'primary' : campaign.status === 'Active' ? 'secondary' : 'outline'}>
                            {campaign.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {campaign.segment}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {campaign.sentDate}
                        </td>
                        <td className="px-6 py-4">
                          {campaign.status === 'Sent' || campaign.status === 'Active' ? <div className="flex gap-4 text-xs">
                              <div>
                                <span className="text-gray-500 block">
                                  Open
                                </span>
                                <span className="font-bold">
                                  {campaign.openRate}
                                </span>
                              </div>
                              <div>
                                <span className="text-gray-500 block">
                                  Click
                                </span>
                                <span className="font-bold">
                                  {campaign.clickRate}
                                </span>
                              </div>
                            </div> : <span className="text-xs text-gray-400">-</span>}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-gray-500">
                              <Edit3 className="h-4 w-4" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 rounded text-red-500">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>)}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </>}

        {isCreating && renderWizard()}
      </div>
    </AdminLayout>;
}