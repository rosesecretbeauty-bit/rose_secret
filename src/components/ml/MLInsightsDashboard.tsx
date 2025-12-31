import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Target, Zap, Brain, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { mlEngine, PurchaseIntentPrediction, UserSegment } from '../../utils/mlPrediction';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CircularProgress } from '../ui/CircularProgress';
// ML Insights Dashboard - Shows real-time predictions and user segmentation
// Admin-facing component for monitoring ML predictions
export function MLInsightsDashboard() {
  const [intent, setIntent] = useState<PurchaseIntentPrediction | null>(null);
  const [segment, setSegment] = useState<UserSegment | null>(null);
  const [optimalDiscount, setOptimalDiscount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const updatePredictions = () => {
      try {
        const intentPrediction = mlEngine.predictPurchaseIntent();
        const userSegment = mlEngine.segmentUser();
        const discount = mlEngine.predictOptimalDiscount();
        setIntent(intentPrediction);
        setSegment(userSegment);
        setOptimalDiscount(discount);
        setIsLoading(false);
      } catch (error) {
        console.error('Error updating ML predictions:', error);
      }
    };
    updatePredictions();
    const interval = setInterval(updatePredictions, 30000); // Update every 30s
    return () => clearInterval(interval);
  }, []);
  if (isLoading || !intent || !segment) {
    return <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Analizando comportamiento...</p>
        </div>
      </div>;
  }
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return 'text-green-600 bg-green-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'very_high':
        return 'text-purple-600 bg-purple-100';
      case 'high':
        return 'text-blue-600 bg-blue-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };
  return <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">ML Insights</h2>
            <p className="text-sm text-gray-600">Predicciones en tiempo real</p>
          </div>
        </div>
        <Badge className={getConfidenceColor(intent.confidence)}>
          Confianza: {intent.confidence}
        </Badge>
      </div>

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Purchase Intent Score */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-rose-600" />
            </div>
            <CircularProgress value={intent.score} size={60} />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Intención de Compra</h3>
          <p className="text-sm text-gray-600">Score: {intent.score}/100</p>
        </Card>

        {/* User Segment */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <Badge className={getEngagementColor(segment.engagementLevel)}>
              {segment.engagementLevel}
            </Badge>
          </div>
          <h3 className="font-bold text-gray-900 mb-1">{segment.name}</h3>
          <p className="text-sm text-gray-600">Segmento actual</p>
        </Card>

        {/* Predicted LTV */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">
            ${segment.predictedLTV}
          </h3>
          <p className="text-sm text-gray-600">LTV Predicho</p>
        </Card>

        {/* Time to Conversion */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-purple-600" />
            </div>
            <Zap className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">
            {intent.timeToConversion} min
          </h3>
          <p className="text-sm text-gray-600">Tiempo estimado</p>
        </Card>
      </div>

      {/* Intent Factors */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-rose-600" />
          Factores de Intención
        </h3>
        <div className="space-y-3">
          {intent.factors.map((factor, index) => <motion.div key={index} initial={{
          opacity: 0,
          x: -20
        }} animate={{
          opacity: 1,
          x: 0
        }} transition={{
          delay: index * 0.05
        }} className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {factor.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {Math.round(factor.value)}%
                  </span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div className={`h-full ${factor.impact === 'positive' ? 'bg-green-500' : factor.impact === 'negative' ? 'bg-red-500' : 'bg-gray-400'}`} initial={{
                width: 0
              }} animate={{
                width: `${factor.value}%`
              }} transition={{
                duration: 0.5,
                delay: index * 0.05
              }} />
                </div>
              </div>
              <div className={`
                px-2 py-1 rounded text-xs font-semibold
                ${factor.impact === 'positive' ? 'bg-green-100 text-green-700' : factor.impact === 'negative' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'}
              `}>
                {factor.impact === 'positive' ? '↑' : factor.impact === 'negative' ? '↓' : '→'}
              </div>
            </motion.div>)}
        </div>
      </Card>

      {/* Suggested Actions */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-600" />
          Acciones Sugeridas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {intent.suggestedActions.map((action, index) => <motion.div key={index} initial={{
          opacity: 0,
          y: 10
        }} animate={{
          opacity: 1,
          y: 0
        }} transition={{
          delay: index * 0.1
        }} className="flex items-start gap-3 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
              <CheckCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-gray-700">
                {action}
              </span>
            </motion.div>)}
        </div>
      </Card>

      {/* User Segment Details */}
      <Card className="p-6">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Características del Segmento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {segment.characteristics.map((char, index) => <motion.div key={index} initial={{
          opacity: 0,
          scale: 0.9
        }} animate={{
          opacity: 1,
          scale: 1
        }} transition={{
          delay: index * 0.05
        }} className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm text-gray-700">{char}</span>
            </motion.div>)}
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Riesgo de Abandono</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className={`h-full ${segment.churnRisk > 70 ? 'bg-red-500' : segment.churnRisk > 40 ? 'bg-yellow-500' : 'bg-green-500'}`} style={{
                width: `${segment.churnRisk}%`
              }} />
              </div>
              <span className="text-sm font-bold text-gray-900">
                {segment.churnRisk}%
              </span>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Descuento Óptimo</p>
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-600" />
              <span className="text-2xl font-bold text-gray-900">
                {optimalDiscount}%
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Alert if high churn risk */}
      {segment.churnRisk > 70 && <motion.div initial={{
      opacity: 0,
      y: 20
    }} animate={{
      opacity: 1,
      y: 0
    }} className="p-4 bg-red-50 border-2 border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-red-900 mb-1">
              ⚠️ Alto Riesgo de Abandono
            </h4>
            <p className="text-sm text-red-700">
              Este usuario tiene alta probabilidad de abandonar. Considera
              activar una oferta urgente o chat proactivo.
            </p>
          </div>
        </motion.div>}
    </div>;
}