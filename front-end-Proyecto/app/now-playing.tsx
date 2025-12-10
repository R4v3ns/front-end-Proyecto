import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View, Modal, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Song } from "@/models/song";
import { Ionicons } from "@expo/vector-icons";
import ProgressBar from "@/components/music/ProgressBar";
import PlayerControls from "@/components/music/PlayerControls";
import SongCard from "@/components/music/SongCard";
import ScreenHeader from "@/components/music/ScreenHeader";
import { usePlaylists, useAddSongToPlaylist } from "@/hooks/useLibrary";
import { exampleSongs } from "@/data/exampleSongs";

export default function NowPlayingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ songId?: string }>();
  const { songs: apiSongs, isLoading } = useSongs();
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const { playlists, isLoading: playlistsLoading } = usePlaylists();
  const addSongToPlaylist = useAddSongToPlaylist();
  
  // Combinar canciones del API con canciones de ejemplo
  // PRIORIDAD: Las canciones de ejemplo tienen prioridad sobre las del API (para evitar conflictos)
  const songs = useMemo(() => {
    // Empezar con las canciones de ejemplo (tienen prioridad)
    const combined = [...exampleSongs];
    
    // Agregar canciones del API solo si no tienen un ID que ya existe en exampleSongs
    if (apiSongs && apiSongs.length > 0) {
      apiSongs.forEach(apiSong => {
        // Solo agregar si no existe una canción de ejemplo con el mismo ID
        if (!combined.find(s => s.id === apiSong.id)) {
          combined.push(apiSong);
        }
      });
    }
    
    return combined;
  }, [apiSongs]);
  
  const {
    playerState,
    playSong,
    togglePlayPause,
    seekTo,
    handleNext,
    handlePrevious,
    toggleShuffle,
    toggleRepeat,
  } = useAudioPlayer(songs);

  // Reproducir canción específica si se pasa songId como parámetro
  useEffect(() => {
    if (params.songId && songs.length > 0) {
      const songId = parseInt(params.songId, 10);
      
      // PRIORIDAD: Buscar primero en exampleSongs (las canciones de ejemplo tienen prioridad)
      // Esto asegura que cuando se presiona una canción de ejemplo, se use esa específicamente
      let song = exampleSongs.find(s => s.id === songId);
      if (!song) {
        // Si no está en exampleSongs, buscar en el resto de canciones
        song = songs.find(s => s.id === songId);
      }
      
      if (song) {
        // Solo reproducir si no es la canción actual o si es diferente
        if (!playerState.currentSong || playerState.currentSong.id !== song.id) {
          // Llamar inmediatamente - playSong actualiza el estado al instante
          playSong(song);
        }
      }
    } else if (songs.length > 0 && !playerState.currentSong && !isLoading && !params.songId) {
      // Solo reproducir automáticamente si no hay songId en los parámetros
      // Si no hay canción seleccionada y hay canciones disponibles, reproducir la primera de ejemplo
      const firstExampleSong = exampleSongs[0];
      if (firstExampleSong) {
        console.log('🎵 Reproduciendo primera canción de ejemplo:', firstExampleSong.title);
        playSong(firstExampleSong);
      } else {
        playSong(songs[0]);
      }
    }
  }, [params.songId, songs, playSong, playerState.currentSong, isLoading]);

  const currentSong: Song | null = playerState.currentSong ?? (songs?.[0] ?? null);

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
      <SafeAreaView style={styles.container}>
        <Text style={styles.loading}>Cargando playlist…</Text>
      </SafeAreaView>
    );
  }

  if (!songs?.length) {
    return (
      <SafeAreaView style={styles.container}>
        <ScreenHeader 
          title="Mi playlist n.º 1" 
          onClose={() => router.back()}
        />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No hay canciones disponibles</Text>
          <Text style={styles.emptyText}>
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
      />

      <View style={styles.content}>
        <View style={styles.songSection}>
          {playerState.isLoading && (
            <View style={styles.loadingOverlay}>
              <ActivityIndicator size="large" color="#F22976" />
              <Text style={styles.loadingText}>Cargando audio...</Text>
            </View>
          )}
          <SongCard
            coverUrl={currentSong?.coverUrl}
            title={currentSong?.title || 'Sin título'}
            artist={currentSong?.artist || 'Artista desconocido'}
            onLikePress={() => {
              // Aquí puedes agregar la lógica para guardar en favoritos
              console.log('Me gusta presionado para:', currentSong?.title);
            }}
            onMenuPress={() => setShowPlaylistModal(true)}
          />
        </View>

        <View style={styles.playerSection}>
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
                handlePrevious();
              }
            }}
            onNext={() => {
              if (songs.length) {
                handleNext();
              }
            }}
            onTogglePlayPause={() => {
              togglePlayPause();
            }}
            onShufflePress={toggleShuffle}
            onRepeatPress={toggleRepeat}
          />
        </View>
      </View>

      {/* Modal de selección de playlist */}
      <Modal
        visible={showPlaylistModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowPlaylistModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar a playlist</Text>
              <TouchableOpacity
                onPress={() => setShowPlaylistModal(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {playlistsLoading ? (
              <View style={styles.modalLoading}>
                <ActivityIndicator size="large" color="#F22976" />
              </View>
            ) : playlists.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Ionicons name="musical-notes-outline" size={64} color="#4d4d4d" />
                <Text style={styles.modalEmptyText}>No tienes playlists</Text>
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
                    style={styles.modalPlaylistItem}
                    onPress={() => handleAddToPlaylist(playlist.id)}
                    disabled={addSongToPlaylist.isPending}
                  >
                    <View style={styles.modalPlaylistInfo}>
                      <Ionicons name="musical-notes" size={24} color="#F22976" />
                      <View style={styles.modalPlaylistText}>
                        <Text style={styles.modalPlaylistName}>{playlist.name}</Text>
                        <Text style={styles.modalPlaylistCount}>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#121212",
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
    backgroundColor: "#121212",
    position: "relative",
    zIndex: 10,
    borderTopWidth: 1,
    borderTopColor: "#282828",
  },
  loading: { 
    color: "#fff", 
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
    backgroundColor: 'rgba(18, 18, 18, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
    borderRadius: 10,
  },
  loadingText: {
    marginTop: 12,
    color: '#FFFFFF',
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
    color: "#fff", 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 16, 
    textAlign: "center" 
  },
  emptyText: { 
    color: "#a7a7a7", 
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
    backgroundColor: '#121212',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#B3B3B3',
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
    borderBottomColor: '#282828',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modalPlaylistCount: {
    fontSize: 14,
    color: '#B3B3B3',
  },
});

