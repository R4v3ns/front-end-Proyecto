import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { LibraryService } from '@/services/library';
import { Playlist } from '@/models/playlist';
import { Song } from '@/models/song';

/**
 * Hook para obtener todas las playlists del usuario
 */
export const usePlaylists = () => {
  const {
    data: playlists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['playlists'],
    queryFn: LibraryService.getPlaylists,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    playlists,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener una playlist por ID (puede ser número o UUID)
 */
export const usePlaylist = (id: number | string | null) => {
  const {
    data: playlist = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['playlist', id],
    queryFn: () => (id ? LibraryService.getPlaylistById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    playlist,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener canciones guardadas (likes)
 */
export const useLikedSongs = () => {
  const {
    data: songs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['likedSongs'],
    queryFn: LibraryService.getLikedSongs,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    songs,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para crear una playlist
 */
export const useCreatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description?: string; isPublic?: boolean }) =>
      LibraryService.createPlaylist(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

/**
 * Hook para actualizar una playlist (id puede ser número o UUID)
 */
export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number | string;
      data: { name?: string; description?: string; isPublic?: boolean };
    }) => LibraryService.updatePlaylist(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
    },
  });
};

/**
 * Hook para eliminar una playlist (id puede ser número o UUID)
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number | string) => LibraryService.deletePlaylist(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
};

/**
 * Hook para agregar canción a playlist
 */
export const useAddSongToPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number | string; songId: number }) =>
      LibraryService.addSongToPlaylist(playlistId, songId),
    onSuccess: (_, variables) => {
      // Invalidar y refrescar todas las queries relacionadas con playlists
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      
      // Refrescar la lista de playlists inmediatamente
      queryClient.refetchQueries({ queryKey: ['playlists'] });
      
      // Invalidar y refrescar la playlist específica
      // Normalizar el ID para asegurar que coincida con la query
      const normalizedId = typeof variables.playlistId === 'string' 
        ? parseInt(variables.playlistId, 10) 
        : variables.playlistId;
      
      // Invalidar y refrescar con ambos formatos de ID para cubrir todos los casos
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          if (query.queryKey[0] === 'playlist' && query.queryKey.length === 2) {
            const queryId = query.queryKey[1];
            return String(queryId) === String(variables.playlistId) || 
                   Number(queryId) === Number(variables.playlistId) ||
                   String(queryId) === String(normalizedId) ||
                   Number(queryId) === normalizedId;
          }
          return false;
        }
      });
      
      // Forzar refetch de la playlist específica
      queryClient.refetchQueries({ 
        predicate: (query) => {
          if (query.queryKey[0] === 'playlist' && query.queryKey.length === 2) {
            const queryId = query.queryKey[1];
            return String(queryId) === String(variables.playlistId) || 
                   Number(queryId) === Number(variables.playlistId) ||
                   String(queryId) === String(normalizedId) ||
                   Number(queryId) === normalizedId;
          }
          return false;
        }
      });
    },
  });
};

/**
 * Hook para quitar canción de playlist (playlistId puede ser número o UUID)
 */
export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number | string; songId: number }) =>
      LibraryService.removeSongFromPlaylist(playlistId, songId),
    onSuccess: (_, variables) => {
      // Invalidar y refrescar todas las queries relacionadas con playlists
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.refetchQueries({ queryKey: ['playlists'] });
      
      // Invalidar y refrescar la playlist específica
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
      queryClient.refetchQueries({ queryKey: ['playlist', variables.playlistId] });
    },
  });
};

/**
 * Hook para dar like a una canción
 */
export const useLikeSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: number) => LibraryService.likeSong(songId),
    onSuccess: () => {
      // Invalidar la query de liked songs para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
      console.log('✅ Like agregado exitosamente, lista de likes actualizada');
    },
    onError: (error: any) => {
      console.error('❌ Error al dar like:', error);
      // Si el error es 409 (conflicto - ya está en likes), invalidar la query igualmente
      // para que la UI se actualice y muestre que la canción está liked
      if (error?.status === 409) {
        console.log('⚠️ Canción ya está en likes (409), invalidando query para refrescar UI');
        queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
      }
    },
  });
};

/**
 * Hook para quitar like de una canción
 */
export const useUnlikeSong = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: number) => LibraryService.unlikeSong(songId),
    onSuccess: () => {
      // Invalidar la query de liked songs para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['likedSongs'] });
      console.log('✅ Like removido exitosamente, lista de likes actualizada');
    },
    onError: (error) => {
      console.error('❌ Error al quitar like:', error);
    },
  });
};




