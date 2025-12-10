import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Song, PlayerState } from '@/models/song';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';

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
    isLoading: false,
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
    let timeoutId: ReturnType<typeof setTimeout>;
    
    // Si no está reproduciendo y hay un sonido cargado, descargarlo después de 2 segundos
    if (!playerState.isPlaying && soundRef.current && playerState.currentSong) {
      timeoutId = setTimeout(async (): Promise<void> => {
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

  // Función para convertir URL de YouTube a audio directo
  const getYouTubeAudioUrl = (youtubeUrl: string, youtubeId?: string): string => {
    // Extraer ID de YouTube de la URL si no se proporciona
    const videoId = youtubeId || youtubeUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
    
    if (!videoId) {
      console.error('No se pudo extraer el ID de YouTube');
      return youtubeUrl;
    }

    // Usar un servicio público para convertir YouTube a audio
    // Nota: Estos servicios pueden tener limitaciones. En producción, usa tu propio backend.
    // Opción 1: Usar yt-dlp-server o similar en tu backend
    // Opción 2: Usar un servicio público (puede no ser confiable)
    // Por ahora, usamos el ID para construir una URL que el backend puede procesar
    return `https://www.youtube.com/watch?v=${videoId}`;
  };

  // Cargar y reproducir canción
  const loadAndPlaySong = async (song: Song, index: number) => {
    if (isLoadingRef.current) return;
    isLoadingRef.current = true;

    // ACTUALIZAR ESTADO INMEDIATAMENTE - Esto hace que la UI se actualice al instante
    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      currentIndex: index,
      isLoading: true,
      isPlaying: false, // Pausar hasta que el audio esté listo
    }));

    // Detectar si es una URL de YouTube (fuera del try para usarlo en el catch)
    const isYouTube = song.audioUrl.includes('youtube.com') || song.audioUrl.includes('youtu.be') || !!song.youtubeId;

    try {
      // Descargar sonido anterior
      if (soundRef.current) {
        await soundRef.current.unloadAsync();
        soundRef.current = null;
      }
      
      let audioUri = song.audioUrl;
      
      if (isYouTube) {
        const youtubeId = song.youtubeId || song.audioUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
        
        if (youtubeId) {
          console.log('🎵 YouTube detectado, extrayendo audio...');
          console.log('   - YouTube ID extraído:', youtubeId);
          console.log('   - YouTube ID de la canción:', song.youtubeId);
          
          // SIEMPRE usar el youtubeId de la canción si está disponible (es más confiable)
          // Solo usar el extraído de la URL como fallback
          const finalYoutubeId = song.youtubeId || youtubeId;
          
          // Verificar que el youtubeId extraído coincida con el de la canción
          if (song.youtubeId && youtubeId && youtubeId !== song.youtubeId) {
            console.warn('⚠️ ADVERTENCIA: El YouTube ID extraído de la URL no coincide con el de la canción!');
            console.warn('   - ID de la canción (usado):', song.youtubeId);
            console.warn('   - ID extraído de URL (ignorado):', youtubeId);
          }
          
          try {
            // Primero hacer una petición al endpoint para obtener la URL del audio convertido
            const endpointUrl = `${API_BASE_URL}${ENDPOINTS.MUSIC.YOUTUBE_AUDIO(finalYoutubeId)}`;
            
            // Hacer petición HTTP GET al endpoint (timeout más corto para respuesta más rápida)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos timeout
            
            try {
              const response = await fetch(endpointUrl, {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                },
                signal: controller.signal,
              });
              
              clearTimeout(timeoutId);

              if (!response.ok) {
                throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
              }

              const data = await response.json();
              
              if (data.ok && data.audioUrl) {
                audioUri = data.audioUrl;
              } else {
                throw new Error(data.error || 'No se pudo obtener la URL del audio');
              }
            } catch (fetchError: any) {
              clearTimeout(timeoutId);
              if (fetchError.name === 'AbortError') {
                throw new Error('Timeout: El servidor tardó demasiado en responder');
              }
              throw fetchError;
            }
          } catch (error: any) {
            console.error('❌ Error al obtener URL de audio del backend:', error.message);
            throw new Error(`No se pudo obtener el audio: ${error.message}`);
          }
        } else {
          console.error('❌ No se pudo extraer el YouTube ID de la URL:', song.audioUrl);
          throw new Error('YouTube ID no válido');
        }
      }

      // Validar que la URI sea válida antes de intentar cargar
      if (!audioUri || (!audioUri.startsWith('http://') && !audioUri.startsWith('https://'))) {
        throw new Error('URL de audio inválida');
      }

      // Crear nuevo sonido
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
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
        isLoading: false, // Audio cargado y reproduciendo
      }));

      // Guardar en localStorage
    } catch (error: any) {
      console.error('Error cargando canción:', error);
      
      setPlayerState(prev => ({ 
        ...prev, 
        isPlaying: false,
        currentSong: song, // Mantener la canción seleccionada aunque no se pueda reproducir
        currentIndex: index,
        isLoading: false, // Error, dejar de mostrar loading
      }));
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
      // Cargar en segundo plano sin bloquear
      loadAndPlaySong(song, index).catch(error => {
        console.error('Error al reproducir canción:', error);
      });
    } else {
      // Si no está en la playlist, agregarla temporalmente
      const tempIndex = currentPlaylist.length;
      playlistRef.current = [...currentPlaylist, song];
      loadAndPlaySong(song, tempIndex).catch(error => {
        console.error('Error al reproducir canción:', error);
      });
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

