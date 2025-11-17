import { API_CONFIG } from '@/config/api';

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

// Función auxiliar para construir la URL completa
const buildUrl = (endpoint: string): string => {
  // Si el endpoint ya es una URL completa, usarla directamente
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  // Si no, construir la URL con la base
  const baseUrl = API_CONFIG.baseURL.replace(/\/$/, ''); // Remover trailing slash
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${baseUrl}${path}`;
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
    try {
      let url = buildUrl(endpoint);
      
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

      const response = await fetch(url, {
        method: 'GET',
        headers: getHeaders(options?.headers),
        signal: AbortSignal.timeout(API_CONFIG.timeout),
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
    try {
      const url = buildUrl(endpoint);

      const response = await fetch(url, {
        method: 'POST',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
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
    try {
      const url = buildUrl(endpoint);

      const response = await fetch(url, {
        method: 'PUT',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
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
    try {
      const url = buildUrl(endpoint);

      const response = await fetch(url, {
        method: 'PATCH',
        headers: getHeaders(options?.headers),
        body: body ? JSON.stringify(body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
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
    try {
      const url = buildUrl(endpoint);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: getHeaders(options?.headers),
        body: options?.body ? JSON.stringify(options.body) : undefined,
        signal: AbortSignal.timeout(API_CONFIG.timeout),
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
      throw new ApiError(
        error instanceof Error ? error.message : 'Error de conexión',
        0
      );
    }
  }
}

// Exportar una instancia por defecto para uso fácil
export default ApiClient;

