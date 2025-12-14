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
 * Hook para obtener una playlist por ID
 */
export const usePlaylist = (id: number | null) => {
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
 * Hook para actualizar una playlist
 */
export const useUpdatePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { name?: string; description?: string; isPublic?: boolean };
    }) => LibraryService.updatePlaylist(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.id] });
    },
  });
};

/**
 * Hook para eliminar una playlist
 */
export const useDeletePlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => LibraryService.deletePlaylist(id),
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
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
    },
  });
};

/**
 * Hook para quitar canción de playlist
 */
export const useRemoveSongFromPlaylist = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: number; songId: number }) =>
      LibraryService.removeSongFromPlaylist(playlistId, songId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
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




