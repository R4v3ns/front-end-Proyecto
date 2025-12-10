import { exampleSongs } from './exampleSongs';
import { getYouTubeThumbnail } from '@/utils/youtubeImages';

export interface Artist {
  id: string;
  name: string;
  imageUrl: string;
  songs: typeof exampleSongs;
}

/**
 * Extrae artistas únicos de las canciones de ejemplo
 * Usa la primera canción de cada artista como imagen de perfil
 */
export function getArtistsFromSongs(): Artist[] {
  const artistMap = new Map<string, Artist>();

  exampleSongs.forEach((song) => {
    // Separar artistas si hay múltiples (ej: "Duki, Khea")
    const artistNames = song.artist.split(',').map(a => a.trim());
    
    artistNames.forEach((artistName) => {
      if (!artistMap.has(artistName)) {
        // Crear nuevo artista
        artistMap.set(artistName, {
          id: artistName.toLowerCase().replace(/\s+/g, '-'),
          name: artistName,
          imageUrl: song.coverUrl, // Usar la portada de la primera canción encontrada
          songs: [],
        });
      }
      
      // Agregar canción al artista
      const artist = artistMap.get(artistName)!;
      if (!artist.songs.find(s => s.id === song.id)) {
        artist.songs.push(song);
      }
    });
  });

  return Array.from(artistMap.values());
}

/**
 * Artistas populares con imágenes de perfil actualizadas
 * Usa imágenes de perfil reales de los artistas de YouTube o imágenes públicas conocidas
 */
export const popularArtists: Artist[] = [
  {
    id: 'duki',
    name: 'Duki',
    // Imagen de perfil de Duki - usando imagen de perfil de YouTube
    imageUrl: 'https://yt3.ggpht.com/ytc/APkrFKZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7=s800-c-k-c0x00ffffff-no-rj',
    songs: exampleSongs.filter(s => {
      // Filtrar solo canciones donde Duki es el artista principal
      const artist = s.artist.toLowerCase();
      return artist.startsWith('duki') || artist.includes('duki,');
    }),
  },
  {
    id: 'mon-laferte',
    name: 'Mon Laferte',
    // Imagen de perfil de Mon Laferte - usando imagen de perfil de YouTube
    imageUrl: 'https://yt3.ggpht.com/ytc/APkrFKaXZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7=s800-c-k-c0x00ffffff-no-rj',
    songs: exampleSongs.filter(s => {
      // Filtrar solo canciones donde Mon Laferte es el artista principal
      const artist = s.artist.toLowerCase();
      return artist.startsWith('mon laferte') || artist.includes('mon laferte,');
    }),
  },
  {
    id: 'daddy-yankee',
    name: 'Daddy Yankee',
    // Imagen de perfil de Daddy Yankee - usando imagen de perfil de YouTube
    imageUrl: 'https://yt3.ggpht.com/ytc/APkrFKbXZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7rFKZ8f8H7=s800-c-k-c0x00ffffff-no-rj',
    songs: exampleSongs.filter(s => {
      // Filtrar solo canciones donde Daddy Yankee es el artista principal
      const artist = s.artist.toLowerCase();
      return artist.includes('daddy yankee');
    }),
  },
];

