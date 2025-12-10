import ApiClient, { ApiError } from './api';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { Podcast, PodcastsResponse, PodcastResponse, Episode, EpisodesResponse, EpisodeResponse } from '@/models/podcast';
import { getAuthHeaders } from './api';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';
const isWeb = Platform.OS === 'web';

/**
 * Función helper para obtener el token de autenticación
 */
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
 * Servicio de podcasts (CAT-03)
 * Permite explorar podcasts, episodios y seguir/dejar de seguir podcasts
 */
export class PodcastsService {
  /**
   * Obtener todos los podcasts
   */
  static async getAllPodcasts(): Promise<Podcast[]> {
    try {
      const response = await ApiClient.get<PodcastsResponse>(ENDPOINTS.PODCASTS.PODCASTS);
      const podcasts = (response.data?.podcasts || []).map(podcast => ({
        ...podcast,
        coverUrl: fixLocalhost(podcast.coverUrl),
      }));
      return podcasts;
    } catch (error) {
      console.error('PodcastsService.getAllPodcasts error:', error);
      if (error instanceof ApiError && error.status === 404) {
        console.warn('El endpoint de podcasts no está implementado en el backend.');
        return [];
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return [];
    }
  }

  /**
   * Obtener un podcast por ID
   */
  static async getPodcastById(id: number): Promise<Podcast | null> {
    try {
      const response = await ApiClient.get<PodcastResponse>(ENDPOINTS.PODCASTS.PODCAST_BY_ID(id));
      const podcast = response.data?.podcast;
      if (podcast) {
        return {
          ...podcast,
          coverUrl: fixLocalhost(podcast.coverUrl),
        };
      }
      return null;
    } catch (error) {
      console.error(`PodcastsService.getPodcastById(${id}) error:`, error);
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
   * Obtener episodios de un podcast
   */
  static async getEpisodesByPodcastId(podcastId: number): Promise<Episode[]> {
    try {
      const response = await ApiClient.get<EpisodesResponse>(
        ENDPOINTS.PODCASTS.EPISODES,
        {
          params: { podcastId },
        }
      );
      const episodes = (response.data?.episodes || []).map(episode => ({
        ...episode,
        coverUrl: fixLocalhost(episode.coverUrl),
        audioUrl: fixLocalhost(episode.audioUrl),
      }));
      return episodes;
    } catch (error) {
      console.error(`PodcastsService.getEpisodesByPodcastId(${podcastId}) error:`, error);
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
   * Obtener un episodio por ID
   */
  static async getEpisodeById(id: number): Promise<Episode | null> {
    try {
      const response = await ApiClient.get<EpisodeResponse>(ENDPOINTS.PODCASTS.EPISODE_BY_ID(id));
      const episode = response.data?.episode;
      if (episode) {
        return {
          ...episode,
          coverUrl: fixLocalhost(episode.coverUrl),
          audioUrl: fixLocalhost(episode.audioUrl),
        };
      }
      return null;
    } catch (error) {
      console.error(`PodcastsService.getEpisodeById(${id}) error:`, error);
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
   * Seguir un podcast (requiere autenticación)
   */
  static async followPodcast(id: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.post(
        ENDPOINTS.PODCASTS.FOLLOW(id),
        {},
        { headers }
      );
      return response.data?.ok || false;
    } catch (error) {
      console.error(`PodcastsService.followPodcast(${id}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Dejar de seguir un podcast (requiere autenticación)
   */
  static async unfollowPodcast(id: number): Promise<boolean> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.delete(ENDPOINTS.PODCASTS.UNFOLLOW(id), {
        headers,
      });
      return response.data?.ok || false;
    } catch (error) {
      console.error(`PodcastsService.unfollowPodcast(${id}) error:`, error);
      if (error instanceof ApiError) {
        throw error;
      }
      return false;
    }
  }

  /**
   * Obtener podcasts que el usuario sigue (requiere autenticación)
   */
  static async getFollowingPodcasts(): Promise<Podcast[]> {
    try {
      const token = await getAuthToken();
      const headers = getAuthHeaders(token);
      
      const response = await ApiClient.get<PodcastsResponse>(
        ENDPOINTS.PODCASTS.FOLLOWING,
        { headers }
      );
      const podcasts = (response.data?.podcasts || []).map(podcast => ({
        ...podcast,
        coverUrl: fixLocalhost(podcast.coverUrl),
        isFollowing: true,
      }));
      return podcasts;
    } catch (error) {
      console.error('PodcastsService.getFollowingPodcasts error:', error);
      if (error instanceof ApiError && error.status === 404) {
        return [];
      }
      if (error instanceof ApiError) {
        throw error;
      }
      return [];
    }
  }
}

export default PodcastsService;


