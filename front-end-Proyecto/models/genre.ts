export interface Genre {
  id: number;
  name: string;
  imageUrl?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenresResponse {
  ok: boolean;
  genres: Genre[];
}

export interface GenreResponse {
  ok: boolean;
  genre: Genre;
}




