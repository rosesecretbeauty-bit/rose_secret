// ============================================
// Insights API Client
// ============================================

import { api } from './client';

export interface SpendingInsights {
  total_spent: number;
  orders_count: number;
  avg_order_value: number;
  saved_amount: number;
  top_category: string | null;
  top_category_count: number;
  growth_percent: number;
  monthly_spending: {
    month: string;
    amount: number;
  }[];
}

/**
 * Obtener estadísticas de gasto del usuario
 */
export async function getSpendingInsights(months = 6): Promise<SpendingInsights> {
  const response = await api.get(`/user/insights?months=${months}`) as {
    success: boolean;
    data: SpendingInsights;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener estadísticas');
  }
  
  return response.data;
}

