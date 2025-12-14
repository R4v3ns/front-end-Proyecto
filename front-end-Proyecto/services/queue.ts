import ApiClient, { ApiError, getAuthHeaders } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { QueueItem, QueueResponse, AddToQueueRequest, AddMultipleToQueueRequest, ReorderQueueRequest, RemoveFromQueueRequest } from '@/models/queue';
import { Song } from '@/models/song';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const isWeb = Platform.OS === 'web';

const getAuthToken = async (): Promise<string | null> => {
  try {
    if (isWeb) {
      return localStorage.getItem(TOKEN_KEY);
    } else {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
  } catch (error) {
    console.error('Error getting auth token:', error);
    return null;
  }
};

/**
 * Función helper para corregir URLs de localhost a IP real
 */
const fixLocalhost = (url: string): string => {
  if (!url) return url;
  const envHost = API_BASE_URL.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  return url
    .replace(/localhost/g, envHost)
    .replace(/127\.0\.0\.1/g, envHost)
    .replace(/0\.0\.0\.0/g, envHost);
};

/**
 * Servicio para gestión de cola de reproducción
 */
export class QueueService {
  /**
   * Obtener la cola de reproducción del usuario
   */
  static async getQueue(): Promise<QueueItem[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.get<QueueResponse>(
        ENDPOINTS.QUEUE.GET_QUEUE,
        { headers }
      );
      
      // Corregir URLs de las canciones
      const items = (response.data?.queue || []).map(item => ({
        ...item,
        song: {
          ...item.song,
          coverUrl: fixLocalhost(item.song.coverUrl),
          audioUrl: fixLocalhost(item.song.audioUrl),
        },
      }));
      
      return items;
    } catch (error) {
      console.error('QueueService.getQueue error:', error);
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return [];
    }
  }

  /**
   * Agregar una canción a la cola
   */
  static async addToQueue(request: AddToQueueRequest): Promise<QueueItem> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post<{ ok: boolean; item: QueueItem }>(
        ENDPOINTS.QUEUE.ADD_TO_QUEUE,
        request,
        { headers }
      );
      
      const item = response.data?.item;
      if (!item) {
        throw new Error('No se recibió el item en la respuesta');
      }
      
      // Corregir URLs
      return {
        ...item,
        song: {
          ...item.song,
          coverUrl: fixLocalhost(item.song.coverUrl),
          audioUrl: fixLocalhost(item.song.audioUrl),
        },
      };
    } catch (error) {
      console.error('QueueService.addToQueue error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al agregar canción a la cola');
    }
  }

  /**
   * Agregar múltiples canciones a la cola
   */
  static async addMultipleToQueue(request: AddMultipleToQueueRequest): Promise<QueueItem[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post<{ ok: boolean; items: QueueItem[] }>(
        ENDPOINTS.QUEUE.ADD_MULTIPLE_TO_QUEUE,
        request,
        { headers }
      );
      
      const items = response.data?.items || [];
      
      // Corregir URLs
      return items.map(item => ({
        ...item,
        song: {
          ...item.song,
          coverUrl: fixLocalhost(item.song.coverUrl),
          audioUrl: fixLocalhost(item.song.audioUrl),
        },
      }));
    } catch (error) {
      console.error('QueueService.addMultipleToQueue error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al agregar canciones a la cola');
    }
  }

  /**
   * Eliminar canciones de la cola
   */
  static async removeFromQueue(request: RemoveFromQueueRequest): Promise<void> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      // Usar ApiClient.delete que ahora maneja correctamente 204
      await ApiClient.delete(
        ENDPOINTS.QUEUE.REMOVE_FROM_QUEUE,
        {
          headers,
          body: request,
        }
      );
      // Si llegamos aquí, fue exitoso
    } catch (error) {
      console.error('QueueService.removeFromQueue error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al eliminar canciones de la cola');
    }
  }

  /**
   * Reordenar la cola (mover un item a una nueva posición)
   */
  static async reorderQueue(request: ReorderQueueRequest): Promise<QueueItem[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.put<{ ok: boolean; queue: QueueItem[] }>(
        ENDPOINTS.QUEUE.REORDER_QUEUE,
        request,
        { headers }
      );
      
      const items = response.data?.queue || [];
      
      // Corregir URLs
      return items.map(item => ({
        ...item,
        song: {
          ...item.song,
          coverUrl: fixLocalhost(item.song.coverUrl),
          audioUrl: fixLocalhost(item.song.audioUrl),
        },
      }));
    } catch (error) {
      console.error('QueueService.reorderQueue error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al reordenar la cola');
    }
  }

  /**
   * Limpiar toda la cola
   */
  static async clearQueue(): Promise<void> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      // Usar ApiClient.delete sin body para limpiar toda la cola
      await ApiClient.delete(
        ENDPOINTS.QUEUE.CLEAR_QUEUE,
        {
          headers,
          // No enviar body para indicar que se debe limpiar toda la cola
        }
      );
      // Si llegamos aquí, fue exitoso
    } catch (error) {
      console.error('QueueService.clearQueue error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new Error('Error al limpiar la cola');
    }
  }
}

