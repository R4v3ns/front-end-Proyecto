import { Song } from './song';
import { Album } from './album';
import { Artist } from './artist';
import { Podcast } from './podcast';
import { Episode } from './podcast';

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
  podcasts: Podcast[];
  episodes: Episode[];
}

export interface SearchResponse {
  ok: boolean;
  results: SearchResults;
  query: string;
  total: number;
}


