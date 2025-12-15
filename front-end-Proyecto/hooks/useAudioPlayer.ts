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
        console.log('🎵 [onPlaybackStatusUpdate] Canción terminó, avanzando a siguiente...');
        // Ejecutar de forma asíncrona sin bloquear
        setTimeout(async () => {
          const state = playerStateRef.current;
          // Asegurar que estamos usando la playlist más actualizada
          const currentPlaylist = playlistRef.current;
          
          console.log('📋 [onPlaybackStatusUpdate] Playlist actual:', currentPlaylist.length, 'canciones. IDs:', currentPlaylist.map(s => s.id));
          
          if (currentPlaylist.length === 0) {
            console.log('⚠️ [onPlaybackStatusUpdate] No hay playlist');
            return;
          }
          
          // Si no hay índice válido, intentar encontrar la canción actual en la playlist
          if (state.currentIndex < 0 && state.currentSong) {
            const foundIndex = currentPlaylist.findIndex(song => song.id === state.currentSong?.id);
            if (foundIndex !== -1) {
              console.log(`🔄 [onPlaybackStatusUpdate] Corrigiendo índice inválido: -1 -> ${foundIndex}`);
              setPlayerState(prev => ({ ...prev, currentIndex: foundIndex }));
            }
          }

          // Si repeatMode es 'one', repetir la misma canción
          if (state.repeatMode === 'one') {
            console.log('🔄 [onPlaybackStatusUpdate] Repetir una canción activado, repitiendo:', state.currentSong?.title);
            savedPositionRef.current = 0;
            
            // Buscar la canción actual en la playlist
            const currentSongIndex = state.currentSong 
              ? currentPlaylist.findIndex(song => song.id === state.currentSong?.id)
              : state.currentIndex;
            
            const currentSong = currentSongIndex !== -1 
              ? currentPlaylist[currentSongIndex]
              : currentPlaylist[state.currentIndex] || currentPlaylist[0];
            
            const songIndex = currentSongIndex !== -1 ? currentSongIndex : (state.currentIndex >= 0 && state.currentIndex < currentPlaylist.length ? state.currentIndex : 0);
            
            if (currentSong && !isLoadingRef.current) {
              loadAndPlaySong(currentSong, songIndex);
            }
            return;
          }

          // Primero, sincronizar el currentIndex con la canción actual en la playlist
          // Esto es importante porque la playlist puede haber cambiado (por ejemplo, si la cola se actualizó)
          let currentActualIndex = state.currentIndex;
          let songFoundInPlaylist = false;
          
          if (state.currentSong && currentPlaylist.length > 0) {
            const foundIndex = currentPlaylist.findIndex(song => song.id === state.currentSong?.id);
            if (foundIndex !== -1) {
              // La canción está en la playlist, usar ese índice
              songFoundInPlaylist = true;
              currentActualIndex = foundIndex;
              // Si el índice guardado es diferente, actualizar el estado
              if (currentActualIndex !== state.currentIndex) {
                console.log(`🔄 [onPlaybackStatusUpdate] Sincronizando índice: ${state.currentIndex} -> ${currentActualIndex}`);
                setPlayerState(prev => ({ ...prev, currentIndex: currentActualIndex }));
              }
            } else {
              // La canción ya no está en la playlist (la cola cambió)
              // Ajustar el índice al último válido para calcular correctamente la siguiente
              console.warn(`⚠️ [onPlaybackStatusUpdate] Canción actual ya no está en la playlist. Ajustando índice...`);
              if (currentActualIndex < 0 || currentActualIndex >= currentPlaylist.length) {
                // Índice fuera de rango, usar el último válido
                currentActualIndex = Math.max(0, currentPlaylist.length - 1);
                console.log(`🔄 [onPlaybackStatusUpdate] Índice ajustado a: ${currentActualIndex}`);
              }
              // Actualizar el estado con el índice ajustado
              setPlayerState(prev => ({ ...prev, currentIndex: currentActualIndex }));
            }
          } else if (currentActualIndex < 0 || currentActualIndex >= currentPlaylist.length) {
            // Si no hay canción actual o el índice es inválido, usar el último índice válido
            currentActualIndex = currentPlaylist.length > 0 ? Math.max(0, currentPlaylist.length - 1) : -1;
            if (currentPlaylist.length > 0) {
              console.log(`🔄 [onPlaybackStatusUpdate] Ajustando índice inválido a: ${currentActualIndex}`);
              setPlayerState(prev => ({ ...prev, currentIndex: currentActualIndex }));
            }
          }

          // Verificar si estamos al final ANTES de calcular nextIndex (para repeatMode 'off')
          // Solo detener si realmente estamos en la última canción Y la canción terminó
          if (state.repeatMode === 'off' && !state.isShuffle && currentActualIndex >= 0 && currentActualIndex < currentPlaylist.length) {
            const isLastPosition = currentActualIndex === currentPlaylist.length - 1;
            // Solo detener si estamos en la última posición Y hay más de una canción
            // (si solo hay una canción, no tiene sentido detener porque ya terminó)
            if (isLastPosition && currentPlaylist.length > 1) {
              // Estamos en la última canción y terminó, con repeat 'off' detener
              console.log('⏹️ [onPlaybackStatusUpdate] Fin de playlist (repeat off), deteniendo. currentActualIndex:', currentActualIndex, 'length:', currentPlaylist.length);
              if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
              }
              setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0, currentIndex: currentActualIndex }));
              return;
            } else if (currentPlaylist.length === 1) {
              // Solo hay una canción, si terminó con repeat 'off', detener
              console.log('⏹️ [onPlaybackStatusUpdate] Única canción terminó (repeat off), deteniendo');
              if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
              }
              setPlayerState(prev => ({ ...prev, isPlaying: false, currentTime: 0, currentIndex: currentActualIndex }));
              return;
            }
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
              if (nextIndex === currentActualIndex && playableSongs.length > 1) {
                const otherSongs = playableSongs.filter(song => song.id !== randomSong.id);
                const newRandomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
                nextIndex = currentPlaylist.findIndex(song => song.id === newRandomSong.id);
              }
            }
          } else {
            // Modo normal: siguiente canción
            // Si el índice actual está fuera de rango, empezar desde 0
            if (currentActualIndex < 0 || currentActualIndex >= currentPlaylist.length) {
              console.warn(`⚠️ [onPlaybackStatusUpdate] Índice actual fuera de rango (${currentActualIndex}), usando índice 0`);
              nextIndex = 0;
            } else {
              // Calcular siguiente índice (con wrap-around si repeatMode es 'all')
              nextIndex = (currentActualIndex + 1) % currentPlaylist.length;
            }
          }
          
          console.log(`🔍 [onPlaybackStatusUpdate] currentIndex: ${state.currentIndex}, currentActualIndex: ${currentActualIndex}, nextIndex: ${nextIndex}, playlist length: ${currentPlaylist.length}, repeatMode: ${state.repeatMode}, isShuffle: ${state.isShuffle}`);

          // Validar que nextIndex sea válido antes de continuar
          if (nextIndex < 0 || nextIndex >= currentPlaylist.length) {
            console.error('❌ [onPlaybackStatusUpdate] Índice siguiente inválido:', nextIndex, 'playlist length:', currentPlaylist.length);
            return;
          }
          // Si repeatMode es 'all' o shuffle, continuar (nextIndex ya se calculó correctamente)
          
          console.log(`✅ [onPlaybackStatusUpdate] Avanzando a siguiente canción - Índice: ${nextIndex}, Canción: ${currentPlaylist[nextIndex]?.title || 'N/A'}`);

          // Cargar siguiente canción (limpiar posición guardada al cambiar de canción)
          savedPositionRef.current = 0;
          const nextSong = currentPlaylist[nextIndex];
          if (!nextSong) {
            console.error('❌ [onPlaybackStatusUpdate] No se encontró la siguiente canción en el índice', nextIndex);
            return;
          }
          
          console.log(`⏭️ [onPlaybackStatusUpdate] Reproduciendo siguiente canción (índice ${nextIndex}):`, nextSong.title);
          
          // Limpiar cualquier carga previa si está bloqueada
          if (isLoadingRef.current) {
            console.log('⚠️ [onPlaybackStatusUpdate] isLoadingRef está activo, limpiando...');
            isLoadingRef.current = false;
          }
          
          // Cargar la siguiente canción directamente
          try {
            await loadAndPlaySong(nextSong, nextIndex);
            console.log(`✅ [onPlaybackStatusUpdate] Siguiente canción cargada exitosamente:`, nextSong.title);
          } catch (error) {
            console.error('❌ [onPlaybackStatusUpdate] Error al cargar siguiente canción:', error);
            isLoadingRef.current = false;
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
    
    // Si hay una carga en progreso para otra canción, limpiar y continuar
    if (isLoadingRef.current && playerStateRef.current.currentSong?.id !== song.id) {
      console.log('⚠️ loadAndPlaySong - Hay otra canción cargándose, limpiando y continuando...');
      // Forzar detención del audio anterior y limpiar el flag
      if (soundRef.current) {
        try {
          await soundRef.current.stopAsync();
          await soundRef.current.unloadAsync();
        } catch (error) {
          console.warn('⚠️ Error al forzar detención:', error);
        }
        soundRef.current = null;
      }
      // Limpiar el flag de carga para permitir la nueva carga
      isLoadingRef.current = false;
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
      
      // Determinar la posición inicial: usar savedPositionRef si hay una posición guardada (para seek o reanudar)
      // Si savedPositionRef es 0, significa que es una nueva canción y debe comenzar desde 0
      const startPositionMillis = savedPositionRef.current > 0 ? savedPositionRef.current * 1000 : 0;
      const shouldStartPlaying = savedPositionRef.current > 0 && playerStateRef.current.isPlaying;
      
      // Crear nuevo sonido SIN reproducir automáticamente
      // Reproduciremos manualmente después de que esté completamente cargado
      const { sound } = await Audio.Sound.createAsync(
        { uri: audioUri },
        { 
          shouldPlay: false, // NO reproducir automáticamente
          volume: playerStateRef.current.volume,
          isMuted: false,
          positionMillis: startPositionMillis, // Usar la posición guardada si existe
        },
        onPlaybackStatusUpdate
      );

      // Verificar una última vez que todavía estamos cargando esta canción
      // y que no hay otro audio ya cargado
      if (isLoadingRef.current && soundRef.current === null && playerStateRef.current.currentSong?.id === song.id) {
        soundRef.current = sound;
        
        // Asegurar que la canción esté en la posición correcta
        try {
          if (startPositionMillis > 0) {
            await sound.setPositionAsync(startPositionMillis);
            console.log(`🎯 loadAndPlaySong - Posicionando en ${savedPositionRef.current.toFixed(2)}s`);
          } else {
            await sound.setPositionAsync(0);
          }
        } catch (seekError) {
          console.warn('⚠️ Error al establecer posición inicial:', seekError);
        }
        
        // Actualizar el estado ANTES de reproducir
        setPlayerState(prev => ({
          ...prev,
          currentSong: song,
          currentIndex: index,
          currentTime: savedPositionRef.current > 0 ? savedPositionRef.current : 0,
          isLoading: false, // Audio cargado
          isPlaying: false, // Aún no está reproduciendo, lo iniciaremos manualmente
        }));
        
        // Si había una posición guardada y estaba reproduciendo, continuar desde ahí
        // Si no, comenzar desde el inicio
        try {
          if (shouldStartPlaying) {
            await sound.playAsync();
            setPlayerState(prev => ({
              ...prev,
              isPlaying: true,
            }));
            console.log(`✅ loadAndPlaySong - Audio cargado y reproduciendo desde ${savedPositionRef.current.toFixed(2)}s: ${song.title}`);
          } else {
            // Si no estaba reproduciendo, solo cargar sin reproducir
            console.log(`✅ loadAndPlaySong - Audio cargado (pausado) desde ${savedPositionRef.current > 0 ? savedPositionRef.current.toFixed(2) + 's' : 'el inicio'}: ${song.title}`);
          }
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

    // Primero, sincronizar el currentIndex con la canción actual en la playlist
    // Esto es importante porque la playlist puede haber cambiado (por ejemplo, si la cola se actualizó)
    let currentActualIndex = state.currentIndex;
    if (state.currentSong) {
      const foundIndex = currentPlaylist.findIndex(song => song.id === state.currentSong?.id);
      if (foundIndex !== -1) {
        currentActualIndex = foundIndex;
      } else if (currentActualIndex < 0 || currentActualIndex >= currentPlaylist.length) {
        // Si el índice no es válido, buscar la canción o usar 0
        currentActualIndex = foundIndex !== -1 ? foundIndex : 0;
      }
    }

    // Si repeatMode es 'one', repetir la misma canción (aunque esto es raro para handleNext manual)
    // Pero por consistencia, lo manejamos
    if (state.repeatMode === 'one') {
      console.log('🔄 handleNext - Repetir una canción activado, repitiendo:', state.currentSong?.title);
      savedPositionRef.current = 0;
      const currentSong = currentPlaylist[currentActualIndex];
      if (currentSong) {
        await loadAndPlaySong(currentSong, currentActualIndex);
      }
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
        if (nextIndex === currentActualIndex && playableSongs.length > 1) {
          const otherSongs = playableSongs.filter(song => song.id !== randomSong.id);
          const newRandomSong = otherSongs[Math.floor(Math.random() * otherSongs.length)];
          nextIndex = currentPlaylist.findIndex(song => song.id === newRandomSong.id);
        }
      }
    } else {
      // Modo normal: siguiente canción
      nextIndex = (currentActualIndex + 1) % currentPlaylist.length;
    }
    
    console.log(`🔍 handleNext - currentIndex: ${state.currentIndex}, currentActualIndex: ${currentActualIndex}, nextIndex: ${nextIndex}, playlist length: ${currentPlaylist.length}`);

    // Validar que nextIndex sea válido antes de continuar
    if (nextIndex < 0 || nextIndex >= currentPlaylist.length) {
      console.error('❌ handleNext - Índice siguiente inválido:', nextIndex, 'playlist length:', currentPlaylist.length);
      return;
    }

    // Limpiar posición guardada al cambiar de canción
    savedPositionRef.current = 0;
    const nextSong = currentPlaylist[nextIndex];
    if (!nextSong) {
      console.error('❌ handleNext - No se encontró la siguiente canción en el índice', nextIndex);
      return;
    }
    console.log(`⏭️ handleNext - Cambiando a siguiente canción (índice ${nextIndex}):`, nextSong.title);
    await loadAndPlaySong(nextSong, nextIndex);
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
    const state = playerStateRef.current;
    const currentSong = state.currentSong;
    
    // Si no hay canción actual, no hacer nada
    if (!currentSong) {
      console.warn('⚠️ seekTo - No hay canción actual');
      return;
    }

    // Si el audio no está cargado, cargarlo primero
    if (!soundRef.current) {
      console.log('🔄 seekTo - Audio no está cargado, cargando canción...');
      // Guardar la posición deseada antes de cargar
      savedPositionRef.current = timeInSeconds;
      // Cargar la canción (se reproducirá desde la posición guardada si estaba reproduciendo)
      await loadAndPlaySong(currentSong, state.currentIndex);
      return;
    }

    try {
      const status = await soundRef.current.getStatusAsync();
      if (!status.isLoaded) {
        console.log('🔄 seekTo - Audio no está cargado, recargando...');
        // Guardar la posición deseada antes de recargar
        savedPositionRef.current = timeInSeconds;
        // Recargar la canción
        await loadAndPlaySong(currentSong, state.currentIndex);
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
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Verificar que el audio todavía existe y está cargado
          if (!soundRef.current) {
            console.warn('⚠️ seekTo - El audio fue descargado durante el seek');
            return;
          }
          
          const currentStatus = await soundRef.current.getStatusAsync();
          if (!currentStatus.isLoaded) {
            console.warn('⚠️ seekTo - El audio ya no está cargado');
            return;
          }
          
          // Intentar reproducir, pero ignorar errores de AbortError (interrupciones normales)
          await soundRef.current.playAsync();
          setPlayerState(prev => ({
            ...prev,
            isPlaying: true,
            currentTime: timeInSeconds,
          }));
          console.log(`✅ seekTo - Continuando reproducción desde ${timeInSeconds.toFixed(2)}s`);
        } catch (playError: any) {
          // Ignorar errores de AbortError (interrupciones normales durante seek)
          if (playError?.name === 'AbortError' || playError?.message?.includes('interrupted')) {
            console.log('ℹ️ seekTo - Reproducción interrumpida (normal durante seek)');
            // Verificar el estado real del audio
            if (soundRef.current) {
              try {
                const status = await soundRef.current.getStatusAsync();
                setPlayerState(prev => ({
                  ...prev,
                  isPlaying: status.isLoaded && status.isPlaying || false,
                  currentTime: timeInSeconds,
                }));
              } catch {
                // Si no podemos obtener el estado, asumir pausado
                setPlayerState(prev => ({
                  ...prev,
                  isPlaying: false,
                  currentTime: timeInSeconds,
                }));
              }
            }
          } else {
            console.warn('⚠️ seekTo - Error al continuar reproducción después del seek:', playError);
            // Si hay error, al menos mantener el estado actualizado
            setPlayerState(prev => ({
              ...prev,
              isPlaying: false,
              currentTime: timeInSeconds,
            }));
          }
        }
      } else {
        console.log(`✅ seekTo - Posición actualizada a ${timeInSeconds.toFixed(2)}s (pausado)`);
      }
    } catch (error) {
      console.error('❌ Error seeking:', error);
      // Si hay error, intentar recargar la canción
      if (currentSong) {
        console.log('🔄 seekTo - Error en seek, recargando canción...');
        savedPositionRef.current = timeInSeconds;
        await loadAndPlaySong(currentSong, state.currentIndex);
      } else {
        // Actualizar el estado de todas formas para que la UI refleje el cambio
        setPlayerState(prev => ({
          ...prev,
          currentTime: timeInSeconds,
        }));
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

