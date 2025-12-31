// src/api/admin.ts
// API functions for admin endpoints

import { api } from './client';

// ============================================
// Users Management
// ============================================

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  orders: number;
  spent: number;
  joined: string;
}

export interface AdminUsersResponse {
  success: boolean;
  data?: {
    users: AdminUser[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export async function getAdminUsers(filters?: {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
}): Promise<AdminUsersResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.search) params.append('search', filters.search);
  if (filters?.role) params.append('role', filters.role);
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString();
  const endpoint = `/admin/users${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<AdminUsersResponse>;
}

// ============================================
// Dashboard Stats
// ============================================

export interface DashboardStats {
  orders: {
    today: {
      count: number;
      revenue: number;
    };
    month: {
      count: number;
      revenue: number;
    };
    total: {
      revenue: number;
    };
    byStatus: Array<{
      status: string;
      count: number;
    }>;
  };
  users: {
    newToday: number;
    newMonth: number;
  };
  coupons: {
    usedToday: number;
  };
  topProducts: Array<{
    id: number;
    name: string;
    price: number;
    totalSold: number;
    revenue: number;
  }>;
}

export interface DashboardStatsResponse {
  success: boolean;
  data?: DashboardStats;
  message?: string;
}

export async function getDashboardStats(): Promise<DashboardStatsResponse> {
  return api.get('/admin/dashboard/stats') as Promise<DashboardStatsResponse>;
}

// ============================================
// Audit Logs
// ============================================

export interface AuditLog {
  id: number;
  user: {
    name: string;
    email: string | null;
  } | null;
  action: string;
  entity: string;
  entity_id: number | null;
  old_value: any;
  new_value: any;
  metadata: any;
  ip: string;
  created_at: string;
}

export interface AuditLogsResponse {
  success: boolean;
  data?: {
    logs: AuditLog[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export async function getAuditLogs(filters?: {
  page?: number;
  limit?: number;
  user_id?: number;
  action?: string;
  entity?: string;
  start_date?: string;
  end_date?: string;
}): Promise<AuditLogsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.user_id) params.append('user_id', filters.user_id.toString());
  if (filters?.action) params.append('action', filters.action);
  if (filters?.entity) params.append('entity', filters.entity);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  
  const query = params.toString();
  const endpoint = `/admin/audit-logs${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<AuditLogsResponse>;
}

// ============================================
// Abandoned Carts
// ============================================

export interface AbandonedCart {
  id: string;
  cart_id: number;
  customer: string;
  email: string;
  items: number;
  total: number;
  abandonedAt: string;
  status: 'Pending' | 'Recovered' | 'Lost';
  recoverySent: boolean;
}

export interface AbandonedCartsResponse {
  success: boolean;
  data?: {
    carts: AbandonedCart[];
    stats: {
      total: number;
      recoverable: number;
      recoveryRate: string;
    };
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export async function getAbandonedCarts(filters?: {
  page?: number;
  limit?: number;
  recovered?: boolean;
}): Promise<AbandonedCartsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.recovered !== undefined) params.append('recovered', filters.recovered.toString());
  
  const query = params.toString();
  const endpoint = `/admin/abandoned-carts${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<AbandonedCartsResponse>;
}

// ============================================
// Coupons
// ============================================

export interface Coupon {
  id: number;
  code: string;
  type: 'percentage' | 'fixed' | 'shipping';
  value: number;
  usage: number;
  limit: number | null;
  status: 'active' | 'expired';
  expiry: string | null;
}

export interface CouponsResponse {
  success: boolean;
  data?: {
    coupons: Coupon[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
  message?: string;
}

export async function getCoupons(filters?: {
  page?: number;
  limit?: number;
  status?: 'active' | 'expired';
}): Promise<CouponsResponse> {
  const params = new URLSearchParams();
  
  if (filters?.page) params.append('page', filters.page.toString());
  if (filters?.limit) params.append('limit', filters.limit.toString());
  if (filters?.status) params.append('status', filters.status);
  
  const query = params.toString();
  const endpoint = `/admin/coupons${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<CouponsResponse>;
}

// ============================================
// Customer Segments
// ============================================

export interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  revenue: number;
  growth: number;
  color: string;
  description: string;
}

export interface CustomerSegmentCustomer {
  id: number;
  name: string;
  email: string;
  spent: number;
  orders: number;
  lastOrder: string;
  segment: string;
}

export interface CustomerSegmentsResponse {
  success: boolean;
  data?: {
    segments: CustomerSegment[];
    customers: CustomerSegmentCustomer[];
  };
  message?: string;
}

export async function getCustomerSegments(segmentId?: string): Promise<CustomerSegmentsResponse> {
  const params = new URLSearchParams();
  if (segmentId) params.append('segment', segmentId);
  
  const query = params.toString();
  const endpoint = `/admin/customer-segments${query ? `?${query}` : ''}`;
  
  return api.get(endpoint) as Promise<CustomerSegmentsResponse>;
}

