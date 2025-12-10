import { useQuery } from '@tanstack/react-query';
import { SearchService } from '@/services/search';
import { SearchResults } from '@/models/search';

/**
 * Hook para realizar búsquedas (CAT-02)
 */
export const useSearch = (
  query: string,
  types?: string[],
  limit?: number,
  enabled: boolean = true
) => {
  const {
    data: results = {
      songs: [],
      albums: [],
      artists: [],
      podcasts: [],
      episodes: [],
    },
    isLoading,
    error,
    refetch,
  } = useQuery<SearchResults>({
    queryKey: ['search', query, types, limit],
    queryFn: () => SearchService.search(query, types, limit),
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutos
  });

  return {
    results,
    isLoading,
    error,
    refetch,
    hasResults: 
      results.songs.length > 0 ||
      results.albums.length > 0 ||
      results.artists.length > 0 ||
      results.podcasts.length > 0 ||
      results.episodes.length > 0,
  };
};

/**
 * Hook para buscar solo canciones
 */
export const useSearchSongs = (query: string, limit?: number, enabled: boolean = true) => {
  const {
    data: songs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchSongs', query, limit],
    queryFn: () => SearchService.searchSongs(query, limit),
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });

  return {
    songs,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para buscar solo álbumes
 */
export const useSearchAlbums = (query: string, limit?: number, enabled: boolean = true) => {
  const {
    data: albums = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchAlbums', query, limit],
    queryFn: () => SearchService.searchAlbums(query, limit),
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });

  return {
    albums,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para buscar solo artistas
 */
export const useSearchArtists = (query: string, limit?: number, enabled: boolean = true) => {
  const {
    data: artists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchArtists', query, limit],
    queryFn: () => SearchService.searchArtists(query, limit),
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });

  return {
    artists,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para buscar solo podcasts
 */
export const useSearchPodcasts = (query: string, limit?: number, enabled: boolean = true) => {
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searchPodcasts', query, limit],
    queryFn: () => SearchService.searchPodcasts(query, limit),
    enabled: enabled && !!query && query.trim().length > 0,
    staleTime: 1000 * 60 * 2,
  });

  return {
    podcasts,
    isLoading,
    error,
    refetch,
  };
};


