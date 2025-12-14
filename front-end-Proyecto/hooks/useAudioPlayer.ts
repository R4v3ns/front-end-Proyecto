import { useState, useEffect, useRef, useCallback } from 'react';
import { Audio } from 'expo-av';
import { Song, PlayerState } from '@/models/song';
import { API_BASE_URL, ENDPOINTS } from '@/config/api';
import { showToast } from '@/components/ui/toast';

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
  const savedPositionRef = useRef<number>(0); // Guardar posición cuando se descarga el audio
  
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
    
    // Si no está reproduciendo y hay un sonido cargado, descargarlo después de 5 segundos
    // (aumentado de 2 a 5 segundos para evitar descargas innecesarias)
    if (!playerState.isPlaying && soundRef.current && playerState.currentSong) {
      timeoutId = setTimeout(async (): Promise<void> => {
        if (!playerStateRef.current.isPlaying && soundRef.current) {
          try {
            // Guardar la posición actual antes de descargar
            const status = await soundRef.current.getStatusAsync();
            if (status.isLoaded) {
              savedPositionRef.current = status.positionMillis / 1000; // Guardar en segundos
              console.log(`💾 Guardando posición antes de descargar: ${savedPositionRef.current.toFixed(2)}s`);
            }
            await soundRef.current.unloadAsync();
            soundRef.current = null;
            console.log('Audio descargado para evitar pitidos');
          } catch (error) {
            console.error('Error descargando audio:', error);
          }
        }
      }, 5000); // 5 segundos de pausa antes de descargar
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
            // En modo shuffle, solo seleccionar canciones (excluir podcasts)
            const playableSongs = currentPlaylist.filter(song => !song.isExample);
            
            if (playableSongs.length === 0) {
              // Si no hay canciones reproducibles, usar toda la playlist
              nextIndex = Math.floor(Math.random() * currentPlaylist.length);
            } else {
              // Seleccionar una canción aleatoria de las reproducibles
              const randomSong = playableSongs[Math.floor(Math.random() * playableSongs.length)];
              nextIndex = currentPlaylist.findIndex(song => song.id === randomSong.id);
              
              // Si la canción actual es la misma que la seleccionada y hay más de una canción, seleccionar otra
              if (nextIndex === state.currentIndex && playableSongs.length > 1) {
                const otherSongs = playableSongs.filter(song => song.id !== randomSong.id);
                const newRandomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
                nextIndex = currentPlaylist.findIndex(song => song.id === newRandomSong.id);
              }
            }
          } else {
            nextIndex = (state.currentIndex + 1) % currentPlaylist.length;
          }

          // Si repeatMode es 'off' y llegamos al final, detener
          // En modo shuffle, considerar solo las canciones reproducibles
          const playableSongsForStop = state.isShuffle 
            ? currentPlaylist.filter(song => !song.isExample)
            : currentPlaylist;
          
          // Verificar si se llegó al final de las canciones reproducibles
          const isAtEnd = playableSongsForStop.length > 0 && 
            state.currentIndex >= 0 &&
            currentPlaylist[state.currentIndex]?.id === playableSongsForStop[playableSongsForStop.length - 1]?.id &&
            nextIndex >= 0 &&
            currentPlaylist[nextIndex]?.id === playableSongsForStop[playableSongsForStop.length - 1]?.id;
          
          if (
            state.repeatMode === 'off' &&
            isAtEnd
          ) {
            if (soundRef.current) {
              await soundRef.current.stopAsync();
              await soundRef.current.unloadAsync(); // Descargar completamente para evitar pitidos
              soundRef.current = null;
            }
            setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
            return;
          }

          // Cargar siguiente canción (limpiar posición guardada al cambiar de canción)
          savedPositionRef.current = 0;
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
    // Si ya hay una carga en progreso para la misma canción, ignorar
    if (isLoadingRef.current && playerStateRef.current.currentSong?.id === song.id) {
      console.log('⚠️ loadAndPlaySong - Ya hay una carga en progreso para esta canción, ignorando...');
      return;
    }
    
    // Si hay una carga en progreso para otra canción, esperar a que termine o forzar detención
    if (isLoadingRef.current && playerStateRef.current.currentSong?.id !== song.id) {
      console.log('⚠️ loadAndPlaySong - Hay otra canción cargándose, deteniendo y esperando...');
      // Forzar detención del audio anterior
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.warn('⚠️ Error al forzar detención:', error);
        }
        soundRef.current = null;
      }
      // Esperar un poco más para asegurar que todo se limpie
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // RESETEAR posición guardada cuando se cambia de canción
    const previousSongId = playerStateRef.current.currentSong?.id;
    if (previousSongId !== song.id) {
      savedPositionRef.current = 0;
      console.log('🔄 loadAndPlaySong - Reseteando posición guardada (cambio de canción)');
    }
    
    isLoadingRef.current = true;

    console.log(`🎵 loadAndPlaySong - Iniciando carga de canción: ${song.title} (index: ${index})`);

    // ACTUALIZAR ESTADO INMEDIATAMENTE - Esto hace que la UI se actualice al instante
    setPlayerState(prev => ({
      ...prev,
      currentSong: song,
      currentIndex: index,
      currentTime: 0, // Resetear tiempo al cambiar de canción
      isLoading: true,
      isPlaying: false, // Pausar hasta que el audio esté listo
    }));

    // Detectar si es una URL de YouTube (fuera del try para usarlo en el catch)
    const isYouTube = song.audioUrl.includes('youtube.com') || song.audioUrl.includes('youtu.be') || !!song.youtubeId;

    try {
      // IMPORTANTE: Detener y descargar completamente el sonido anterior ANTES de cargar el nuevo
      if (soundRef.current) {
        console.log('🛑 loadAndPlaySong - Deteniendo y descargando audio anterior...');
        try {
          // Primero pausar si está reproduciendo
          const status = await soundRef.current.getStatusAsync();
          if (status.isLoaded && status.isPlaying) {
            await soundRef.current.pauseAsync();
          }
        } catch (pauseError) {
          console.warn('⚠️ Error al pausar audio anterior:', pauseError);
        }
        
        try {
          await soundRef.current.stopAsync();
        } catch (stopError) {
          console.warn('⚠️ Error al detener audio anterior (puede que ya esté detenido):', stopError);
        }
        
        try {
          await soundRef.current.unloadAsync();
        } catch (unloadError) {
          console.warn('⚠️ Error al descargar audio anterior (puede que ya esté descargado):', unloadError);
        }
        
        soundRef.current = null;
        console.log('✅ loadAndPlaySong - Audio anterior descargado completamente');
        
        // Pausa más larga para asegurar que el audio anterior se haya liberado completamente
        await new Promise(resolve => setTimeout(resolve, 300));
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

      // Verificar una vez más que todavía estamos cargando esta canción antes de crear el sonido
      if (!isLoadingRef.current || soundRef.current !== null || playerStateRef.current.currentSong?.id !== song.id) {
        console.warn('⚠️ loadAndPlaySong - La canción cambió o hay otro audio, cancelando carga...');
        isLoadingRef.current = false;
        return;
      }
      
      console.log(`🎵 loadAndPlaySong - Cargando nuevo audio desde: ${audioUri.substring(0, 50)}...`);
      
      // SIEMPRE comenzar desde 0 cuando se carga una nueva canción
      // La posición guardada solo se usa para pausar/reanudar la MISMA canción
      const startPosition = 0; // Siempre comenzar desde el principio
      
      // Crear nuevo sonido SIN reproducir automáticamente
      // Reproduciremos manualmente después de que esté completamente cargado
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: false, // NO reproducir automáticamente
          volume: playerStateRef.current.volume,
          isMuted: false,
          positionMillis: 0, // SIEMPRE comenzar desde el principio
        },
        onPlaybackStatusUpdate
      );

      // Verificar una última vez que todavía estamos cargando esta canción
      // y que no hay otro audio ya cargado
      if (isLoadingRef.current && soundRef.current === null && playerStateRef.current.currentSong?.id === song.id) {
        soundRef.current = sound;
        
        // Asegurar que la canción comience desde 0
        try {
          await sound.setPositionAsync(0);
        } catch (seekError) {
          console.warn('⚠️ Error al establecer posición inicial:', seekError);
        }
        
        // Actualizar el estado ANTES de reproducir
        setPlayerState(prev => ({
          ...prev,
          currentSong: song,
          currentIndex: index,
          currentTime: 0, // SIEMPRE comenzar desde 0
          isLoading: false, // Audio cargado
          isPlaying: false, // Aún no está reproduciendo, lo iniciaremos manualmente
        }));
        
        // Ahora reproducir manualmente después de que el estado esté actualizado
        try {
          await sound.playAsync();
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true,
          }));
          console.log(`✅ loadAndPlaySong - Audio cargado y reproduciendo desde el inicio: ${song.title}`);
        } catch (playError) {
          console.error('❌ Error al iniciar reproducción después de cargar:', playError);
          setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
          }));
        }
      } else {
        // Si hay otro audio cargándose o la canción cambió, descargar este
        console.warn('⚠️ loadAndPlaySong - Se detectó cambio de canción o audio duplicado, descargando este audio...');
        try {
          await sound.unloadAsync();
        } catch (unloadError) {
          console.warn('⚠️ Error al descargar audio duplicado:', unloadError);
        }
        // No actualizar el estado si se descargó porque ya hay otro audio
        isLoadingRef.current = false;
      }

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
    
    // Si no hay audio cargado, cargar la canción actual o la primera
    if (!soundRef.current) {
      if (state.currentSong) {
        // Si hay una posición guardada para esta canción, se restaurará automáticamente
        await loadAndPlaySong(state.currentSong, state.currentIndex);
      } else if (currentPlaylist.length > 0) {
        await loadAndPlaySong(currentPlaylist[0], 0);
      }
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        console.warn('⚠️ togglePlayPause - Audio no está cargado');
        return;
      }

      if (state.isPlaying) {
        // Pausar y guardar la posición actual
        const currentPosition = status.positionMillis / 1000; // Guardar en segundos
        savedPositionRef.current = currentPosition;
        console.log(`⏸️ Pausando en posición: ${savedPositionRef.current.toFixed(2)}s`);
        
        await soundRef.current.pauseAsync();
        setPlayerState(prev => ({
          ...prev,
          isPlaying: false,
        }));
      } else {
        // Reanudar desde donde se pausó (usar la posición guardada o la actual del audio)
        const resumePosition = savedPositionRef.current > 0 
          ? savedPositionRef.current 
          : status.positionMillis / 1000;
        
        console.log(`▶️ Reanudando desde posición: ${resumePosition.toFixed(2)}s`);
        
        // Asegurar que estamos en la posición correcta antes de reproducir
        if (Math.abs(status.positionMillis / 1000 - resumePosition) > 0.5) {
          await soundRef.current.setPositionAsync(resumePosition * 1000);
        }
        
        await soundRef.current.playAsync();
        setPlayerState(prev => ({
          ...prev,
          isPlaying: true,
          currentTime: resumePosition,
        }));
      }
    } catch (error) {
      console.error('Error toggle play/pause:', error);
      // Si hay un error, intentar recargar la canción
      if (state.currentSong) {
        await loadAndPlaySong(state.currentSong, state.currentIndex);
      }
    }
  };

  // Siguiente canción (para uso manual del usuario)
  const handleNext = async () => {
    const state = playerStateRef.current;
    const currentPlaylist = playlistRef.current;
    
    if (currentPlaylist.length === 0) return;

    // Si ya hay una carga en progreso, no hacer nada
    if (isLoadingRef.current) {
      console.log('⚠️ handleNext - Ya hay una carga en progreso, ignorando...');
      return;
    }

    let nextIndex: number;

    if (state.isShuffle) {
      // En modo shuffle, solo seleccionar canciones (excluir podcasts)
      const playableSongs = currentPlaylist.filter(song => !song.isExample);
      
      if (playableSongs.length === 0) {
        // Si no hay canciones reproducibles, usar toda la playlist
        nextIndex = Math.floor(Math.random() * currentPlaylist.length);
      } else {
        // Seleccionar una canción aleatoria de las reproducibles
        const randomSong = playableSongs[Math.floor(Math.random() * playableSongs.length)];
        nextIndex = currentPlaylist.findIndex(song => song.id === randomSong.id);
        
        // Si la canción actual es la misma que la seleccionada y hay más de una canción, seleccionar otra
        if (nextIndex === state.currentIndex && playableSongs.length > 1) {
          const otherSongs = playableSongs.filter(song => song.id !== randomSong.id);
          const newRandomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
          nextIndex = currentPlaylist.findIndex(song => song.id === newRandomSong.id);
        }
      }
    } else {
      nextIndex = (state.currentIndex + 1) % currentPlaylist.length;
    }

    // Si repeatMode es 'off' y llegamos al final, detener
    // En modo shuffle, considerar solo las canciones reproducibles
    const playableSongsForStop = state.isShuffle 
      ? currentPlaylist.filter(song => !song.isExample)
      : currentPlaylist;
    
    // Verificar si se llegó al final de las canciones reproducibles
    const isAtEnd = playableSongsForStop.length > 0 && 
      state.currentIndex >= 0 &&
      currentPlaylist[state.currentIndex]?.id === playableSongsForStop[playableSongsForStop.length - 1]?.id &&
      nextIndex >= 0 &&
      currentPlaylist[nextIndex]?.id === playableSongsForStop[playableSongsForStop.length - 1]?.id;
    
    if (
      state.repeatMode === 'off' &&
      isAtEnd
    ) {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
        await soundRef.current.unloadAsync(); // Descargar completamente
        soundRef.current = null;
      }
      setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }));
      return;
    }

    // Limpiar posición guardada al cambiar de canción
    savedPositionRef.current = 0;
    console.log(`⏭️ handleNext - Cambiando a siguiente canción (índice ${nextIndex})`);
    await loadAndPlaySong(currentPlaylist[nextIndex], nextIndex);
  };

  // Canción anterior
  const handlePrevious = async () => {
    const currentPlaylist = playlistRef.current;
    const state = playerStateRef.current;
    
    if (currentPlaylist.length === 0) return;

    // Si ya hay una carga en progreso, no hacer nada
    if (isLoadingRef.current) {
      console.log('⚠️ handlePrevious - Ya hay una carga en progreso, ignorando...');
      return;
    }

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

    // Limpiar posición guardada al cambiar de canción
    savedPositionRef.current = 0;
    console.log(`⏮️ handlePrevious - Cambiando a canción anterior (índice ${prevIndex})`);
    await loadAndPlaySong(currentPlaylist[prevIndex], prevIndex);
  };

  // Buscar en la canción
  const seekTo = async (timeInSeconds: number) => {
    if (!soundRef.current) {
      console.warn('⚠️ seekTo - No hay audio cargado');
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        console.warn('⚠️ seekTo - Audio no está cargado');
        return;
      }

      const wasPlaying = status.isPlaying;
      const targetPositionMillis = timeInSeconds * 1000;

      console.log(`🎯 seekTo - Buscando a ${timeInSeconds.toFixed(2)}s (estaba reproduciendo: ${wasPlaying})`);

      // Actualizar la posición
      await soundRef.current.setPositionAsync(targetPositionMillis);

      // Actualizar la posición guardada para que si se pausa y reanuda, continúe desde aquí
      savedPositionRef.current = timeInSeconds;

      // Actualizar el estado inmediatamente
      setPlayerState(prev => ({
        ...prev,
        currentTime: timeInSeconds,
      }));

      // Si estaba reproduciendo antes del seek, continuar reproduciendo
      if (wasPlaying) {
        try {
          // Pequeño delay para asegurar que la posición se estableció correctamente
          await new Promise(resolve => setTimeout(resolve, 50));
          await soundRef.current.playAsync();
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true,
            currentTime: timeInSeconds,
          }));
          console.log(`✅ seekTo - Continuando reproducción desde ${timeInSeconds.toFixed(2)}s`);
        } catch (playError) {
          console.warn('⚠️ seekTo - Error al continuar reproducción después del seek:', playError);
          // Si falla, al menos mantener el estado actualizado
          setPlayerState(prev => ({
            ...prev,
            isPlaying: false,
            currentTime: timeInSeconds,
          }));
        }
      } else {
        console.log(`✅ seekTo - Posición actualizada a ${timeInSeconds.toFixed(2)}s (pausado)`);
      }
    } catch (error) {
      console.error('❌ Error seeking:', error);
      // Actualizar el estado de todas formas para que la UI refleje el cambio
      setPlayerState(prev => ({
        ...prev,
        currentTime: timeInSeconds,
      }));
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
      
      // Mostrar notificación toast
      if (newIsShuffle) {
        showToast('Modo aleatorio activado (solo canciones)', 'success', 2500);
      } else {
        showToast('Modo aleatorio desactivado', 'info', 2000);
      }
      
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

      // Mostrar notificación toast según el modo
      if (nextMode === 'all') {
        showToast('Modo bucle activado', 'success', 2000);
      } else if (nextMode === 'one') {
        showToast('Repetir una canción activado', 'success', 2000);
      } else {
        showToast('Modo bucle desactivado', 'info', 2000);
      }

      return { ...prev, repeatMode: nextMode };
    });
  };

  // Reproducir canción específica
  const playSong = async (song: Song) => {
    // Los podcasts (isExample: true) SÍ se pueden reproducir, solo se excluyen de canciones destacadas
    // No hay restricción aquí
    
    const currentPlaylist = playlistRef.current;
    const state = playerStateRef.current;
    
    // Si es la misma canción que está reproduciendo, solo hacer toggle play/pause
    if (state.currentSong?.id === song.id && soundRef.current) {
      console.log('🎵 playSong - Es la misma canción, haciendo toggle play/pause');
      await togglePlayPause();
      return;
    }
    
    // Si es una canción diferente, detener completamente el audio anterior primero
    if (state.currentSong && state.currentSong.id !== song.id && soundRef.current) {
      console.log('🛑 playSong - Cambiando de canción, deteniendo audio anterior...');
      try {
        // Detener y descargar el audio anterior de forma síncrona antes de continuar
        const currentSound = soundRef.current;
        soundRef.current = null; // Limpiar la referencia inmediatamente para evitar conflictos
        
        try {
          await currentSound.stopAsync();
        } catch (stopError) {
          console.warn('⚠️ Error al detener en playSong:', stopError);
        }
        
        try {
          await currentSound.unloadAsync();
        } catch (unloadError) {
          console.warn('⚠️ Error al descargar en playSong:', unloadError);
        }
        
        // Esperar a que se limpie completamente
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('✅ playSong - Audio anterior detenido completamente');
      } catch (error) {
        console.error('❌ Error al detener audio anterior en playSong:', error);
      }
    }
    
    // SIEMPRE limpiar posición guardada al cambiar de canción
    if (state.currentSong?.id !== song.id) {
      savedPositionRef.current = 0;
      console.log('🔄 playSong - Reseteando posición guardada (cambio de canción)');
    }
    
    const index = currentPlaylist.findIndex(s => s.id === song.id);
    
    if (index !== -1) {
      // Cargar en segundo plano sin bloquear
      loadAndPlaySong(song, index).catch(error => {
        console.error('Error al reproducir canción:', error);
        isLoadingRef.current = false;
      });
    } else {
      // Si no está en la playlist, agregarla temporalmente
      const tempIndex = currentPlaylist.length;
      playlistRef.current = [...currentPlaylist, song];
      loadAndPlaySong(song, tempIndex).catch(error => {
        console.error('Error al reproducir canción:', error);
        isLoadingRef.current = false;
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

