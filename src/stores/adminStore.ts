import { create } from 'zustand';
import { Product } from '../types';
interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total: number;
  items: number;
}
interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueGrowth: number;
  ordersGrowth: number;
}
interface AdminStore {
  products: Product[];
  orders: Order[];
  stats: AdminStats;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

export const useAdminStore = create<AdminStore>(set => ({
  products: [],
  orders: [],
  stats: {
    totalRevenue: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    revenueGrowth: 0,
    ordersGrowth: 0
  },
  selectedProduct: null,
  setSelectedProduct: product => set({
    selectedProduct: product
  }),
  updateProduct: (id, updates) => {
    set(state => ({
      products: state.products.map(p => p.id === id ? {
        ...p,
        ...updates
      } : p)
    }));
  },
  deleteProduct: id => {
    set(state => ({
      products: state.products.filter(p => p.id !== id)
    }));
  },
  updateOrderStatus: (orderId, status) => {
    set(state => ({
      orders: state.orders.map(o => o.id === orderId ? {
        ...o,
        status
      } : o)
    }));
  }
}));