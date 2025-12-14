/**
 * Utilidades para obtener imágenes de YouTube con fallbacks
 */

/**
 * Genera la URL de la miniatura de YouTube para un video ID dado
 * Intenta usar la mejor calidad disponible, con fallbacks
 * 
 * @param youtubeId - ID del video de YouTube
 * @param quality - Calidad deseada: 'maxres', 'hq', 'mq', 'sd', 'default'
 * @returns URL de la miniatura
 */
export function getYouTubeThumbnail(
  youtubeId: string,
  quality: 'maxres' | 'hq' | 'mq' | 'sd' | 'default' = 'maxres'
): string {
  if (!youtubeId) {
    return '';
  }

  const baseUrl = `https://i.ytimg.com/vi/${youtubeId}`;
  
  switch (quality) {
    case 'maxres':
      return `${baseUrl}/maxresdefault.jpg`;
    case 'hq':
      return `${baseUrl}/hqdefault.jpg`;
    case 'mq':
      return `${baseUrl}/mqdefault.jpg`;
    case 'sd':
      return `${baseUrl}/sddefault.jpg`;
    case 'default':
      return `${baseUrl}/default.jpg`;
    default:
      return `${baseUrl}/maxresdefault.jpg`;
  }
}

/**
 * Genera un array de URLs de miniaturas de YouTube en orden de preferencia
 * Útil para usar con fallbacks en componentes de imagen
 * 
 * @param youtubeId - ID del video de YouTube
 * @returns Array de URLs ordenadas de mejor a peor calidad
 */
export function getYouTubeThumbnailFallbacks(youtubeId: string): string[] {
  if (!youtubeId) {
    return [];
  }

  return [
    getYouTubeThumbnail(youtubeId, 'maxres'),
    getYouTubeThumbnail(youtubeId, 'hq'),
    getYouTubeThumbnail(youtubeId, 'mq'),
    getYouTubeThumbnail(youtubeId, 'sd'),
    getYouTubeThumbnail(youtubeId, 'default'),
  ];
}

/**
 * Obtiene la mejor URL de miniatura disponible para una canción
 * Si la canción tiene youtubeId, genera la URL automáticamente
 * Si tiene coverUrl, la usa directamente
 * 
 * @param song - Objeto de canción con youtubeId y/o coverUrl
 * @returns URL de la imagen o string vacío
 */
export function getSongCoverUrl(song: { youtubeId?: string; coverUrl?: string }): string {
  // Si tiene coverUrl, usarla primero
  if (song.coverUrl && song.coverUrl.trim() && !song.coverUrl.includes('via.placeholder.com')) {
    return song.coverUrl;
  }

  // Si tiene youtubeId, generar URL automáticamente
  if (song.youtubeId) {
    return getYouTubeThumbnail(song.youtubeId, 'maxres');
  }

  // Si no tiene nada, retornar string vacío
  return '';
}


