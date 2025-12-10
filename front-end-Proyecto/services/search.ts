import ApiClient, { ApiError } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { SearchResponse, SearchResults } from '@/models/search';
import { Song } from '@/models/song';
import { Album } from '@/models/album';
import { Artist } from '@/models/artist';
import { Podcast, Episode } from '@/models/podcast';

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
 * Servicio de búsqueda (CAT-02)
 * Permite buscar canciones, álbumes, artistas, podcasts y episodios
 */
export class SearchService {
  /**
   * Buscar contenido
   * @param query - Término de búsqueda
   * @param types - Tipos de contenido a buscar (opcional): 'songs', 'albums', 'artists', 'podcasts', 'episodes'
   * @param limit - Límite de resultados por tipo (opcional)
   */
  static async search(
    query: string,
    types?: string[],
    limit?: number
  ): Promise<SearchResults> {
    try {
      if (!query || query.trim().length === 0) {
        return {
          songs: [],
          albums: [],
          artists: [],
          podcasts: [],
          episodes: [],
        };
      }

      const params: Record<string, any> = {
        q: query.trim(),
      };

      // El backend usa 'type' (singular) y acepta: 'songs', 'artists', 'albums', 'all'
      if (types && types.length > 0) {
        // Si hay múltiples tipos, usar 'all', sino usar el primer tipo
        if (types.length === 1) {
          params.type = types[0];
        } else {
          // Si hay múltiples tipos, buscar 'all' para obtener todos
          params.type = 'all';
        }
      } else {
        // Si no se especifica, buscar todo
        params.type = 'all';
      }

      if (limit) {
        params.limit = limit;
      }

      const response = await ApiClient.get<SearchResponse>(ENDPOINTS.SEARCH.SEARCH, {
        params,
      });

      const results = response.data?.results || {
        songs: [],
        albums: [],
        artists: [],
        podcasts: [],
        episodes: [],
      };

      // Corregir URLs en todos los resultados
      return {
        songs: (results.songs || []).map((song: Song) => ({
          ...song,
          coverUrl: fixLocalhost(song.coverUrl),
          audioUrl: fixLocalhost(song.audioUrl),
        })),
        albums: (results.albums || []).map((album: Album) => ({
          ...album,
          coverUrl: fixLocalhost(album.coverUrl),
        })),
        artists: (results.artists || []).map((artist: Artist) => ({
          ...artist,
          imageUrl: fixLocalhost(artist.imageUrl),
        })),
        podcasts: (results.podcasts || []).map((podcast: Podcast) => ({
          ...podcast,
          coverUrl: fixLocalhost(podcast.coverUrl),
        })),
        episodes: (results.episodes || []).map((episode: Episode) => ({
          ...episode,
          coverUrl: fixLocalhost(episode.coverUrl),
          audioUrl: fixLocalhost(episode.audioUrl),
        })),
      };
    } catch (error) {
      console.error('SearchService.search error:', error);
      if (error instanceof ApiError && error.status === 404) {
        console.warn('El endpoint de búsqueda no está implementado en el backend.');
        return {
          songs: [],
          albums: [],
          artists: [],
          podcasts: [],
          episodes: [],
        };
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return {
        songs: [],
        albums: [],
        artists: [],
        podcasts: [],
        episodes: [],
      };
    }
  }

  /**
   * Buscar solo canciones
   */
  static async searchSongs(query: string, limit?: number): Promise<Song[]> {
    const results = await this.search(query, ['songs'], limit);
    return results.songs;
  }

  /**
   * Buscar solo álbumes
   */
  static async searchAlbums(query: string, limit?: number): Promise<Album[]> {
    const results = await this.search(query, ['albums'], limit);
    return results.albums;
  }

  /**
   * Buscar solo artistas
   */
  static async searchArtists(query: string, limit?: number): Promise<Artist[]> {
    const results = await this.search(query, ['artists'], limit);
    return results.artists;
  }

  /**
   * Buscar solo podcasts
   */
  static async searchPodcasts(query: string, limit?: number): Promise<Podcast[]> {
    const results = await this.search(query, ['podcasts'], limit);
    return results.podcasts;
  }
}

export default SearchService;

