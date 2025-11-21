import { API_CONFIG } from '@/config/api';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
const isWeb = Platform.OS === 'web';

// Función helper para limpiar datos de autenticación cuando el token expira
const handleTokenExpiration = async () => {
  try {
    if (isWeb) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } else {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_KEY);
    }
    console.log('🔐 Token expired - Auth data cleared');
  } catch (error) {
    console.error('Error clearing auth data on token expiration:', error);
  }
};

// Tipos para las respuestas de la API
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

// Clase para manejar errores de la API
export class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Función auxiliar para crear un AbortSignal con timeout compatible con React Native
const createTimeoutSignal = (timeoutMs: number): AbortSignal | undefined => {
  // Verificar si AbortController está disponible
  if (typeof AbortController === 'undefined') {
    console.warn('⚠️ AbortController no está disponible, continuando sin timeout signal');
    return undefined;
  }
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeoutMs);
    
    // Limpiar el timeout si el signal es abortado manualmente
    // Usar try-catch para manejar casos donde addEventListener no esté disponible
    try {
      controller.signal.addEventListener('abort', () => {
        clearTimeout(timeoutId);
      });
    } catch (e) {
      // Si addEventListener no funciona, simplemente continuar sin limpieza automática
      console.warn('⚠️ No se pudo agregar listener al signal, continuando sin limpieza automática');
    }
    
    return controller.signal;
  } catch (error) {
    console.warn('⚠️ Error al crear timeout signal:', error);
    return undefined;
  }
};

// Función auxiliar para construir la URL completa
const buildUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, usarla directamente
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    console.log('🔗 buildUrl - Using full URL:', endpoint);
    return endpoint;
  }
  // Si no, construir la URL con la base
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remover trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${path}`;
  console.log('🔗 buildUrl - Base URL:', baseUrl);
  console.log('🔗 buildUrl - Endpoint:', endpoint);
  console.log('🔗 buildUrl - Full URL:', fullUrl);
  return fullUrl;
};

// Función auxiliar para obtener los headers con token de autenticación si existe
const getHeaders = (customHeaders?: Record<string, string>) => {
  const headers = {
    ...API_CONFIG.headers,
    ...customHeaders,
  };

  // Aquí puedes agregar el token de autenticación si lo tienes almacenado
  // Por ejemplo, usando AsyncStorage o SecureStore
  // const token = await getAuthToken();
  // if (token) {
  //   headers.Authorization = `Bearer ${token}`;
  // }

  return headers;
};

// Cliente API principal
export class ApiClient {
  /**
   * Realiza una petición GET
   */
  static async get<T = any>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      params?: Record<string, any>;
    }
  ): Promise<ApiResponse<T>> {
    let url = buildUrl(endpoint);
    try {
      // Agregar query parameters si existen
      if (options?.params) {
        const params = new URLSearchParams();
        Object.entries(options.params).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
        url += `?${params.toString()}`;
      }

      console.log('🌐 ApiClient.get - URL:', url);

      const timeoutSignal = createTimeoutSignal(API_CONFIG.timeout);
      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(options?.headers),
        ...(timeoutSignal && { signal: timeoutSignal }),
      });

      console.log('🌐 ApiClient.get - Response status:', response.status);

      // Intentar parsear como JSON, pero manejar errores si no es JSON
      let data;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('🌐 ApiClient.get - Response text:', text);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('🌐 ApiClient.get - JSON parse error:', parseError);
          data = { message: text || 'Error al procesar la respuesta' };
        }
      } else {
        console.log('🌐 ApiClient.get - Non-JSON response');
        data = { message: text || 'Respuesta no válida' };
      }

      if (!response.ok) {
        console.error('🌐 ApiClient.get - Error response:', data);
        
        // Detectar errores de autenticación (401) o token expirado
        if (response.status === 401 || 
            (data.error && (data.error.includes('Token expirado') || data.error.includes('token expirado') || data.error.includes('Token expired'))) ||
            (data.message && (data.message.includes('Token expirado') || data.message.includes('token expirado') || data.message.includes('Token expired')))) {
          console.warn('⚠️ Token expired or unauthorized - clearing auth data');
          // Limpiar el token y datos de usuario
          await handleTokenExpiration();
        }
        
        throw new ApiError(
          data.error || data.message || 'Error en la petición',
          response.status,
          data
        );
      }

      console.log('🌐 ApiClient.get - Success response:', data);
      return { data, status: response.status };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Manejar errores de red específicos
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          const errorMessage = `Error de conexión con el servidor.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new ApiError(errorMessage, 0);
        }
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }

  /**
   * Realiza una petición POST
   */
  static async post<T = any>(
    endpoint: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    try {
      console.log('🌐 ApiClient.post - URL:', url);
      console.log('🌐 ApiClient.post - Body:', body ? { ...body, password: body.password ? '***' : undefined } : 'No body');

      const timeoutSignal = createTimeoutSignal(API_CONFIG.timeout);
      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...(timeoutSignal && { signal: timeoutSignal }),
      });

      console.log('🌐 ApiClient.post - Response status:', response.status);
      console.log('🌐 ApiClient.post - Response headers:', Object.fromEntries(response.headers.entries()));

      // Intentar parsear como JSON, pero manejar errores si no es JSON
      let data;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('🌐 ApiClient.post - Response text:', text);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('🌐 ApiClient.post - JSON parse error:', parseError);
          data = { message: text || 'Error al procesar la respuesta' };
        }
      } else {
        console.log('🌐 ApiClient.post - Non-JSON response');
        data = { message: text || 'Respuesta no válida' };
      }

      if (!response.ok) {
        console.error('🌐 ApiClient.post - Error response:', data);
        
        // Detectar errores de autenticación (401) o token expirado
        if (response.status === 401 || 
            (data.error && (data.error.includes('Token expirado') || data.error.includes('token expirado') || data.error.includes('Token expired'))) ||
            (data.message && (data.message.includes('Token expirado') || data.message.includes('token expirado') || data.message.includes('Token expired')))) {
          console.warn('⚠️ Token expired or unauthorized - clearing auth data');
          await handleTokenExpiration();
        }
        
        throw new ApiError(
          data.error || data.message || 'Error en la petición',
          response.status,
          data
        );
      }

      console.log('🌐 ApiClient.post - Success response:', data);
      return { data, status: response.status };
    } catch (error) {
      console.error('🌐 ApiClient.post - Exception:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      // Manejar errores de red específicos
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          const errorMessage = `Error de conexión con el servidor.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new ApiError(errorMessage, 0);
        }
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }

  /**
   * Realiza una petición PUT
   */
  static async put<T = any>(
    endpoint: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    try {
      console.log('🌐 ApiClient.put - URL:', url);
      console.log('🌐 ApiClient.put - Body:', body);

      const timeoutSignal = createTimeoutSignal(API_CONFIG.timeout);
      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...(timeoutSignal && { signal: timeoutSignal }),
      });

      console.log('🌐 ApiClient.put - Response status:', response.status);

      // Intentar parsear como JSON, pero manejar errores si no es JSON
      let data;
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      console.log('🌐 ApiClient.put - Response text:', text);
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = text ? JSON.parse(text) : {};
        } catch (parseError) {
          console.error('🌐 ApiClient.put - JSON parse error:', parseError);
          data = { message: text || 'Error al procesar la respuesta' };
        }
      } else {
        console.log('🌐 ApiClient.put - Non-JSON response');
        data = { message: text || 'Respuesta no válida' };
      }

      if (!response.ok) {
        console.error('🌐 ApiClient.put - Error response:', data);
        
        // Detectar errores de autenticación (401) o token expirado
        if (response.status === 401 || 
            (data.error && (data.error.includes('Token expirado') || data.error.includes('token expirado') || data.error.includes('Token expired'))) ||
            (data.message && (data.message.includes('Token expirado') || data.message.includes('token expirado') || data.message.includes('Token expired')))) {
          console.warn('⚠️ Token expired or unauthorized - clearing auth data');
          await handleTokenExpiration();
        }
        
        throw new ApiError(
          data.error || data.message || 'Error en la petición',
          response.status,
          data
        );
      }

      return { data, status: response.status };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Manejar errores de red específicos
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          const errorMessage = `Error de conexión con el servidor.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new ApiError(errorMessage, 0);
        }
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }

  /**
   * Realiza una petición PATCH
   */
  static async patch<T = any>(
    endpoint: string,
    body?: any,
    options?: {
      headers?: Record<string, string>;
    }
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    try {
      const timeoutSignal = createTimeoutSignal(API_CONFIG.timeout);
      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        ...(timeoutSignal && { signal: timeoutSignal }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error('🌐 ApiClient.put - Error response:', data);
        
        // Detectar errores de autenticación (401) o token expirado
        if (response.status === 401 || 
            (data.error && (data.error.includes('Token expirado') || data.error.includes('token expirado') || data.error.includes('Token expired'))) ||
            (data.message && (data.message.includes('Token expirado') || data.message.includes('token expirado') || data.message.includes('Token expired')))) {
          console.warn('⚠️ Token expired or unauthorized - clearing auth data');
          await handleTokenExpiration();
        }
        
        throw new ApiError(
          data.error || data.message || 'Error en la petición',
          response.status,
          data
        );
      }

      return { data, status: response.status };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Manejar errores de red específicos
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          const errorMessage = `Error de conexión con el servidor.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new ApiError(errorMessage, 0);
        }
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }

  /**
   * Realiza una petición DELETE
   */
  static async delete<T = any>(
    endpoint: string,
    options?: {
      headers?: Record<string, string>;
      body?: any;
    }
  ): Promise<ApiResponse<T>> {
    const url = buildUrl(endpoint);
    try {
      const timeoutSignal = createTimeoutSignal(API_CONFIG.timeout);
      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(options?.headers),
        body: options?.body ? JSON.stringify(options.body) : undefined,
        ...(timeoutSignal && { signal: timeoutSignal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.message || 'Error en la petición',
          response.status,
          data
        );
      }

      return { data, status: response.status };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      // Manejar errores de red específicos
      if (error instanceof TypeError) {
        if (error.message.includes('fetch') || error.message.includes('Network request failed')) {
          const errorMessage = `Error de conexión con el servidor.\n\n` +
            `URL intentada: ${url}\n\n` +
            `Posibles causas:\n` +
            `1. El servidor backend no está corriendo\n` +
            `2. La IP o puerto no es correcto\n` +
            `3. El teléfono y la computadora no están en la misma red\n` +
            `4. Un firewall está bloqueando la conexión\n\n` +
            `Verifica la configuración en config/api.ts o app.json`;
          throw new ApiError(errorMessage, 0);
        }
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }
}

// Exportar una instancia por defecto para uso fácil
export default ApiClient;

