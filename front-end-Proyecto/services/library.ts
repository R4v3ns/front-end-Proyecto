import ApiClient, { ApiError, getAuthHeaders } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { Playlist, PlaylistsResponse, PlaylistResponse } from '@/models/playlist';
import { Song, SongsResponse } from '@/models/song';
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

const fixLocalhost = (url: string): string => {
  if (!url) return url;
  const envHost = API_BASE_URL.replace(/^https?:\/\//, '').replace(/:\d+$/, '');
  return url
    .replace(/localhost/g, envHost)
    .replace(/127\.0\.0\.1/g, envHost)
    .replace(/0\.0\.0\.0/g, envHost);
};

/**
 * Servicio de Biblioteca
 * Gestiona playlists y canciones guardadas (likes)
 */
export class LibraryService {
  /**
   * Obtener todas las playlists del usuario
   */
  static async getPlaylists(): Promise<Playlist[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.get<PlaylistsResponse>(
        ENDPOINTS.LIBRARY.PLAYLISTS,
        { headers }
      );
      
      return (response.data?.playlists || []).map(playlist => ({
        ...playlist,
        coverUrl: playlist.coverUrl ? fixLocalhost(playlist.coverUrl) : undefined,
        songs: playlist.songs?.map(song => ({
          ...song,
          coverUrl: fixLocalhost(song.coverUrl),
          audioUrl: fixLocalhost(song.audioUrl),
        })),
      }));
    } catch (error) {
      console.error('LibraryService.getPlaylists error:', error);
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
   * Obtener una playlist por ID
   */
  static async getPlaylistById(id: number): Promise<Playlist | null> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.get<PlaylistResponse>(
        ENDPOINTS.LIBRARY.PLAYLIST_BY_ID(id),
        { headers }
      );
      
      const playlist = response.data?.playlist;
      if (playlist) {
        return {
          ...playlist,
          coverUrl: playlist.coverUrl ? fixLocalhost(playlist.coverUrl) : undefined,
          songs: playlist.songs?.map(song => ({
            ...song,
            coverUrl: fixLocalhost(song.coverUrl),
            audioUrl: fixLocalhost(song.audioUrl),
          })),
        };
      }
      return null;
    } catch (error) {
      console.error(`LibraryService.getPlaylistById(${id}) error:`, error);
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
   * Crear una nueva playlist
   */
  static async createPlaylist(data: {
    name: string;
    description?: string;
    isPublic?: boolean;
  }): Promise<Playlist | null> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post<PlaylistResponse>(
        ENDPOINTS.LIBRARY.CREATE_PLAYLIST,
        {
          name: data.name,
          description: data.description || '',
          isPublic: data.isPublic ?? false,
        },
        { headers }
      );
      
      const playlist = response.data?.playlist;
      if (playlist) {
        return {
          ...playlist,
          coverUrl: playlist.coverUrl ? fixLocalhost(playlist.coverUrl) : undefined,
        };
      }
      return null;
    } catch (error) {
      console.error('LibraryService.createPlaylist error:', error);
      if (error instanceof ApiError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Actualizar una playlist
   */
  static async updatePlaylist(
    id: number,
    data: {
      name?: string;
      description?: string;
      isPublic?: boolean;
    }
  ): Promise<Playlist | null> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.put<PlaylistResponse>(
        ENDPOINTS.LIBRARY.UPDATE_PLAYLIST(id),
        data,
        { headers }
      );
      
      const playlist = response.data?.playlist;
      if (playlist) {
        return {
          ...playlist,
          coverUrl: playlist.coverUrl ? fixLocalhost(playlist.coverUrl) : undefined,
        };
      }
      return null;
    } catch (error) {
      console.error(`LibraryService.updatePlaylist(${id}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Eliminar una playlist
   */
  static async deletePlaylist(id: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.delete(
        ENDPOINTS.LIBRARY.DELETE_PLAYLIST(id),
        { headers }
      );
      
      return response.data?.ok || false;
    } catch (error) {
      console.error(`LibraryService.deletePlaylist(${id}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Agregar canción a una playlist
   */
  static async addSongToPlaylist(playlistId: number, songId: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post(
        ENDPOINTS.LIBRARY.ADD_SONG_TO_PLAYLIST(playlistId),
        { songId },
        { headers }
      );
      
      return response.data?.ok || false;
    } catch (error) {
      console.error(`LibraryService.addSongToPlaylist(${playlistId}, ${songId}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Quitar canción de una playlist
   */
  static async removeSongFromPlaylist(playlistId: number, songId: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.delete(
        ENDPOINTS.LIBRARY.REMOVE_SONG_FROM_PLAYLIST(playlistId, songId),
        { headers }
      );
      
      return response.data?.ok || false;
    } catch (error) {
      console.error(`LibraryService.removeSongFromPlaylist(${playlistId}, ${songId}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Obtener canciones guardadas (likes)
   */
  static async getLikedSongs(): Promise<Song[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.get<SongsResponse>(
        ENDPOINTS.LIBRARY.LIKED_SONGS,
        { headers }
      );
      
      return (response.data?.songs || []).map(song => ({
        ...song,
        coverUrl: fixLocalhost(song.coverUrl),
        audioUrl: fixLocalhost(song.audioUrl),
      }));
    } catch (error) {
      console.error('LibraryService.getLikedSongs error:', error);
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
   * Dar like a una canción
   */
  static async likeSong(songId: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post(
        ENDPOINTS.LIBRARY.LIKE_SONG(songId),
        {},
        { headers }
      );
      
      return response.data?.ok || false;
    } catch (error) {
      console.error(`LibraryService.likeSong(${songId}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Quitar like de una canción
   */
  static async unlikeSong(songId: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.delete(
        ENDPOINTS.LIBRARY.UNLIKE_SONG(songId),
        { headers }
      );
      
      return response.data?.ok || false;
    } catch (error) {
      console.error(`LibraryService.unlikeSong(${songId}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Verificar si una canción está en likes
   */
  static async isSongLiked(songId: number): Promise<boolean> {
    try {
      const likedSongs = await this.getLikedSongs();
      return likedSongs.some(song => song.id === songId);
    } catch (error) {
      console.error(`LibraryService.isSongLiked(${songId}) error:`, error);
      return false;
    }
  }
}

export default LibraryService;


