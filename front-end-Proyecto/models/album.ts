export interface Album {
  id: number;
  title: string;
  artist: string;
  artistId: number;
  coverUrl: string;
  releaseDate: string;
  genre: string;
  genreId: number;
  totalTracks: number;
  duration: number; // en segundos
  createdAt: string;
  updatedAt: string;
}

export interface AlbumsResponse {
  ok: boolean;
  albums: Album[];
}

export interface AlbumResponse {
  ok: boolean;
  album: Album;
}




