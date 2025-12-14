import { Song } from './song';

export interface Playlist {
  id: number;
  name: string;
  description?: string;
  coverUrl?: string;
  isPublic: boolean;
  songCount: number;
  duration: number; // en segundos
  userId: number;
  createdAt: string;
  updatedAt: string;
  songs?: Song[];
}

export interface PlaylistsResponse {
  ok: boolean;
  playlists: Playlist[];
}

export interface PlaylistResponse {
  ok: boolean;
  playlist: Playlist;
}

export interface LikedSongsResponse {
  ok: boolean;
  songs: Song[];
  total: number;
}



