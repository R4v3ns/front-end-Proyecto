export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number; // en segundos
  coverUrl: string;
  audioUrl: string;
  youtubeId?: string; // ID de YouTube si la canción viene de YouTube
  isExample?: boolean; // Indica si es una canción de ejemplo (no reproducible pero agregable a favoritos)
  createdAt?: string;
  updatedAt?: string;
}

export interface SongsResponse {
  ok: boolean;
  songs: Song[];
}

export interface SongResponse {
  ok: boolean;
  song: Song;
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isShuffle: boolean;
  repeatMode: 'off' | 'all' | 'one';
  playlist: Song[];
  currentIndex: number;
  isLoading: boolean; // Estado de carga del audio
}

