/**
 * Modelos de datos para preferencias de usuario
 */

export type ThemeMode = 'light' | 'dark' | 'auto';

export type Language = 'es' | 'en' | 'pt' | 'fr';

export type NotificationType = 'new_releases' | 'playlist_updates' | 'artist_updates' | 'recommendations';

export interface NotificationPreferences {
  new_releases: boolean;
  playlist_updates: boolean;
  artist_updates: boolean;
  recommendations: boolean;
}

export interface PrivacyPreferences {
  showRecentActivity: boolean;
  showListeningHistory: boolean;
  showPlaylists: boolean;
}

/**
 * Modelo completo de preferencias de usuario
 */
export interface UserPreferences {
  language: Language;
  theme: ThemeMode;
  explicitContent: boolean;
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
}

/**
 * Valores por defecto seguros para las preferencias
 */
export const DEFAULT_PREFERENCES: UserPreferences = {
  language: 'es',
  theme: 'auto',
  explicitContent: false, // Por defecto, ocultar contenido explícito
  notifications: {
    new_releases: true,
    playlist_updates: true,
    artist_updates: false,
    recommendations: true,
  },
  privacy: {
    showRecentActivity: false, // Por defecto, no compartir actividad
    showListeningHistory: false,
    showPlaylists: true,
  },
};

/**
 * Idiomas disponibles con sus nombres
 */
export const AVAILABLE_LANGUAGES: { code: Language; name: string }[] = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' },
  { code: 'fr', name: 'Français' },
];

/**
 * Descripciones de las opciones de notificaciones
 */
export const NOTIFICATION_DESCRIPTIONS: Record<NotificationType, string> = {
  new_releases: 'Recibe notificaciones cuando tus artistas favoritos publiquen nueva música',
  playlist_updates: 'Te avisamos cuando alguien agregue canciones a tus playlists compartidas',
  artist_updates: 'Notificaciones sobre actualizaciones y eventos de artistas que sigues',
  recommendations: 'Sugerencias personalizadas basadas en tu actividad musical',
};

/**
 * Descripciones de las opciones de privacidad
 */
export const PRIVACY_DESCRIPTIONS = {
  showRecentActivity: 'Permite que otros usuarios vean tu actividad reciente',
  showListeningHistory: 'Comparte tu historial de reproducción con otros usuarios',
  showPlaylists: 'Hace visibles tus playlists públicas a otros usuarios',
};

