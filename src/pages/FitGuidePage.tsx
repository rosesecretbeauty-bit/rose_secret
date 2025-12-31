import React from 'react';
import { Ruler, Info } from 'lucide-react';
import { GlassCard } from '../components/ui/GlassCard';
export function FitGuidePage() {
  return <div className="bg-gray-50 min-h-screen py-16">
      <div className="container-custom max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="font-serif text-4xl font-bold mb-4">
            Size & Fit Guide
          </h1>
          <p className="text-gray-600">
            Find your perfect fit for our clothing and accessories collection.
          </p>
        </div>

        <GlassCard className="p-8 mb-8">
          <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
            <Ruler className="h-6 w-6 text-rose-600" />
            Clothing Size Chart
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                  <th className="px-6 py-3">Size</th>
                  <th className="px-6 py-3">Bust (cm)</th>
                  <th className="px-6 py-3">Waist (cm)</th>
                  <th className="px-6 py-3">Hips (cm)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">XS</td>
                  <td className="px-6 py-4">80-84</td>
                  <td className="px-6 py-4">60-64</td>
                  <td className="px-6 py-4">86-90</td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">S</td>
                  <td className="px-6 py-4">84-88</td>
                  <td className="px-6 py-4">64-68</td>
                  <td className="px-6 py-4">90-94</td>
                </tr>
                <tr className="bg-white border-b">
                  <td className="px-6 py-4 font-medium text-gray-900">M</td>
                  <td className="px-6 py-4">88-92</td>
                  <td className="px-6 py-4">68-72</td>
                  <td className="px-6 py-4">94-98</td>
                </tr>
                <tr className="bg-white">
                  <td className="px-6 py-4 font-medium text-gray-900">L</td>
                  <td className="px-6 py-4">92-96</td>
                  <td className="px-6 py-4">72-76</td>
                  <td className="px-6 py-4">98-102</td>
                </tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-8">
          <h2 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
            <Info className="h-6 w-6 text-rose-600" />
            How to Measure
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h3 className="font-bold text-gray-900">Bust</h3>
                <p className="text-gray-600 text-sm">
                  Measure around the fullest part of your chest, keeping the
                  tape horizontal.
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Waist</h3>
                <p className="text-gray-600 text-sm">
                  Measure around the narrowest part (typically your natural
                  waistline).
                </p>
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Hips</h3>
                <p className="text-gray-600 text-sm">
                  Measure around the fullest part of your hips.
                </p>
              </div>
            </div>
            <div className="bg-gray-100 rounded-xl h-64 flex items-center justify-center text-gray-400">
              [Illustration Placeholder]
            </div>
          </div>
        </GlassCard>
      </div>
    </div>;
}