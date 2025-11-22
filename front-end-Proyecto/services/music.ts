import ApiClient, { ApiError } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { Song, SongsResponse, SongResponse } from '@/models/song';

/**
 * ETAPA 1: Corrige el prefijo de la URL (localhost → IP real)
 * 
 * http://localhost:7070 → http://192.168.0.25:8080
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
 * ETAPA 2: Aplica el fix a las rutas específicas de audio y cover
 * 
 * audioUrl: /uploads/audio/song.mp3
 * coverUrl: /uploads/images/cover.jpg
 */
const fixSongUrls = (song: Song): Song => {
  return {
    ...song,
    audioUrl: fixLocalhost(song.audioUrl),
    coverUrl: fixLocalhost(song.coverUrl),
  };
};

export class MusicService {
  /**
   * Obtener todas las canciones
   * Nota: Este endpoint debe estar implementado en el backend en /songs
   */
  static async getAllSongs(): Promise<Song[]> {
    try {
      const response = await ApiClient.get<SongsResponse>(ENDPOINTS.MUSIC.SONGS);
      // Corregir URLs de localhost a IP correcta
      const songs = (response.data?.songs || []).map(fixSongUrls);
      return songs;
    } catch (error) {
      console.error('MusicService.getAllSongs error:', error);
      
      // Si el error es 404, significa que el endpoint no existe en el backend
      if (error instanceof ApiError && error.status === 404) {
        console.warn('El endpoint de canciones no está implementado en el backend. Retornando array vacío.');
        console.warn('Para implementar el endpoint, agrega una ruta GET /songs en tu backend.');
        return [];
      }
      
      // Si es otro tipo de error de API, lanzarlo
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Para otros errores (conexión, etc.), retornar array vacío
      console.warn('Error de conexión al obtener canciones. Retornando array vacío.');
      return [];
    }
  }

  /**
   * Obtener una canción por ID
   * Nota: Este endpoint debe estar implementado en el backend en /songs/:id
   */
  static async getSongById(id: number): Promise<Song | null> {
    try {
      const response = await ApiClient.get<SongResponse>(ENDPOINTS.MUSIC.SONG_BY_ID(id));
      const song = response.data?.song ? fixSongUrls(response.data.song) : null;
      return song;
    } catch (error) {
      console.error(`MusicService.getSongById(${id}) error:`, error);
      
      // Si el error es 404, significa que el endpoint no existe en el backend
      if (error instanceof ApiError && error.status === 404) {
        console.warn('El endpoint de canciones no está implementado en el backend.');
        return null;
      }
      
      // Si es otro tipo de error de API, lanzarlo
      if (error instanceof ApiError) {
        throw error;
      }
      
      return null;
    }
  }
}

export default MusicService;

