// ============================================
// Profile API Client
// ============================================

import { api } from './client';

export interface ProfileRecommendation {
  field: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  actionPath: string;
}

export interface ProfileCompletion {
  percentage: number;
  completed_fields: number;
  total_fields: number;
  missing_fields: string[];
  points_reward: number;
  recommendations?: ProfileRecommendation[];
}

export interface UserSettings {
  email_notifications: boolean;
  sms_notifications: boolean;
  marketing_emails: boolean;
  language: string;
  currency: string;
  timezone: string | null;
  preferences: Record<string, any>;
}

/**
 * Obtener porcentaje de completitud del perfil
 */
export async function getProfileCompletion(): Promise<ProfileCompletion> {
  const response = await api.get('/user/profile-completion') as {
    success: boolean;
    data: ProfileCompletion;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener completitud del perfil');
  }
  
  return response.data;
}

/**
 * Obtener configuración del usuario
 */
export async function getSettings(): Promise<UserSettings> {
  const response = await api.get('/user/settings') as {
    success: boolean;
    data: UserSettings;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener configuración');
  }
  
  return response.data;
}

/**
 * Actualizar configuración del usuario
 */
export async function updateSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
  const response = await api.put('/user/settings', settings) as {
    success: boolean;
    data: UserSettings;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al actualizar configuración');
  }
  
  return response.data;
}

/**
 * Actualizar perfil del usuario
 */
export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  phone?: string | null;
  bio?: string | null;
  location?: string | null;
  avatar?: string | null;
}

export interface UserProfile {
  id: number;
  email: string;
  name: string;
  phone: string | null;
  bio: string | null;
  location: string | null;
  avatar: string | null;
  email_verified: boolean;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
  role: string;
}

export async function updateProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  const response = await api.put('/user/profile', payload) as {
    success: boolean;
    data: {
      user: UserProfile;
    };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al actualizar perfil');
  }
  
  return response.data.user;
}

/**
 * Enviar email de verificación
 */
export async function sendEmailVerification(): Promise<void> {
  const response = await api.post('/user/send-email-verification') as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al enviar email de verificación');
  }
}

/**
 * Verificar email con token
 */
export async function verifyEmail(token: string): Promise<void> {
  const response = await api.post('/user/verify-email', { token }) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al verificar email');
  }
}

/**
 * Cambiar contraseña (requiere código de verificación)
 */
export interface ChangePasswordPayload {
  verification_code: string;
  verification_method: 'email' | 'phone';
  new_password: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  const response = await api.put('/user/change-password', payload) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al cambiar contraseña');
  }
}

/**
 * Solicitar código de recuperación por email
 */
export async function requestPasswordRecoveryByEmail(email: string): Promise<void> {
  const response = await api.post('/password-recovery/request-email', { email }) as {
    success: boolean;
    message: string;
    requires_verification?: boolean;
  };
  
  if (!response.success) {
    if (response.requires_verification) {
      throw new Error('Tu correo electrónico no está verificado. Por favor verifica tu correo primero.');
    }
    throw new Error(response.message || 'Error al solicitar recuperación');
  }
}

/**
 * Solicitar código de recuperación por teléfono
 */
export async function requestPasswordRecoveryByPhone(email: string, phone: string): Promise<void> {
  const response = await api.post('/password-recovery/request-phone', { email, phone }) as {
    success: boolean;
    message: string;
    requires_verification?: boolean;
  };
  
  if (!response.success) {
    if (response.requires_verification) {
      throw new Error('Tu teléfono no está verificado. Por favor verifica tu teléfono primero.');
    }
    throw new Error(response.message || 'Error al solicitar recuperación');
  }
}

/**
 * Verificar código de recuperación
 */
export interface VerifyRecoveryCodePayload {
  email: string;
  code: string;
}

export interface VerifyRecoveryCodeResponse {
  reset_token: string;
}

export async function verifyRecoveryCode(payload: VerifyRecoveryCodePayload): Promise<VerifyRecoveryCodeResponse> {
  const response = await api.post('/password-recovery/verify-code', payload) as {
    success: boolean;
    message: string;
    reset_token: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al verificar código');
  }
  
  return {
    reset_token: response.reset_token
  };
}

/**
 * Resetear contraseña con token
 */
export interface ResetPasswordPayload {
  reset_token: string;
  new_password: string;
}

export async function resetPassword(payload: ResetPasswordPayload): Promise<void> {
  const response = await api.post('/password-recovery/reset', payload) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al restablecer contraseña');
  }
}

/**
 * Solicitar código de verificación para cambio de contraseña (usuario autenticado)
 */
export async function requestVerificationCodeForPasswordChange(method: 'email' | 'phone'): Promise<void> {
  if (method === 'email') {
    // Usar el endpoint existente de reenvío de verificación
    return await sendEmailVerification();
  } else {
    // Usar el endpoint existente de verificación de teléfono
    // Necesitamos el teléfono del usuario, pero esto se manejará en el componente
    throw new Error('Para verificación por teléfono, usa sendPhoneVerification con el número de teléfono');
  }
}

/**
 * Historial de actividad del usuario
 */
export interface Activity {
  id: number;
  action: string;
  message: string;
  entity: string;
  entity_id: number | null;
  ip: string | null;
  created_at: string;
  timestamp: string;
}

export interface ActivityHistory {
  activities: Activity[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export async function getActivityHistory(limit = 50, offset = 0): Promise<ActivityHistory> {
  const response = await api.get(`/user/activity-history?limit=${limit}&offset=${offset}`) as {
    success: boolean;
    data: ActivityHistory;
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener historial de actividad');
  }
  
  return response.data;
}

/**
 * Enviar código OTP al teléfono
 */
export async function sendPhoneVerification(phone: string): Promise<{ debug_code?: string }> {
  const response = await api.post('/user/send-phone-verification', { phone }) as {
    success: boolean;
    message: string;
    debug_code?: string; // Solo en desarrollo
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al enviar código de verificación');
  }
  
  // En desarrollo, loguear el código para pruebas
  if (response.debug_code) {
    console.log('📱 Código OTP (solo desarrollo):', response.debug_code);
  }
  
  // Retornar respuesta con debug_code si existe
  return {
    debug_code: response.debug_code
  };
}

/**
 * Verificar código OTP del teléfono
 */
export interface VerifyPhonePayload {
  phone: string;
  code: string;
}

export async function verifyPhone(payload: VerifyPhonePayload): Promise<void> {
  const response = await api.post('/user/verify-phone', payload) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al verificar teléfono');
  }
}

/**
 * 2FA - Activar autenticación de dos factores
 */
export interface Enable2FAResponse {
  secret: string;
  qrCodeUrl: string;
  manualEntryKey: string;
}

export async function enable2FA(): Promise<Enable2FAResponse> {
  const response = await api.post('/user/enable-2fa') as {
    success: boolean;
    message: string;
    data: Enable2FAResponse;
  };
  
  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error al activar 2FA');
  }
  
  return response.data;
}

/**
 * Verificar código 2FA durante configuración
 */
export async function verify2FASetup(code: string): Promise<void> {
  const response = await api.post('/user/verify-2fa-setup', { code }) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al verificar código 2FA');
  }
}

/**
 * Desactivar 2FA
 */
export async function disable2FA(password: string): Promise<void> {
  const response = await api.post('/user/disable-2fa', { password }) as {
    success: boolean;
    message: string;
  };
  
  if (!response.success) {
    throw new Error(response.message || 'Error al desactivar 2FA');
  }
}

/**
 * Obtener estado de 2FA
 */
export async function get2FAStatus(): Promise<{ enabled: boolean }> {
  const response = await api.get('/user/2fa-status') as {
    success: boolean;
    data: { enabled: boolean };
  };
  
  if (!response.success || !response.data) {
    throw new Error('Error al obtener estado de 2FA');
  }
  
  return response.data;
}

