import { Song } from '@/models/song';
import { getYouTubeThumbnail } from '@/utils/youtubeImages';

// Canciones que coinciden con la base de datos del backend
// Estas canciones se usan como fallback si el API no está disponible
// IMPORTANTE: Los IDs deben coincidir exactamente con los de la base de datos

export const exampleSongs: Song[] = [
  // Canciones funcionales (reproducibles)
  {
    id: 1,
    title: 'DADDY YANKEE || BZRP Music Sessions #0/66',
    artist: 'Bizarrap, Daddy Yankee',
    coverUrl: getYouTubeThumbnail('qNw8ejrI0nM'),
    audioUrl: 'https://www.youtube.com/watch?v=qNw8ejrI0nM',
    youtubeId: 'qNw8ejrI0nM',
    duration: 160,
    isExample: false,
  },
  {
    id: 2,
    title: 'She Don\'t Give a FO',
    artist: 'Duki, Khea',
    coverUrl: getYouTubeThumbnail('W0yp3rSfx3I'),
    audioUrl: 'https://www.youtube.com/watch?v=W0yp3rSfx3I',
    youtubeId: 'W0yp3rSfx3I',
    duration: 230,
    isExample: false,
  },
  {
    id: 3,
    title: 'Tu Falta De Querer',
    artist: 'Mon Laferte',
    coverUrl: getYouTubeThumbnail('WT-VE9OyAJk'),
    audioUrl: 'https://www.youtube.com/watch?v=WT-VE9OyAJk',
    youtubeId: 'WT-VE9OyAJk',
    duration: 279,
    isExample: false,
  },
  // Podcasts (ejemplos, no reproducibles pero agregables a favoritos)
  {
    id: 4,
    title: 'Casos de Reencarnación y Vidas Pasadas: ¿La Iglesia nos Mintió?',
    artist: 'Podcast Extra Anormal',
    coverUrl: getYouTubeThumbnail('Gx4kOQ3fU-8'),
    audioUrl: 'https://www.youtube.com/watch?v=Gx4kOQ3fU-8',
    youtubeId: 'Gx4kOQ3fU-8',
    duration: 5085,
    isExample: true,
  },
  {
    id: 5,
    title: 'MI MADRE 4BUSÓ DE MI (CON: MARCELA GAVIRIA) I Vos podés el podcast - EP 196',
    artist: 'VOS PODÉS, EL PODCAST!',
    coverUrl: getYouTubeThumbnail('eFQbVvbBr84'),
    audioUrl: 'https://www.youtube.com/watch?v=eFQbVvbBr84',
    youtubeId: 'eFQbVvbBr84',
    duration: 5785,
    isExample: true,
  },
  {
    id: 6,
    title: 'MI HERMANO YEFERSON ME SALVÓ LA VIDA (CON CINTIA COSSIO) I Vos podés el podcast - EP 204',
    artist: 'VOS PODÉS, EL PODCAST!',
    coverUrl: getYouTubeThumbnail('zFL7xHCszJA'),
    audioUrl: 'https://www.youtube.com/watch?v=zFL7xHCszJA',
    youtubeId: 'zFL7xHCszJA',
    duration: 5111,
    isExample: true,
  },
];
