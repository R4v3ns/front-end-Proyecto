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
  static async addSongToPlaylist(playlistId: number | string, songId: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      // Convertir playlistId a string si es necesario (el backend espera UUID como string)
      const playlistIdStr = String(playlistId);
      
      const response = await ApiClient.post(
        ENDPOINTS.LIBRARY.ADD_SONG_TO_PLAYLIST(playlistIdStr as any),
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
      if (!token) {
        console.warn('LibraryService.getLikedSongs - No token available');
        return [];
      }
      const headers = getAuthHeaders(token);
      
      // Intentar primero con /api/library/liked-songs
      try {
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
        // Si falla con 404, intentar alternativa bajo /api/users
        if (error instanceof ApiError && error.status === 404) {
          console.warn('LibraryService.getLikedSongs - Primary endpoint failed (404), trying /api/users/liked-songs...');
          try {
            const altResponse = await ApiClient.get<SongsResponse>(
              '/api/users/liked-songs',
              { headers }
            );
            
            return (altResponse.data?.songs || []).map(song => ({
              ...song,
              coverUrl: fixLocalhost(song.coverUrl),
              audioUrl: fixLocalhost(song.audioUrl),
            }));
          } catch (altError) {
            console.error('LibraryService.getLikedSongs - Alternative endpoint also failed:', altError);
            // Si ambas fallan, devolver array vacío (mejor UX que error)
            return [];
          }
        }
        throw error;
      }
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
  static async likeSong(songId: number): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      const headers = getAuthHeaders(token);
      
      // Intentar primero con POST /api/library/liked-songs/:songId (ruta principal)
      const primaryEndpoint = ENDPOINTS.LIBRARY.LIKE_SONG(songId);
      console.log(`LibraryService.likeSong - Attempting POST to: ${primaryEndpoint}`);
      
      try {
        const response = await ApiClient.post(
          primaryEndpoint,
          {},
          { headers }
        );
        
        console.log(`LibraryService.likeSong - Success:`, response.data);
        // Devolver la respuesta completa para incluir mensajes
        return response.data || { ok: true, success: true };
      } catch (error) {
        // Si falla con 404, intentar con songId en el body
        if (error instanceof ApiError && error.status === 404) {
          console.warn(`LibraryService.likeSong - Primary endpoint failed (404), trying with songId in body...`);
          
          try {
            const altResponse = await ApiClient.post(
              ENDPOINTS.LIBRARY.LIKED_SONGS,
              { songId },
              { headers }
            );
            
            console.log(`LibraryService.likeSong - Success with body:`, altResponse.data);
            // Devolver la respuesta completa para incluir mensajes
            return altResponse.data || { ok: true, success: true };
          } catch (altError) {
            console.error(`LibraryService.likeSong - Both endpoints failed`);
            throw error; // Lanzar el error original
          }
        }
        throw error;
      }
    } catch (error) {
      console.error(`LibraryService.likeSong(${songId}) - Error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        `Error al dar like a la canción: ${error instanceof Error ? error.message : 'Error desconocido'}`,
        500
      );
    }
  }

  /**
   * Quitar like de una canción
   */
  static async unlikeSong(songId: number): Promise<any> {
    try {
      const token = await getAuthToken();
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      const headers = getAuthHeaders(token);
      
      const primaryEndpoint = ENDPOINTS.LIBRARY.UNLIKE_SONG(songId);
      console.log(`LibraryService.unlikeSong - Attempting DELETE to: ${primaryEndpoint}`);
      
      // Intentar primero con DELETE a la ruta que incluye el ID
      try {
        const response = await ApiClient.delete(
          primaryEndpoint,
          { headers }
        );
        
        console.log(`LibraryService.unlikeSong - Success with primary endpoint:`, response.data);
        // Devolver la respuesta completa para incluir mensajes
        return response.data || { ok: true, success: true };
      } catch (error) {
        // Si falla con 404, intentar alternativas
        if (error instanceof ApiError && error.status === 404) {
          console.warn(`LibraryService.unlikeSong - Primary endpoint failed (404), trying alternatives...`);
          
          // Opción 1: Intentar con query param en la URL
          try {
            const altEndpoint = `${ENDPOINTS.LIBRARY.LIKED_SONGS}?songId=${songId}`;
            console.log(`LibraryService.unlikeSong - Trying with query param: ${altEndpoint}`);
            const altResponse = await ApiClient.delete(
              altEndpoint,
              { headers }
            );
            
            console.log(`LibraryService.unlikeSong - Success with query param endpoint:`, altResponse.data);
            // Devolver la respuesta completa para incluir mensajes
            return altResponse.data || { ok: true, success: true };
          } catch (altError1) {
            console.warn(`LibraryService.unlikeSong - Query param endpoint failed, trying with body...`);
            // Opción 2: Intentar con body
            try {
              const altResponse2 = await ApiClient.delete(
                ENDPOINTS.LIBRARY.LIKED_SONGS,
                { 
                  headers,
                  body: { songId }
                }
              );
              
              console.log(`LibraryService.unlikeSong - Success with body endpoint:`, altResponse2.data);
              // Devolver la respuesta completa para incluir mensajes
              return altResponse2.data || { ok: true, success: true };
            } catch (altError2) {
              console.warn(`LibraryService.unlikeSong - Body endpoint failed, trying under /api/users...`);
              // Opción 3: Intentar bajo /api/users/liked-songs
              try {
                const userLikedEndpoint = `/api/users/liked-songs/${songId}`;
                console.log(`LibraryService.unlikeSong - Trying: DELETE to ${userLikedEndpoint}`);
                const altResponse3 = await ApiClient.delete(
                  userLikedEndpoint,
                  { headers }
                );
                
                console.log(`LibraryService.unlikeSong - Success with /api/users endpoint:`, altResponse3.data);
                // Devolver la respuesta completa para incluir mensajes
                return altResponse3.data || { ok: true, success: true };
              } catch (altError3) {
                // Opción 4: Intentar DELETE a /api/users/liked-songs con songId en body o query
                try {
                  const userLikedEndpoint2 = `/api/users/liked-songs?songId=${songId}`;
                  console.log(`LibraryService.unlikeSong - Trying: DELETE to ${userLikedEndpoint2}`);
                  const altResponse4 = await ApiClient.delete(
                    userLikedEndpoint2,
                    { headers }
                  );
                  
                  console.log(`LibraryService.unlikeSong - Success with /api/users query endpoint:`, altResponse4.data);
                  // Devolver la respuesta completa para incluir mensajes
                  return altResponse4.data || { ok: true, success: true };
                } catch (altError4) {
                  console.error(`LibraryService.unlikeSong - All alternative endpoints failed`);
                  // Si todas fallan, lanzar el error original
                  throw error;
                }
              }
            }
          }
        }
        throw error;
      }
    } catch (error) {
      console.error(`LibraryService.unlikeSong(${songId}) - Final error:`, error);
      if (error instanceof ApiError) {
        console.error(`LibraryService.unlikeSong - Error status: ${error.status}, message: ${error.message}`);
        console.error(`LibraryService.unlikeSong - Error data:`, error.data);
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



