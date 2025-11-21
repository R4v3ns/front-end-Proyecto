import { useQuery } from '@tanstack/react-query';
import { MusicService } from '@/services/music';

export const useSongs = () => {
  const {
    data: songs = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['songs'],
    queryFn: MusicService.getAllSongs,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    songs,
    isLoading,
    error,
    refetch,
  };
};

