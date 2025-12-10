import ApiClient, { ApiError } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { Album, AlbumsResponse, AlbumResponse } from '@/models/album';
import { Artist, ArtistsResponse, ArtistResponse } from '@/models/artist';
import { Genre, GenresResponse, GenreResponse } from '@/models/genre';
import { Song } from '@/models/song';

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
 * Servicio para el catálogo (CAT-01)
 * Ajustado a los endpoints reales del backend
 */
export class CatalogService {
  /**
   * Obtener canciones destacadas
   */
  static async getFeaturedSongs(): Promise<Song[]> {
    try {
      const response = await ApiClient.get<{ ok: boolean; songs: Song[] }>(
        ENDPOINTS.CATALOG.FEATURED
      );
      const songs = (response.data?.songs || []).map(song => ({
        ...song,
        coverUrl: fixLocalhost(song.coverUrl),
        audioUrl: fixLocalhost(song.audioUrl),
      }));
      return songs;
    } catch (error) {
      console.error('CatalogService.getFeaturedSongs error:', error);
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
   * Obtener canciones populares
   */
  static async getPopularSongs(): Promise<Song[]> {
    try {
      const response = await ApiClient.get<{ ok: boolean; songs: Song[] }>(
        ENDPOINTS.CATALOG.POPULAR_SONGS
      );
      const songs = (response.data?.songs || []).map(song => ({
        ...song,
        coverUrl: fixLocalhost(song.coverUrl),
        audioUrl: fixLocalhost(song.audioUrl),
      }));
      return songs;
    } catch (error) {
      console.error('CatalogService.getPopularSongs error:', error);
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
   * Obtener canciones recientes
   */
  static async getRecentSongs(): Promise<Song[]> {
    try {
      const response = await ApiClient.get<{ ok: boolean; songs: Song[] }>(
        ENDPOINTS.CATALOG.RECENT_SONGS
      );
      const songs = (response.data?.songs || []).map(song => ({
        ...song,
        coverUrl: fixLocalhost(song.coverUrl),
        audioUrl: fixLocalhost(song.audioUrl),
      }));
      return songs;
    } catch (error) {
      console.error('CatalogService.getRecentSongs error:', error);
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
   * Obtener artistas populares
   * El backend devuelve: { name, songCount, totalPlays }
   */
  static async getPopularArtists(): Promise<Artist[]> {
    try {
      const response = await ApiClient.get<{
        ok: boolean;
        artists: Array<{ name: string; songCount: number; totalPlays: number }>;
      }>(ENDPOINTS.CATALOG.POPULAR_ARTISTS);

      // Adaptar formato del backend al formato esperado por el frontend
      const artists = (response.data?.artists || []).map((artist, index) => ({
        id: index + 1, // El backend no devuelve ID, generamos uno temporal
        name: artist.name,
        imageUrl: '', // El backend no devuelve imagen
        bio: undefined,
        followers: artist.totalPlays,
        genres: undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return artists;
    } catch (error) {
      console.error('CatalogService.getPopularArtists error:', error);
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
   * Obtener álbumes populares
   * El backend devuelve: { name, artist, songCount, totalPlays }
   */
  static async getPopularAlbums(): Promise<Album[]> {
    try {
      const response = await ApiClient.get<{
        ok: boolean;
        albums: Array<{
          name: string;
          artist: string;
          songCount: number;
          totalPlays: number;
        }>;
      }>(ENDPOINTS.CATALOG.POPULAR_ALBUMS);

      // Adaptar formato del backend al formato esperado por el frontend
      const albums = (response.data?.albums || []).map((album, index) => ({
        id: index + 1, // El backend no devuelve ID, generamos uno temporal
        title: album.name,
        artist: album.artist,
        artistId: 0, // El backend no devuelve artistId
        coverUrl: '', // El backend no devuelve coverUrl
        releaseDate: new Date().toISOString().split('T')[0],
        genre: '',
        genreId: 0,
        totalTracks: album.songCount,
        duration: 0, // El backend no devuelve duración total
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return albums;
    } catch (error) {
      console.error('CatalogService.getPopularAlbums error:', error);
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
   * Obtener detalles de un artista por nombre
   */
  static async getArtistDetails(artistName: string): Promise<Artist | null> {
    try {
      const response = await ApiClient.get<{
        ok: boolean;
        artist: {
          name: string;
          totalSongs: number;
          totalPlays: number;
          albums: number;
          songs: Song[];
        };
      }>(ENDPOINTS.CATALOG.ARTIST_DETAILS(artistName));

      const artistData = response.data?.artist;
      if (artistData) {
        return {
          id: 0, // El backend no devuelve ID
          name: artistData.name,
          imageUrl: '',
          bio: undefined,
          followers: artistData.totalPlays,
          genres: undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error(`CatalogService.getArtistDetails(${artistName}) error:`, error);
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Obtener detalles de un álbum por nombre
   */
  static async getAlbumDetails(
    albumName: string,
    artist?: string
  ): Promise<Album | null> {
    try {
      const response = await ApiClient.get<{
        ok: boolean;
        album: {
          name: string;
          artist: string;
          releaseDate?: string;
          totalSongs: number;
          totalDuration: string;
          totalPlays: number;
          songs: Song[];
        };
      }>(ENDPOINTS.CATALOG.ALBUM_DETAILS(albumName, artist));

      const albumData = response.data?.album;
      if (albumData) {
        return {
          id: 0, // El backend no devuelve ID
          title: albumData.name,
          artist: albumData.artist,
          artistId: 0,
          coverUrl: '',
          releaseDate: albumData.releaseDate || new Date().toISOString().split('T')[0],
          genre: '',
          genreId: 0,
          totalTracks: albumData.totalSongs,
          duration: 0, // El backend devuelve totalDuration como string "MM:SS"
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return null;
    } catch (error) {
      console.error(`CatalogService.getAlbumDetails(${albumName}) error:`, error);
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return null;
    }
  }

  // ========== MÉTODOS LEGACY (para compatibilidad con código existente) ==========

  /**
   * Obtener contenido destacado (usa canciones destacadas)
   */
  static async getFeatured(): Promise<{
    albums: Album[];
    artists: Artist[];
    genres: Genre[];
  }> {
    try {
      // El backend no tiene un endpoint unificado, usamos canciones destacadas
      const songs = await this.getFeaturedSongs();
      const artists = await this.getPopularArtists();
      const albums = await this.getPopularAlbums();

      return {
        albums: albums.slice(0, 10), // Limitar a 10
        artists: artists.slice(0, 10),
        genres: [], // El backend no tiene géneros
      };
    } catch (error) {
      console.error('CatalogService.getFeatured error:', error);
      return { albums: [], artists: [], genres: [] };
    }
  }

  /**
   * Obtener nuevos lanzamientos (usa canciones recientes)
   */
  static async getNewReleases(): Promise<Album[]> {
    try {
      // El backend no tiene endpoint específico de nuevos lanzamientos
      // Usamos canciones recientes y agrupamos por álbum
      const songs = await this.getRecentSongs();
      
      // Agrupar canciones por álbum
      const albumMap = new Map<string, Album>();
      songs.forEach((song, index) => {
        if (song.album) {
          const key = `${song.album}-${song.artist}`;
          if (!albumMap.has(key)) {
            albumMap.set(key, {
              id: index + 1,
              title: song.album,
              artist: song.artist,
              artistId: 0,
              coverUrl: song.coverUrl || '',
              releaseDate: song.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0],
              genre: '',
              genreId: 0,
              totalTracks: 1,
              duration: song.duration || 0,
              createdAt: song.createdAt || new Date().toISOString(),
              updatedAt: song.updatedAt || new Date().toISOString(),
            });
          } else {
            const album = albumMap.get(key)!;
            album.totalTracks += 1;
            album.duration += song.duration || 0;
          }
        }
      });

      return Array.from(albumMap.values());
    } catch (error) {
      console.error('CatalogService.getNewReleases error:', error);
      return [];
    }
  }

  /**
   * Obtener contenido popular
   */
  static async getPopular(): Promise<{
    albums: Album[];
    artists: Artist[];
  }> {
    try {
      const albums = await this.getPopularAlbums();
      const artists = await this.getPopularArtists();

      return { albums, artists };
    } catch (error) {
      console.error('CatalogService.getPopular error:', error);
      return { albums: [], artists: [] };
    }
  }

  // ========== MÉTODOS QUE NO EXISTEN EN EL BACKEND ==========
  // Estos métodos retornan arrays vacíos ya que el backend no los implementa

  static async getAllAlbums(): Promise<Album[]> {
    console.warn('CatalogService.getAllAlbums: El backend no tiene este endpoint');
    return [];
  }

  static async getAlbumById(id: number): Promise<Album | null> {
    console.warn('CatalogService.getAlbumById: El backend no tiene este endpoint');
    return null;
  }

  static async getAllArtists(): Promise<Artist[]> {
    console.warn('CatalogService.getAllArtists: El backend no tiene este endpoint');
    return [];
  }

  static async getArtistById(id: number): Promise<Artist | null> {
    console.warn('CatalogService.getArtistById: El backend no tiene este endpoint');
    return null;
  }

  static async getAllGenres(): Promise<Genre[]> {
    console.warn('CatalogService.getAllGenres: El backend no tiene este endpoint');
    return [];
  }

  static async getGenreById(id: number): Promise<Genre | null> {
    console.warn('CatalogService.getGenreById: El backend no tiene este endpoint');
    return null;
  }
}

export default CatalogService;
