import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PodcastsService } from '@/services/podcasts';
import { Podcast, Episode } from '@/models/podcast';

/**
 * Hook para obtener todos los podcasts
 */
export const usePodcasts = () => {
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['podcasts'],
    queryFn: PodcastsService.getAllPodcasts,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    podcasts,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener un podcast por ID
 */
export const usePodcast = (id: number | null) => {
  const {
    data: podcast = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['podcast', id],
    queryFn: () => (id ? PodcastsService.getPodcastById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    podcast,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener episodios de un podcast
 */
export const usePodcastEpisodes = (podcastId: number | null) => {
  const {
    data: episodes = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Episode[]>({
    queryKey: ['podcastEpisodes', podcastId],
    queryFn: () => (podcastId ? PodcastsService.getEpisodesByPodcastId(podcastId) : []),
    enabled: !!podcastId,
    staleTime: 1000 * 60 * 5,
  });

  return {
    episodes,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para obtener un episodio por ID
 */
export const useEpisode = (id: number | null) => {
  const {
    data: episode = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['episode', id],
    queryFn: () => (id ? PodcastsService.getEpisodeById(id) : null),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });

  return {
    episode,
    isLoading,
    error,
    refetch,
  };
};

/**
 * Hook para seguir un podcast
 */
export const useFollowPodcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (podcastId: number) => PodcastsService.followPodcast(podcastId),
    onSuccess: (_, podcastId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      queryClient.invalidateQueries({ queryKey: ['followingPodcasts'] });
    },
  });
};

/**
 * Hook para dejar de seguir un podcast
 */
export const useUnfollowPodcast = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (podcastId: number) => PodcastsService.unfollowPodcast(podcastId),
    onSuccess: (_, podcastId) => {
      // Invalidar queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['podcast', podcastId] });
      queryClient.invalidateQueries({ queryKey: ['podcasts'] });
      queryClient.invalidateQueries({ queryKey: ['followingPodcasts'] });
    },
  });
};

/**
 * Hook para obtener podcasts que el usuario sigue
 */
export const useFollowingPodcasts = () => {
  const {
    data: podcasts = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Podcast[]>({
    queryKey: ['followingPodcasts'],
    queryFn: PodcastsService.getFollowingPodcasts,
    staleTime: 1000 * 60 * 5,
  });

  return {
    podcasts,
    isLoading,
    error,
    refetch,
  };
};




