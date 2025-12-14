import Constants from 'expo-constants';
import { Platform } from 'react-native';

// URL base del backend - se puede configurar con variables de entorno
// Para desarrollo local: http://localhost:8080 o http://192.168.x.x:8080
// Para producción: https://tu-api.com
const getApiBaseUrl = (): string => {
  const platform = Platform.OS;
  console.log('Platform detected:', platform);
  
  // Prioridad 1: Variable de entorno
  if (process.env.EXPO_PUBLIC_API_URL) {
    console.log('Using EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
    let apiUrl = process.env.EXPO_PUBLIC_API_URL;
    
    // Asegurar que en móvil no se use localhost
    if (platform !== 'web' && apiUrl.includes('localhost')) {
      console.warn('Mobile platform detected with localhost in EXPO_PUBLIC_API_URL. Replacing with local IP...');
      apiUrl = apiUrl.replace('localhost', '192.168.0.21');
      console.warn('Updated URL for mobile:', apiUrl);
    }
    
    return apiUrl;
  }
  
  // Prioridad 2: Configuración en app.json
  if (Constants.expoConfig?.extra?.apiUrl) {
    let apiUrl = Constants.expoConfig.extra.apiUrl;
    console.log('Using app.json apiUrl:', apiUrl);
    
    // Si estamos en móvil (android, ios) y la URL contiene localhost, reemplazarlo con IP local
    if (platform !== 'web') {
      // Si la URL tiene localhost, reemplazarlo con IP local
      if (apiUrl.includes('localhost')) {
        console.warn('Mobile platform detected with localhost. Replacing with local IP...');
        apiUrl = apiUrl.replace(/localhost/g, '192.168.0.21');
        console.warn('Updated URL for mobile:', apiUrl);
      }
      // Si la URL ya tiene una IP pero es diferente, actualizarla
      else if (apiUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
        const currentIp = apiUrl.match(/\d+\.\d+\.\d+\.\d+/)?.[0];
        if (currentIp && currentIp !== '192.168.0.21') {
          console.warn(`Mobile platform detected with IP ${currentIp}. Updating to 192.168.0.21...`);
          apiUrl = apiUrl.replace(currentIp, '192.168.0.21');
          console.warn('Updated URL for mobile:', apiUrl);
        }
      }
    }
    
    // Si estamos en web y la URL tiene una IP, reemplazarla con localhost
    if (platform === 'web' && apiUrl.match(/\d+\.\d+\.\d+\.\d+/)) {
      console.warn('Web platform detected with IP. Replacing with localhost...');
      const ipMatch = apiUrl.match(/\d+\.\d+\.\d+\.\d+/)?.[0];
      if (ipMatch) {
        apiUrl = apiUrl.replace(ipMatch, 'localhost');
        console.warn('Updated URL for web:', apiUrl);
      }
    }
    
    console.log('Final API URL:', apiUrl);
    return apiUrl;
  }
  
  // Prioridad 3: Valor por defecto
  // Para dispositivos móviles/Expo, usar IP local en lugar de localhost
  // Para web, usar localhost
  const defaultUrl = platform === 'web' 
    ? 'http://localhost:8080'
    : 'http://192.168.0.21:8080'; // IP local de tu máquina - actualiza según tu red
  
  console.log('Using default API URL:', defaultUrl);
  
  if (platform === 'web') {
    console.warn('Web platform detected. Make sure your backend is running on http://localhost:8080');
  } else {
    console.warn('Mobile platform detected. Make sure your backend is accessible at http://192.168.0.21:8080');
    console.warn('Tip: If connection fails, check that both devices are on the same network and update the IP in config/api.ts');
  }
  
  return defaultUrl;
};

export const API_BASE_URL = getApiBaseUrl();

// Log la URL final que se está usando con información detallada
console.log('==========================================');
console.log('API Base URL configured:', API_BASE_URL);
console.log('Platform:', Platform.OS);
console.log('Constants.expoConfig?.extra?.apiUrl:', Constants.expoConfig?.extra?.apiUrl);
console.log('EXPO_PUBLIC_API_URL:', process.env.EXPO_PUBLIC_API_URL);
console.log('==========================================');

// Configuración de la API
export const API_CONFIG = {
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};

// Endpoints del backend
export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/users/login',
    REGISTER: '/api/users/register/email',
    REGISTER_COMPAT: '/api/users/register', // Compatibilidad
    REGISTER_PHONE: '/api/users/register/phone',
    VERIFY_EMAIL: '/api/users/verify-email',
    RESEND_EMAIL_VERIFICATION: '/api/users/resend-email-verification',
    RESET_PASSWORD: '/api/users/reset-password',
    FORGOT_PASSWORD: '/api/users/forgot-password',
    LOGOUT: '/api/users/logout',
  },
  // Agrega más endpoints aquí según necesites
  USERS: {
    BASE: '/api/users',
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    CHANGE_PASSWORD: '/api/users/change-password',
    PREFERENCES: '/api/users/preferences',
    GET_PREFERENCES: '/api/users/preferences',
  },
  MUSIC: {
    SONGS: '/songs',
    SONG_BY_ID: (id: number) => `/songs/${id}`,
    YOUTUBE_AUDIO: (youtubeId: string) => `/api/youtube/audio/${youtubeId}`, // Endpoint para convertir YouTube a audio
  },
  CATALOG: {
    // CAT-01: Explorar catálogo (ajustado al backend real)
    FEATURED: '/songs/featured',
    POPULAR_SONGS: '/songs/popular',
    RECENT_SONGS: '/songs/recent',
    PODCASTS: '/songs/podcasts', // Podcasts (canciones con isExample: true)
    POPULAR_ARTISTS: '/songs/artists/popular',
    POPULAR_ALBUMS: '/songs/albums/popular',
    ARTIST_DETAILS: (artistName: string) => `/songs/artist/${encodeURIComponent(artistName)}`,
    ALBUM_DETAILS: (albumName: string, artist?: string) => {
      const base = `/songs/album/${encodeURIComponent(albumName)}`;
      return artist ? `${base}?artist=${encodeURIComponent(artist)}` : base;
    },
    // Endpoints que no existen en el backend (para futura implementación)
    ALBUMS: '/api/albums',
    ALBUM_BY_ID: (id: number) => `/api/albums/${id}`,
    ARTISTS: '/api/artists',
    ARTIST_BY_ID: (id: number) => `/api/artists/${id}`,
    GENRES: '/api/genres',
    GENRE_BY_ID: (id: number) => `/api/genres/${id}`,
    NEW_RELEASES: '/api/catalog/new-releases',
  },
  SEARCH: {
    // CAT-02: Búsqueda (ajustado al backend real)
    SEARCH: '/songs/search',
  },
  PODCASTS: {
    // CAT-03: Podcasts
    PODCASTS: '/api/podcasts',
    PODCAST_BY_ID: (id: number) => `/api/podcasts/${id}`,
    EPISODES: '/api/podcasts/episodes',
    EPISODE_BY_ID: (id: number) => `/api/podcasts/episodes/${id}`,
    FOLLOW: (id: number) => `/api/podcasts/${id}/follow`,
    UNFOLLOW: (id: number) => `/api/podcasts/${id}/unfollow`,
    FOLLOWING: '/api/podcasts/following',
  },
  LIBRARY: {
    // Biblioteca: Playlists y canciones guardadas
    PLAYLISTS: '/api/library/playlists',
    PLAYLIST_BY_ID: (id: number) => `/api/library/playlists/${id}`,
    CREATE_PLAYLIST: '/api/library/playlists',
    UPDATE_PLAYLIST: (id: number) => `/api/library/playlists/${id}`,
    DELETE_PLAYLIST: (id: number) => `/api/library/playlists/${id}`,
    ADD_SONG_TO_PLAYLIST: (id: number | string) => `/api/library/playlists/${id}/songs`,
    REMOVE_SONG_FROM_PLAYLIST: (playlistId: number, songId: number) => 
      `/api/library/playlists/${playlistId}/songs/${songId}`,
    LIKED_SONGS: '/api/library/liked-songs',
    LIKE_SONG: (songId: number) => `/api/library/liked-songs/${songId}`,
    UNLIKE_SONG: (songId: number) => `/api/library/liked-songs/${songId}`,
  },
  QUEUE: {
    // Cola de reproducción
    GET_QUEUE: '/api/queue',
    ADD_TO_QUEUE: '/api/queue',
    ADD_MULTIPLE_TO_QUEUE: '/api/queue/multiple',
    REMOVE_FROM_QUEUE: '/api/queue',
    REORDER_QUEUE: '/api/queue/reorder',
    CLEAR_QUEUE: '/api/queue',
  },
} as const;

