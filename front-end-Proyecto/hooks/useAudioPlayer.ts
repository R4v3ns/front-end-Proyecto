import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Song, PlayerState } from '@/models/song';

export const useAudioPlayer = (playlist: Song[]) => {
  const [playerState, setPlayerState] = useState<PlayerState>({
    currentSong: null,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 1,
    isShuffle: false,
    repeatMode: 'off',
    playlist: [],
    currentIndex: -1,
  });

  const soundRef = useRef<Audio.Sound | null>(null);
  const isLoadingRef = useRef(false);
  const audioConfiguredRef = useRef(false);
  const playlistRef = useRef<Song[]>(playlist);
  const playerStateRef = useRef<PlayerState>(playerState);
  
  // Actualizar la referencia de playlist
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);
  
  // Mantener ref actualizado
  useEffect(() => {
    playerStateRef.current = { ...playerState, playlist: playlistRef.current };
  }, [playerState]);

  // Configurar audio mode inicial - Una sola vez al inicio
  useEffect(() => {
    const configureAudio = async () => {
      if (audioConfiguredRef.current) return;
      
      try {
        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: false, // false para evitar pitidos
          shouldDuckAndroid: true,
        });
        audioConfiguredRef.current = true;
      } catch (error) {
        console.error('Error configurando audio:', error);
      }
    };
    configureAudio();
  }, []);

  // Descargar audio cuando está pausado por mucho tiempo para evitar pitidos
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    // Si no está reproduciendo y hay un sonido cargado, descargarlo después de 2 segundos
    if (!playerState.isPlaying && soundRef.current && playerState.currentSong) {
      timeoutId = setTimeout(async () => {
        if (!playerStateRef.current.isPlaying && soundRef.current) {
          try {
            await soundRef.current.unloadAsync();
            soundRef.current = null;
            console.log('Audio descargado para evitar pitidos');
          } catch (error) {
            console.error('Error descargando audio:', error);
          }
        }
      }, 2000); // 2 segundos de pausa antes de descargar
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [playerState.isPlaying, playerState.currentSong]);

  // Actualizar estado de reproducción - SIN useCallback para evitar ciclos
  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPlayerState(prev => ({
        ...prev,
        currentTime: status.positionMillis / 1000,
        duration: status.durationMillis ? status.durationMillis / 1000 : 0,
        isPlaying: status.isPlaying,
      }));

      // Cuando termina la canción, reproducir la siguiente automáticamente
      if (status.didJustFinish && !status.isLooping) {
        // Ejecutar de forma asíncrona sin bloquear
        setTimeout(async () => {
          const state = playerStateRef.current;
          const currentPlaylist = playlistRef.current;
          
          if (currentPlaylist.length === 0) return;

          let nextIndex: number;

          if (state.isShuffle) {
            nextIndex = Math.floor(Math.random() * currentPlaylist.length);
          } else {
            nextIndex = (state.currentIndex + 1) % currentPlaylist.length;
          }

          // Si repeatMode es 'off' y llegamos al final, detener
          if (
            state.repeatMode === 'off' &&
            nextIndex === 0 &&
            state.currentIndex === currentPlaylist.length - 1
          ) {
            if (soundRef.current) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync(); // Descargar completamente para evitar pitidos
              soundRef.current = null;
            }
            setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
            return;
          }

          // Cargar siguiente canción
          const nextSong = currentPlaylist[nextIndex];
          if (nextSong && !isLoadingRef.current) {
            loadAndPlaySong(nextSong, nextIndex);
          }
        }, 100); // Pequeño delay para evitar condiciones de carrera
      }
    }
  };

  // Cargar y reproducir canción
  const loadAndPlaySong = async (song: Song, index: number) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      // Descargar sonido anterior
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }

      // Crear nuevo sonido
      const { sound } = await Audio.Sound.createAsync(
        { uri: song.audioUrl },
        { shouldPlay: true, volume: playerStateRef.current.volume },
        onPlaybackStatusUpdate
      );

      soundRef.current = sound;
      setPlayerState(prev => ({
        ...prev,
        currentSong: song,
        currentIndex: index,
        isPlaying: true,
        currentTime: 0,
      }));

      // Guardar en localStorage
    } catch (error) {
      console.error('Error cargando canción:', error);
      setPlayerState(prev => ({ ...prev, isPlaying: false }));
    } finally {
      isLoadingRef.current = false;
    }
  };

  // Play/Pause
  const togglePlayPause = async () => {
    const currentPlaylist = playlistRef.current;
    const state = playerStateRef.current;
    
    if (!soundRef.current) {
      if (state.currentSong) {
        await loadAndPlaySong(state.currentSong, state.currentIndex);
      } else if (currentPlaylist.length > 0) {
        await loadAndPlaySong(currentPlaylist[0], 0);
      }
      return;
    }

    try {
      if (state.isPlaying) {
        await soundRef.current.pauseAsync();
      } else {
        await soundRef.current.playAsync();
      }
    } catch (error) {
      console.error('Error toggle play/pause:', error);
    }
  };

  // Siguiente canción (para uso manual del usuario)
  const handleNext = async () => {
    const state = playerStateRef.current;
    const currentPlaylist = playlistRef.current;
    
    if (currentPlaylist.length === 0) return;

    let nextIndex: number;

    if (state.isShuffle) {
      nextIndex = Math.floor(Math.random() * currentPlaylist.length);
    } else {
      nextIndex = (state.currentIndex + 1) % currentPlaylist.length;
    }

    // Si repeatMode es 'off' y llegamos al final, detener
    if (
      state.repeatMode === 'off' &&
      nextIndex === 0 &&
      state.currentIndex === currentPlaylist.length - 1
    ) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync(); // Descargar completamente
        soundRef.current = null;
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      return;
    }

    await loadAndPlaySong(currentPlaylist[nextIndex], nextIndex);
  };

  // Canción anterior
  const handlePrevious = async () => {
    const currentPlaylist = playlistRef.current;
    const state = playerStateRef.current;
    
    if (currentPlaylist.length === 0) return;

    // Si estamos a más de 3 segundos, reiniciar la canción
    if (state.currentTime > 3) {
      if (soundRef.current) {
        await soundRef.current.setPositionAsync(0);
      }
      return;
    }

    const prevIndex =
      state.currentIndex - 1 < 0
        ? currentPlaylist.length - 1
        : state.currentIndex - 1;

    await loadAndPlaySong(currentPlaylist[prevIndex], prevIndex);
  };

  // Buscar en la canción
  const seekTo = async (timeInSeconds: number) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setPositionAsync(timeInSeconds * 1000);
      } catch (error) {
        console.error('Error seeking:', error);
      }
    }
  };

  // Cambiar volumen
  const setVolume = async (volume: number) => {
    if (soundRef.current) {
      try {
        await soundRef.current.setVolumeAsync(volume);
        setPlayerState(prev => ({ ...prev, volume }));
      } catch (error) {
        console.error('Error setting volume:', error);
      }
    }
  };

  // Toggle shuffle
  const toggleShuffle = () => {
    setPlayerState(prev => {
      const newIsShuffle = !prev.isShuffle;
      console.log('[Player] Shuffle:', newIsShuffle ? 'ON' : 'OFF');
      return { ...prev, isShuffle: newIsShuffle };
    });
  };

  // Toggle repeat
  const toggleRepeat = () => {
    setPlayerState(prev => {
      const modes: Array<'off' | 'all' | 'one'> = ['off', 'all', 'one'];
      const currentIndex = modes.indexOf(prev.repeatMode);
      const nextMode = modes[(currentIndex + 1) % modes.length];

      console.log('[Player] Repeat mode:', nextMode); // off | all | one

      return { ...prev, repeatMode: nextMode };
    });
  };

  // Reproducir canción específica
  const playSong = async (song: Song) => {
    const currentPlaylist = playlistRef.current;
    const index = currentPlaylist.findIndex(s => s.id === song.id);
    if (index !== -1) {
      await loadAndPlaySong(song, index);
    }
  };

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      const cleanup = async () => {
        if (soundRef.current) {
          await soundRef.current.unloadAsync();
          soundRef.current = null;
        }
        // Desactivar el modo de audio al limpiar
        try {
          await Audio.setAudioModeAsync({
            playsInSilentModeIOS: false,
            staysActiveInBackground: false,
            shouldDuckAndroid: false,
          });
        } catch (error) {
          console.error('Error al limpiar audio mode:', error);
        }
      };
      cleanup();
    };
  }, []);

  return {
    playerState: { ...playerState, playlist: playlistRef.current },
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
    setVolume,
    toggleShuffle,
    toggleRepeat,
    playSong,
  };
};

