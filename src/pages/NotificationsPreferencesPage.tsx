import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, ShoppingBag, Tag, Shield, Check } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { useToastStore } from '../stores/toastStore';
export function NotificationsPreferencesPage() {
  const addToast = useToastStore(state => state.addToast);
  const [loading, setLoading] = useState(false);
  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      addToast({
        type: 'success',
        message: 'Preferences saved successfully'
      });
    }, 1000);
  };
  const sections = [{
    title: 'Order Updates',
    icon: ShoppingBag,
    description: 'Get notified about your order status and delivery.',
    items: [{
      id: 'order_conf',
      label: 'Order Confirmation',
      email: true,
      sms: true,
      push: true
    }, {
      id: 'shipping',
      label: 'Shipping Updates',
      email: true,
      sms: true,
      push: true
    }, {
      id: 'delivery',
      label: 'Delivery Status',
      email: true,
      sms: true,
      push: true
    }]
  }, {
    title: 'Marketing & Offers',
    icon: Tag,
    description: 'Be the first to know about sales and exclusive offers.',
    items: [{
      id: 'newsletter',
      label: 'Weekly Newsletter',
      email: true,
      sms: false,
      push: false
    }, {
      id: 'sales',
      label: 'Sales & Promotions',
      email: true,
      sms: true,
      push: true
    }, {
      id: 'exclusive',
      label: 'Exclusive Offers',
      email: true,
      sms: false,
      push: true
    }]
  }, {
    title: 'Account Security',
    icon: Shield,
    description: 'Keep your account safe and secure.',
    items: [{
      id: 'login',
      label: 'New Login Alert',
      email: true,
      sms: false,
      push: true
    }, {
      id: 'password',
      label: 'Password Changes',
      email: true,
      sms: true,
      push: false
    }]
  }];
  return <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900 mb-2">
            Notification Preferences
          </h1>
          <p className="text-gray-600">
            Manage how and when you want to be notified.
          </p>
        </div>

        <div className="space-y-6">
          {sections.map(section => <Card key={section.title}>
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-rose-50 rounded-lg text-rose-600">
                    <section.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Header Row */}
                  <div className="grid grid-cols-12 gap-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 pb-2">
                    <div className="col-span-6">Notification Type</div>
                    <div className="col-span-2 text-center">Email</div>
                    <div className="col-span-2 text-center">SMS</div>
                    <div className="col-span-2 text-center">Push</div>
                  </div>

                  {/* Items */}
                  {section.items.map(item => <div key={item.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-6 font-medium text-gray-900">
                        {item.label}
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input type="checkbox" defaultChecked={item.email} className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5" />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input type="checkbox" defaultChecked={item.sms} className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5" />
                      </div>
                      <div className="col-span-2 flex justify-center">
                        <input type="checkbox" defaultChecked={item.push} className="rounded text-rose-600 focus:ring-rose-500 h-5 w-5" />
                      </div>
                    </div>)}
                </div>
              </CardContent>
            </Card>)}

          <div className="flex justify-end pt-6">
            <Button size="lg" onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      </div>
    </div>;
}