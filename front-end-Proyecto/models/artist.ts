export interface Artist {
  id: number;
  name: string;
  imageUrl: string;
  bio?: string;
  followers?: number;
  genres?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtistsResponse {
  ok: boolean;
  artists: Artist[];
}

export interface ArtistResponse {
  ok: boolean;
  artist: Artist;
}


