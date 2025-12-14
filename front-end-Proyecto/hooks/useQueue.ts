import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QueueService } from '@/services/queue';
import { QueueItem, AddToQueueRequest, AddMultipleToQueueRequest, ReorderQueueRequest, RemoveFromQueueRequest } from '@/models/queue';
import { Song } from '@/models/song';

/**
 * Hook para obtener la cola de reproducción del usuario
 */
export const useQueue = () => {
  const {
    data: queue = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['queue'],
    queryFn: QueueService.getQueue,
    staleTime: 1000 * 30, // 30 segundos
    refetchOnWindowFocus: false,
    retry: false, // No reintentar si falla (puede ser porque no hay token)
    enabled: true, // Siempre habilitado, pero puede fallar si no hay token
  });

  return {
    queue,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para agregar una canción a la cola
 */
export const useAddToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddToQueueRequest) => QueueService.addToQueue(request),
    onSuccess: () => {
      // Invalidar y refetch la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error) => {
      console.error('Error agregando canción a la cola:', error);
    },
  });
};

/**
 * Hook para agregar múltiples canciones a la cola
 */
export const useAddMultipleToQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: AddMultipleToQueueRequest) => QueueService.addMultipleToQueue(request),
    onSuccess: () => {
      // Invalidar y refetch la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error) => {
      console.error('Error agregando canciones a la cola:', error);
    },
  });
};

/**
 * Hook para eliminar canciones de la cola
 */
export const useRemoveFromQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: RemoveFromQueueRequest) => QueueService.removeFromQueue(request),
    onSuccess: () => {
      // Invalidar y refetch la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error) => {
      console.error('Error eliminando canciones de la cola:', error);
    },
  });
};

/**
 * Hook para reordenar la cola
 */
export const useReorderQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReorderQueueRequest) => QueueService.reorderQueue(request),
    onSuccess: () => {
      // Invalidar y refetch la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error) => {
      console.error('Error reordenando la cola:', error);
    },
  });
};

/**
 * Hook para limpiar la cola
 */
export const useClearQueue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => QueueService.clearQueue(),
    onSuccess: () => {
      // Invalidar y refetch la cola
      queryClient.invalidateQueries({ queryKey: ['queue'] });
    },
    onError: (error) => {
      console.error('Error limpiando la cola:', error);
    },
  });
};

/**
 * Hook helper para agregar una canción después de la actual (next)
 */
export const useAddToQueueNext = () => {
  const addToQueue = useAddToQueue();

  return {
    mutate: (songId: number) => {
      return addToQueue.mutate({
        songId,
        position: 'next',
      });
    },
    mutateAsync: (songId: number) => {
      return addToQueue.mutateAsync({
        songId,
        position: 'next',
      });
    },
    isLoading: addToQueue.isPending,
    error: addToQueue.error,
  };
};

/**
 * Hook helper para agregar una canción al final de la cola
 */
export const useAddToQueueEnd = () => {
  const addToQueue = useAddToQueue();

  return {
    mutate: (songId: number) => {
      return addToQueue.mutate({
        songId,
        position: 'end',
      });
    },
    mutateAsync: (songId: number) => {
      return addToQueue.mutateAsync({
        songId,
        position: 'end',
      });
    },
    isLoading: addToQueue.isPending,
    error: addToQueue.error,
  };
};

