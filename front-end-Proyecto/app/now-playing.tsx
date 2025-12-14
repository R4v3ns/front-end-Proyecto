import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSongs } from "@/hooks/useSongs";
import { usePlayer } from "@/contexts/PlayerContext";
import { Song } from "@/models/song";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "@/components/music/ProgressBar";
import PlayerControls from "@/components/music/PlayerControls";
import SongCard from "@/components/music/SongCard";
import ScreenHeader from "@/components/music/ScreenHeader";
import { usePlaylists, useAddSongToPlaylist, useLikeSong, useUnlikeSong, useLikedSongs } from "@/hooks/useLibrary";
import { useAddToQueueNext, useAddToQueueEnd } from "@/hooks/useQueue";
import QueueModal from "@/components/music/QueueModal";
import { exampleSongs } from "@/data/exampleSongs";
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePreferences } from '@/contexts/PreferencesContext';

export default function NowPlayingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ songId?: string }>();
  const { songs: apiSongs, isLoading } = useSongs();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [showQueueModal, setShowQueueModal] = useState(false);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const { playlists, isLoading: playlistsLoading } = usePlaylists();
  const addSongToPlaylist = useAddSongToPlaylist();
  const likeSong = useLikeSong();
  const unlikeSong = useUnlikeSong();
  const { songs: likedSongs, refetch: refetchLikedSongs } = useLikedSongs();
  const addToQueueNext = useAddToQueueNext();
  const addToQueueEnd = useAddToQueueEnd();
  const { isAuthenticated } = useAuth();
  
  // Colores dinámicos del tema
  const { currentTheme } = usePreferences();
  const isDark = currentTheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#CC7AF240', dark: '#333333' }, 'background');
  
  const {
    playerState,
    playSong,
    togglePlayPause,
    seekTo,
    handleNext,
    handlePrevious,
    toggleShuffle,
    toggleRepeat,
  } = usePlayer();
  
  // Crear estilos dinámicos que se actualicen con el tema
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
    },
    playerSection: {
      backgroundColor,
      borderTopColor: borderColor,
    },
    loading: {
      color: textColor,
    },
    loadingOverlay: {
      backgroundColor: isDark ? 'rgba(18, 18, 18, 0.9)' : 'rgba(255, 255, 255, 0.9)',
    },
    loadingText: {
      color: textColor,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    emptyTitle: {
      color: textColor,
      fontSize: 20,
      fontWeight: "700",
      marginBottom: 16,
      textAlign: "center",
    },
    emptyText: {
      color: isDark ? '#B3B3B3' : '#666666',
      fontSize: 14,
      textAlign: "center",
      lineHeight: 20,
    },
    modalContent: {
      backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      maxHeight: '80%',
      paddingBottom: 40,
      borderWidth: 1,
      borderColor: isDark ? '#333333' : '#CC7AF280',
    },
    modalHeader: {
      borderBottomColor: borderColor,
    },
    modalTitle: {
      color: textColor,
    },
    modalPlaylistItem: {
      borderBottomColor: borderColor,
    },
    modalPlaylistName: {
      color: textColor,
    },
    modalPlaylistCount: {
      color: isDark ? '#B3B3B3' : '#666666',
    },
    modalEmptyText: {
      color: isDark ? '#B3B3B3' : '#666666',
    },
    modalCloseButton: {
      // El color del icono se aplica dinámicamente
    },
    modalPlaylistInfo: {
      // Estilos para el contenedor de información de playlist
    },
    modalPlaylistText: {
      // Estilos para el contenedor de texto de playlist
    },
    createPlaylistButton: {
      backgroundColor: '#F22976', // Mantener rosa para el botón
    },
    createPlaylistButtonText: {
      color: '#FFFFFF', // Mantener blanco para el texto del botón
    },
  }), [backgroundColor, textColor, borderColor, isDark]);
  
  // Obtener la playlist del estado del reproductor
  const songs = playerState.playlist || [];
  
  // Flag para evitar reproducción automática después de la primera vez
  const hasInitializedRef = useRef(false);
  // Flag para rastrear si el usuario está cambiando de canción manualmente
  const isManualChangeRef = useRef(false);
  
  // Wrapper para handleNext que marca el cambio como manual
  const handleNextWithFlag = async () => {
    isManualChangeRef.current = true;
    await handleNext();
    // Resetear el flag después de un tiempo
    setTimeout(() => {
      isManualChangeRef.current = false;
    }, 2000);
  };
  
  // Wrapper para handlePrevious que marca el cambio como manual
  const handlePreviousWithFlag = async () => {
    isManualChangeRef.current = true;
    await handlePrevious();
    // Resetear el flag después de un tiempo
    setTimeout(() => {
      isManualChangeRef.current = false;
    }, 2000);
  };
  
  // Ref para rastrear el último songId procesado
  const lastProcessedSongIdRef = useRef<string | null>(null);
  
  // Reproducir canción específica si se pasa songId como parámetro
  useEffect(() => {
    // Si hay un cambio manual en progreso, no hacer nada automáticamente
    if (isManualChangeRef.current) {
      console.log('⏸️ useEffect - Cambio manual en progreso, ignorando reproducción automática...');
      return;
    }
    
    // Solo procesar si params.songId cambió (no cuando playerState.currentSong cambia)
    const currentSongId = params.songId;
    if (currentSongId === lastProcessedSongIdRef.current) {
      // Ya procesamos este songId, no hacer nada
      return;
    }
    
    if (currentSongId && songs.length > 0) {
      const songId = parseInt(currentSongId, 10);
      
      // PRIORIDAD: Buscar primero en las canciones del API (datos reales)
      // Si no se encuentra, usar exampleSongs como fallback
      let song = songs.find(s => s.id === songId);
      if (!song) {
        // Si no está en las canciones del API, buscar en exampleSongs como fallback
        song = exampleSongs.find(s => s.id === songId);
      }
      
      if (song) {
        // Reproducir la canción (los podcasts también se pueden reproducir)
        console.log(`🎵 useEffect - Reproduciendo canción desde params.songId: ${song.title}`);
        playSong(song);
        lastProcessedSongIdRef.current = currentSongId; // Marcar como procesado
        hasInitializedRef.current = true; // Marcar como inicializado
      }
    } else if (
      songs.length > 0 && 
      !hasInitializedRef.current && 
      !playerState.currentSong && 
      !playerState.isLoading &&
      !currentSongId &&
      !isManualChangeRef.current
    ) {
      // Solo reproducir automáticamente la primera vez que se carga la pantalla
      // y si no hay songId en los parámetros y no hay canción actual
      // Buscar la primera canción que NO sea ejemplo
      const firstPlayableSong = songs.find(s => !s.isExample) || songs[0];
      if (firstPlayableSong && !firstPlayableSong.isExample) {
        console.log('🎵 Reproduciendo primera canción (inicialización):', firstPlayableSong.title);
        playSong(firstPlayableSong);
        hasInitializedRef.current = true; // Marcar como inicializado para evitar reproducciones automáticas futuras
      } else if (firstPlayableSong && firstPlayableSong.isExample) {
        console.log('⚠️ Solo hay canciones de ejemplo disponibles, no se reproducirá automáticamente');
        hasInitializedRef.current = true;
      }
    }
  }, [params.songId, songs, playSong]); // Removido playerState.currentSong y playerState.isLoading de las dependencias

  const currentSong: Song | null = playerState.currentSong ?? (songs?.[0] ?? null);
  
  // Verificar si la canción actual está en los likes
  const isCurrentSongLiked = useMemo(() => {
    if (!currentSong) return false;
    return likedSongs.some(song => song.id === currentSong.id);
  }, [currentSong, likedSongs]);

  const handleAddToPlaylist = async (playlistId: number) => {
    if (!currentSong) return;

    try {
      await addSongToPlaylist.mutateAsync({
        playlistId,
        songId: currentSong.id,
      });
      setShowPlaylistModal(false);
      Alert.alert('Éxito', 'Canción agregada a la playlist');
    } catch (error) {
      Alert.alert('Error', 'No se pudo agregar la canción a la playlist');
    }
  };

  const currentIndex = useMemo(() => {
    if (!currentSong || !songs?.length) return 0;
    const idx = songs.findIndex((s) => s.id === currentSong.id);
    return idx >= 0 ? idx : 0;
  }, [currentSong, songs]);

  // Progreso local + timer para suavizar entre eventos del player
  const duration = (playerState.duration ?? currentSong?.duration ?? 0);
  const safeDuration = isFinite(duration) && duration > 0 ? duration : 0;
  const [positionLocal, setPositionLocal] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const currentTime = playerState.currentTime ?? 0;
    if (isFinite(currentTime) && currentTime >= 0) {
      setPositionLocal(currentTime);
    }
  }, [playerState.currentTime, currentSong?.id]);

  useEffect(() => {
    const stop = () => {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    };
    if (!playerState.isPlaying || !safeDuration) { stop(); return; }

    stop();
    timerRef.current = setInterval(() => {
      setPositionLocal((p) => {
        const newPos = p + 0.5;
        return isFinite(newPos) ? Math.min(newPos, safeDuration) : 0;
      });
    }, 500);

    return stop;
  }, [playerState.isPlaying, safeDuration, currentSong?.id]);

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <Text style={[styles.loading, dynamicStyles.loading]}>Cargando playlist…</Text>
      </SafeAreaView>
    );
  }

  if (!songs?.length) {
    return (
      <SafeAreaView style={[styles.container, dynamicStyles.container]}>
        <ScreenHeader 
          title="Mi playlist n.º 1" 
          onClose={() => router.back()}
        />
        <View style={[styles.emptyContainer, dynamicStyles.emptyContainer]}>
          <Text style={[styles.emptyTitle, dynamicStyles.emptyTitle]}>No hay canciones disponibles</Text>
          <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
            No hay canciones disponibles en esta playlist.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScreenHeader 
        title="Reproductor" 
        onClose={() => router.back()}
        rightAction={
          <TouchableOpacity
            onPress={() => setShowQueueModal(true)}
            style={styles.queueButton}
          >
            <Ionicons name="list" size={24} color={textColor} />
          </TouchableOpacity>
        }
      />

      <View style={styles.content}>
        <View style={styles.songSection}>
          {playerState.isLoading && (
            <View style={[styles.loadingOverlay, dynamicStyles.loadingOverlay]}>
              <ActivityIndicator size="large" color="#F22976" />
              <Text style={[styles.loadingText, dynamicStyles.loadingText]}>Cargando audio...</Text>
            </View>
          )}
          <SongCard
            coverUrl={currentSong?.coverUrl}
            title={currentSong?.title || 'Sin título'}
            artist={currentSong?.artist || 'Artista desconocido'}
            isLiked={isCurrentSongLiked}
            onLikePress={async () => {
              if (!currentSong) return;
              
              // Verificar autenticación antes de intentar dar like
              if (!isAuthenticated) {
                Alert.alert(
                  'Inicia sesión',
                  'Debes iniciar sesión para agregar canciones a favoritos.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    { 
                      text: 'Iniciar sesión', 
                      onPress: () => router.push('/auth')
                    }
                  ]
                );
                return;
              }
              
              try {
                if (isCurrentSongLiked) {
                  // Si ya está en likes, quitarlo
                  const result = await unlikeSong.mutateAsync(currentSong.id);
                  
                  // Mostrar mensaje de confirmación en la UI
                  const message = result?.message || `"${currentSong.title}" eliminada de favoritos exitosamente`;
                  Alert.alert('✅ Éxito', message);
                } else {
                  // Si no está en likes, agregarlo
                  const result = await likeSong.mutateAsync(currentSong.id);
                  
                  // Mostrar mensaje de confirmación en la UI
                  const message = result?.message || `"${currentSong.title}" agregada a favoritos exitosamente`;
                  Alert.alert('✅ Éxito', message);
                }
              } catch (error: any) {
                // Extraer mensaje del error del backend
                const errorMessage = error?.message || error?.data?.error || 'Error desconocido';
                const errorStatus = error?.status;
                
                // Verificar si es un error de validación del backend (409 = conflicto, como "Ya has dado like")
                if (errorStatus === 409) {
                  // Invalidar la query para refrescar la lista y mostrar que la canción está liked
                  // El hook useLikeSong ya invalida la query en onError cuando es 409, pero refrescamos manualmente también
                  await refetchLikedSongs();
                  
                  Alert.alert(
                    '⚠️ Ya existe',
                    errorMessage || 'Esta canción ya está en tus favoritos'
                  );
                  return;
                }
                
                // Verificar si es un error 404 (canción no encontrada)
                if (errorStatus === 404) {
                  Alert.alert(
                    '❌ No encontrado',
                    errorMessage || 'La canción no fue encontrada en la base de datos'
                  );
                  return;
                }
                
                // Verificar si es un error de validación (400)
                if (errorStatus === 400) {
                  Alert.alert(
                    '⚠️ Error de validación',
                    errorMessage || 'Los datos enviados no son válidos'
                  );
                  return;
                }
                
                // Verificar si es un error de autenticación (401 o sin token)
                if (errorStatus === 401 || 
                    errorMessage?.includes('No hay token') || 
                    errorMessage?.includes('Token no proporcionado') ||
                    errorMessage?.includes('autenticación') ||
                    errorMessage?.includes('Token expirado')) {
                  Alert.alert(
                    '🔐 Sesión expirada',
                    'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { 
                        text: 'Iniciar sesión', 
                        onPress: () => router.push('/auth')
                      }
                    ]
                  );
                  return;
                }
                
                // Verificar si es un error de conexión (túnel offline, red, etc.)
                if (errorStatus === 0 || 
                    errorMessage?.includes('fetch') || 
                    errorMessage?.includes('Network request failed') ||
                    errorMessage?.includes('Error de conexión') ||
                    errorMessage?.includes('Failed to fetch')) {
                  Alert.alert(
                    '🌐 Error de conexión',
                    `No se pudo conectar al servidor backend.\n\n` +
                    `Posibles causas:\n` +
                    `• El túnel de Expo está offline\n` +
                    `• El servidor backend no está corriendo\n` +
                    `• Problemas de red\n\n` +
                    `Soluciones:\n` +
                    `1. Reinicia Expo: npx expo start --tunnel\n` +
                    `2. O usa LAN: npx expo start --lan\n` +
                    `3. Verifica que el backend esté corriendo en localhost:8080`
                  );
                  return;
                }
                
                // Otros errores - mostrar mensaje del backend
                Alert.alert(
                  '❌ Error',
                  errorMessage || 'No se pudo actualizar el estado de me gusta. Por favor, intenta nuevamente.'
                );
              }
            }}
            onMenuPress={() => setShowMenuModal(true)}
          />
        </View>

        <View style={[styles.playerSection, dynamicStyles.playerSection]}>
          <ProgressBar
            position={isFinite(positionLocal) ? positionLocal : 0}
            duration={safeDuration}
            onSeek={(sec) => { 
              if (isFinite(sec) && sec >= 0 && sec <= safeDuration) {
                setPositionLocal(sec); 
                seekTo?.(sec); 
              }
            }}
          />

          <PlayerControls
            isPlaying={playerState.isPlaying}
            onPrev={() => {
              if (songs.length) {
                handlePreviousWithFlag();
              }
            }}
            onNext={() => {
              if (songs.length) {
                handleNextWithFlag();
              }
            }}
            onTogglePlayPause={() => {
              togglePlayPause();
            }}
            onShufflePress={toggleShuffle}
            onRepeatPress={toggleRepeat}
            isShuffle={playerState.isShuffle}
            repeatMode={playerState.repeatMode}
          />
        </View>
      </View>

      {/* Modal de menú de acciones */}
      <Modal
        visible={showMenuModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenuModal(false)}
      >
        <TouchableOpacity
          style={styles.menuModalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenuModal(false)}
        >
          <View style={[styles.menuModalContent, dynamicStyles.modalContent]}>
            {!isAuthenticated ? (
              <TouchableOpacity
                style={[styles.menuItem, dynamicStyles.modalPlaylistItem]}
                onPress={() => {
                  setShowMenuModal(false);
                  router.push('/auth');
                }}
              >
                <Ionicons name="log-in-outline" size={24} color={textColor} />
                <Text style={[styles.menuItemText, dynamicStyles.modalPlaylistName]}>
                  Iniciar sesión para más opciones
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.menuItem, dynamicStyles.modalPlaylistItem]}
                  onPress={async () => {
                    if (!currentSong) return;
                    try {
                      await addToQueueNext.mutateAsync(currentSong.id);
                      setShowMenuModal(false);
                      Alert.alert('✅ Éxito', 'Canción agregada para reproducir después');
                    } catch (error: any) {
                      Alert.alert('Error', error?.message || 'No se pudo agregar a la cola');
                    }
                  }}
                  disabled={addToQueueNext.isLoading}
                >
                  <Ionicons name="add-circle-outline" size={24} color={textColor} />
                  <Text style={[styles.menuItemText, dynamicStyles.modalPlaylistName]}>
                    Agregar a cola (siguiente)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, dynamicStyles.modalPlaylistItem]}
                  onPress={async () => {
                    if (!currentSong) return;
                    try {
                      await addToQueueEnd.mutateAsync(currentSong.id);
                      setShowMenuModal(false);
                      Alert.alert('✅ Éxito', 'Canción agregada al final de la cola');
                    } catch (error: any) {
                      Alert.alert('Error', error?.message || 'No se pudo agregar a la cola');
                    }
                  }}
                  disabled={addToQueueEnd.isLoading}
                >
                  <Ionicons name="add-outline" size={24} color={textColor} />
                  <Text style={[styles.menuItemText, dynamicStyles.modalPlaylistName]}>
                    Agregar al final de la cola
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, dynamicStyles.modalPlaylistItem]}
                  onPress={() => {
                    setShowMenuModal(false);
                    setShowPlaylistModal(true);
                  }}
                >
                  <Ionicons name="musical-notes-outline" size={24} color={textColor} />
                  <Text style={[styles.menuItemText, dynamicStyles.modalPlaylistName]}>
                    Agregar a playlist
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.menuItem, dynamicStyles.modalPlaylistItem]}
                  onPress={() => {
                    setShowMenuModal(false);
                    setShowQueueModal(true);
                  }}
                >
                  <Ionicons name="list-outline" size={24} color={textColor} />
                  <Text style={[styles.menuItemText, dynamicStyles.modalPlaylistName]}>
                    Ver cola de reproducción
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Modal de selección de playlist */}
      <Modal
        visible={showPlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={[styles.modalHeader, dynamicStyles.modalHeader]}>
              <Text style={[styles.modalTitle, dynamicStyles.modalTitle]}>Agregar a playlist</Text>
              <TouchableOpacity
                onPress={() => setShowPlaylistModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
            </View>

            {playlistsLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#F22976" />
              </View>
            ) : playlists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="musical-notes-outline" size={64} color={isDark ? '#B3B3B3' : '#666666'} />
                <Text style={[styles.modalEmptyText, dynamicStyles.modalEmptyText]}>No tienes playlists</Text>
                <TouchableOpacity
                  style={styles.createPlaylistButton}
                  onPress={() => {
                    setShowPlaylistModal(false);
                    router.push('/(tabs)/library');
                  }}
                >
                  <Text style={styles.createPlaylistButtonText}>Crear playlist</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView style={styles.modalPlaylistList}>
                {playlists.map((playlist) => (
                  <TouchableOpacity
                    key={playlist.id}
                    style={[styles.modalPlaylistItem, dynamicStyles.modalPlaylistItem]}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                    disabled={addSongToPlaylist.isPending}
                  >
                    <View style={styles.modalPlaylistInfo}>
                      <Ionicons name="musical-notes" size={24} color="#F22976" />
                      <View style={styles.modalPlaylistText}>
                        <Text style={[styles.modalPlaylistName, dynamicStyles.modalPlaylistName]}>{playlist.name}</Text>
                        <Text style={[styles.modalPlaylistCount, dynamicStyles.modalPlaylistCount]}>
                          {playlist.songCount || 0} canciones
                        </Text>
                      </View>
                    </View>
                    {addSongToPlaylist.isPending && (
                      <ActivityIndicator size="small" color="#F22976" />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de cola de reproducción */}
      <QueueModal
        visible={showQueueModal}
        onClose={() => setShowQueueModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor se aplica dinámicamente
  },
  content: {
    flex: 1,
    paddingHorizontal: 0,
    paddingTop: 0,
    justifyContent: "space-between",
  },
  songSection: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingTop: 16,
    paddingBottom: 0, // Eliminado para subir más los controles
    paddingHorizontal: 0,
    overflow: "visible",
  },
  playerSection: {
    width: "100%",
    paddingBottom: 40,
    paddingTop: 8, // Reducido aún más
    paddingHorizontal: 20,
    marginTop: 0, // Eliminado para subir más los controles
    // backgroundColor se aplica dinámicamente
    position: "relative",
    zIndex: 10,
    borderTopWidth: 1,
    // borderTopColor se aplica dinámicamente
  },
  loading: { 
    // color se aplica dinámicamente
    marginTop: 40, 
    textAlign: "center", 
    fontSize: 16 
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    // backgroundColor se aplica dinámicamente
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 12,
    // color se aplica dinámicamente
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center", 
    paddingHorizontal: 24 
  },
  emptyTitle: { 
    // color se aplica dinámicamente
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 16, 
    textAlign: "center" 
  },
  emptyText: { 
    // color se aplica dinámicamente
    fontSize: 14, 
    textAlign: "center", 
    lineHeight: 20 
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    // backgroundColor y borderColor se aplican dinámicamente
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
    borderWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#CC7AF240', // Borde púrpura claro sutil
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    // color se aplica dinámicamente
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalLoading: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmpty: {
    padding: 40,
    alignItems: 'center',
  },
  modalEmptyText: {
    fontSize: 16,
    // color se aplica dinámicamente
    marginTop: 16,
    marginBottom: 24,
  },
  createPlaylistButton: {
    backgroundColor: '#F22976',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createPlaylistButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  modalPlaylistList: {
    flex: 1,
  },
  modalPlaylistItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#CC7AF240', // Borde púrpura claro sutil
  },
  modalPlaylistInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modalPlaylistText: {
    marginLeft: 16,
    flex: 1,
  },
  modalPlaylistName: {
    fontSize: 16,
    fontWeight: '600',
    // color se aplica dinámicamente
    marginBottom: 4,
  },
  modalPlaylistCount: {
    fontSize: 14,
    // color se aplica dinámicamente
  },
  queueButton: {
    padding: 4,
  },
  menuModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    width: '80%',
    maxWidth: 400,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  menuItemText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
});

