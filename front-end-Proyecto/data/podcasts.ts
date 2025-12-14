export interface Podcast {
  id: string;
  title: string;
  coverUrl: string;
  description?: string;
  audioUrl?: string;
}

/**
 * Podcasts de ejemplo
 * En el futuro estos vendrán del backend
 */
export const examplePodcasts: Podcast[] = [
  {
    id: 'podcast-1',
    title: 'Música Latina',
    coverUrl: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/maxresdefault.jpg',
    description: 'Los mejores éxitos latinos',
  },
  {
    id: 'podcast-2',
    title: 'Hip Hop Urbano',
    coverUrl: 'https://i.ytimg.com/vi/W0yp3rSfx3I/maxresdefault.jpg',
    description: 'Trap y rap contemporáneo',
  },
  {
    id: 'podcast-3',
    title: 'Rock Alternativo',
    coverUrl: 'https://i.ytimg.com/vi/Y8N2jOPVqus/maxresdefault.jpg',
    description: 'Alternativo y indie',
  },
  {
    id: 'podcast-4',
    title: 'Pop en Español',
    coverUrl: 'https://i.ytimg.com/vi/DiItGE3eAyQ/maxresdefault.jpg',
    description: 'Lo mejor del pop latino',
  },
];



