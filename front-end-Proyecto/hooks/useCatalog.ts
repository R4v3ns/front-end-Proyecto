import { useQuery } from '@tanstack/react-query';
import { CatalogService } from '@/services/catalog';

/**
 * Hook para obtener todos los álbumes
 */
export const useAlbums = () => {
  const {
    data: albums = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['albums'],
    queryFn: CatalogService.getAllAlbums,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    albums,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener un álbum por ID
 */
export const useAlbum = (id: number | null) => {
  const {
    data: album = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['album', id],
    queryFn: () => (id ? CatalogService.getAlbumById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    album,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener todos los artistas
 */
export const useArtists = () => {
  const {
    data: artists = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['artists'],
    queryFn: CatalogService.getAllArtists,
    staleTime: 1000 * 60 * 5,
  });

  return {
    artists,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener un artista por ID
 */
export const useArtist = (id: number | null) => {
  const {
    data: artist = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['artist', id],
    queryFn: () => (id ? CatalogService.getArtistById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    artist,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener todos los géneros
 */
export const useGenres = () => {
  const {
    data: genres = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['genres'],
    queryFn: CatalogService.getAllGenres,
    staleTime: 1000 * 60 * 5,
  });

  return {
    genres,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener contenido destacado
 */
export const useFeatured = () => {
  const {
    data = { albums: [], artists: [], genres: [] },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['featured'],
    queryFn: CatalogService.getFeatured,
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  return {
    featured: data,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener nuevos lanzamientos
 */
export const useNewReleases = () => {
  const {
    data: albums = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['newReleases'],
    queryFn: CatalogService.getNewReleases,
    staleTime: 1000 * 60 * 10,
  });

  return {
    albums,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener contenido popular
 */
export const usePopular = () => {
  const {
    data = { albums: [], artists: [] },
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['popular'],
    queryFn: CatalogService.getPopular,
    staleTime: 1000 * 60 * 10,
  });

  return {
    popular: data,
    isLoading,
    error,
    refetch,
  };
};


