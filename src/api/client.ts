// src/api/client.ts

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Cliente API para comunicarse con el backend
 */
export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  
  // Inicializar headers como objeto plano
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Agregar headers de options si existen
  if (options.headers) {
    try {
      if (options.headers instanceof Headers) {
        options.headers.forEach((value, key) => {
          headers[key] = value;
        });
      } else if (Array.isArray(options.headers)) {
        options.headers.forEach(([key, value]) => {
          if (key && value) {
            headers[key] = value;
          }
        });
      } else if (typeof options.headers === 'object') {
        // Es un objeto plano
        Object.keys(options.headers).forEach(key => {
          const value = (options.headers as Record<string, string>)[key];
          if (value) {
            headers[key] = value;
          }
        });
      }
    } catch (error) {
      console.warn('Error procesando headers:', error);
    }
  }
  
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  
  // Construir config sin sobrescribir headers
  const config: RequestInit = {
    method: options.method || 'GET',
    headers,
  };
  
  // Agregar otras opciones excepto headers y body (ya manejados)
  if (options.cache) config.cache = options.cache;
  if (options.credentials) config.credentials = options.credentials;
  if (options.mode) config.mode = options.mode;
  if (options.redirect) config.redirect = options.redirect;
  if (options.referrer) config.referrer = options.referrer;
  if (options.signal) config.signal = options.signal;
  
  // Manejar body
  if (options.body) {
    if (typeof options.body === 'object' && !(options.body instanceof FormData)) {
      config.body = JSON.stringify(options.body);
    } else {
      config.body = options.body;
    }
  }
  
  try {
    // Verificar que la URL esté bien formada
    const url = `${API_URL}${endpoint}`;
    if (!url.startsWith('http')) {
      throw new Error(`URL inválida: ${url}`);
    }
    
    const response = await fetch(url, config);
    
    // Verificar que la respuesta sea JSON válida
    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      throw new Error(`Respuesta no es JSON: ${text.substring(0, 100)}`);
    }
    
    if (!response.ok) {
      // Si es error 401, solo limpiar token y redirigir si:
      // 1. Ya hay un token (sesión expirada)
      // 2. NO estamos en el endpoint de login (para permitir mostrar errores de login)
      if (response.status === 401) {
        const hasToken = localStorage.getItem('token');
        const isLoginEndpoint = endpoint === '/auth/login' || endpoint === '/auth/register';
        
        if (hasToken && !isLoginEndpoint) {
          // Token expirado o inválido en una petición autenticada
          localStorage.removeItem('token');
          // Solo redirigir si no estamos ya en login
          if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
          }
        }
      }
      
      // Crear error con información del status
      const error: any = new Error(data.message || 'Error en la petición');
      error.response = { status: response.status, data };
      throw error;
    }
    
    return data;
  } catch (error: any) {
    // Si es un error de red (backend no disponible), manejarlo silenciosamente
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      // En desarrollo, solo loguear si es necesario
      if (import.meta.env.DEV) {
        console.debug('Backend no disponible o error de red:', error.message);
      }
      
      // Crear un error más descriptivo
      const networkError: any = new Error('Servidor no disponible. Por favor, verifica que el backend esté corriendo.');
      networkError.isNetworkError = true;
      networkError.originalError = error;
      throw networkError;
    }
    
    // Para otros errores, loguear normalmente
    console.error('API Error:', error);
    // Log detailed error information in development
    if (import.meta.env.DEV && error.response) {
      console.error('Error details:', {
        status: error.response.status,
        data: error.response.data,
        errors: error.response.data?.errors,
        fullResponse: JSON.stringify(error.response.data, null, 2)
      });
    }
    throw error;
  }
}

// Helpers para métodos HTTP
export const api = {
  get: (endpoint: string, options?: { headers?: HeadersInit }) => {
    const requestOptions: RequestInit = { method: 'GET' };
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return apiRequest(endpoint, requestOptions);
  },
  post: (endpoint: string, body?: any, options?: { headers?: HeadersInit }) => {
    const requestOptions: RequestInit = { method: 'POST', body };
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return apiRequest(endpoint, requestOptions);
  },
  put: (endpoint: string, body?: any, options?: { headers?: HeadersInit }) => {
    const requestOptions: RequestInit = { method: 'PUT', body };
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return apiRequest(endpoint, requestOptions);
  },
  delete: (endpoint: string, options?: { headers?: HeadersInit }) => {
    const requestOptions: RequestInit = { method: 'DELETE' };
    if (options?.headers) {
      requestOptions.headers = options.headers;
    }
    return apiRequest(endpoint, requestOptions);
  },
};

