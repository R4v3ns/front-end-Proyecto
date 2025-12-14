import React, { createContext, useContext, ReactNode } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useSongs } from '@/hooks/useSongs';
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
  
  // Combinar canciones del API con canciones de ejemplo
  const songs = React.useMemo(() => {
    const combined = [...exampleSongs];
    apiSongs.forEach(apiSong => {
      if (!combined.find(s => s.id === apiSong.id)) {
        combined.push(apiSong);
      }
    });
    return combined;
  }, [apiSongs]);

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
