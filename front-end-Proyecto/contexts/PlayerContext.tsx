import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSongs } from '@/hooks/useSongs';
import { useQueue } from '@/hooks/useQueue';
import { useAuth } from './AuthContext';
import { exampleSongs } from '@/data/exampleSongs';
import { Song } from '@/models/song';

interface PlayerContextType {
  playerState: any;
  togglePlayPause: () => Promise<void>;
  handleNext: () => Promise<void>;
  handlePrevious: () => Promise<void>;
  seekTo: (timeInSeconds: number) => Promise<void>;
  playSong: (song: Song) => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => Promise<void>;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { songs: apiSongs } = useSongs();
  const { isAuthenticated } = useAuth();
  
  // Obtener la cola (si falla por falta de autenticación, será array vacío)
  const { queue = [] } = useQueue();
  
  // Combinar canciones del API con canciones de ejemplo
  const defaultSongs = React.useMemo(() => {
    const combined = [...exampleSongs];
    apiSongs.forEach(apiSong => {
      if (!combined.find(s => s.id === apiSong.id)) {
        combined.push(apiSong);
      }
    });
    return combined;
  }, [apiSongs]);

  // Si hay cola y está autenticado, usar la cola como playlist
  // Si no hay cola, usar las canciones por defecto
  const songs = useMemo(() => {
    if (isAuthenticated && queue && queue.length > 0) {
      console.log('🎵 [PlayerContext] Usando cola como playlist:', queue.length, 'canciones');
      // Convertir QueueItem[] a Song[]
      return queue.map(item => item.song);
    }
    console.log('🎵 [PlayerContext] Usando canciones por defecto:', defaultSongs.length, 'canciones');
    return defaultSongs;
  }, [isAuthenticated, queue, defaultSongs]);

  // Usar el hook useAudioPlayer - esto crea una instancia única del reproductor
  const player = useAudioPlayer(songs);

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
}
