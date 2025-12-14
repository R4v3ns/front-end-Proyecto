export interface Podcast {
  id: number;
  title: string;
  description: string;
  coverUrl: string;
  publisher: string;
  totalEpisodes: number;
  category: string;
  isFollowing?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PodcastsResponse {
  ok: boolean;
  podcasts: Podcast[];
}

export interface PodcastResponse {
  ok: boolean;
  podcast: Podcast;
}

export interface Episode {
  id: number;
  podcastId: number;
  title: string;
  description: string;
  audioUrl: string;
  coverUrl: string;
  duration: number; // en segundos
  releaseDate: string;
  isPlayed?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EpisodesResponse {
  ok: boolean;
  episodes: Episode[];
}

export interface EpisodeResponse {
  ok: boolean;
  episode: Episode;
}




