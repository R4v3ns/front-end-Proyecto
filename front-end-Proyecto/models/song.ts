export interface Song {
  id: number;
  title: string;
  artist: string;
  duration: number; // en segundos
  coverUrl: string;
  audioUrl: string;
  createdAt: string;
  updatedAt: string;
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
}

