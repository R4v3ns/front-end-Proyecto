import { Song } from './song';

/**
 * Elemento de la cola de reproducción
 * Representa una canción en la cola con su posición
 */
export interface QueueItem {
  id: string; // ID único del item en la cola (puede ser UUID o timestamp)
  song: Song;
  position: number; // Posición en la cola (0 = siguiente, 1 = después de la siguiente, etc.)
  addedAt: string; // Timestamp de cuando se agregó
}

/**
 * Estado de la cola de reproducción
 */
export interface Queue {
  items: QueueItem[];
  currentIndex: number; // Índice del item actualmente en reproducción (-1 si no hay)
  totalItems: number;
}

/**
 * Respuesta del backend para obtener la cola
 */
export interface QueueResponse {
  ok: boolean;
  queue: QueueItem[];
  currentIndex?: number;
}

/**
 * Request para agregar canciones a la cola
 */
export interface AddToQueueRequest {
  songId: number;
  position?: 'next' | 'end'; // 'next' = después de la canción actual, 'end' = al final
  index?: number; // Posición específica (opcional, si no se especifica position)
}

/**
 * Request para agregar múltiples canciones a la cola
 */
export interface AddMultipleToQueueRequest {
  songIds: number[];
  position?: 'next' | 'end';
}

/**
 * Request para reordenar la cola
 */
export interface ReorderQueueRequest {
  itemId: string;
  newPosition: number;
}

/**
 * Request para eliminar items de la cola
 */
export interface RemoveFromQueueRequest {
  itemIds: string[];
}

