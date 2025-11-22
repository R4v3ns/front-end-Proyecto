import React, { useEffect, useMemo, useRef, useState } from "react";
import { SafeAreaView, Text, StyleSheet, View } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSongs } from "@/hooks/useSongs";
import { useAudioPlayer } from "@/hooks/useAudioPlayer";
import { Song } from "@/models/song";
import ProgressBar from "@/components/music/ProgressBar";
import PlayerControls from "@/components/music/PlayerControls";
import SongCard from "@/components/music/SongCard";
import ScreenHeader from "@/components/music/ScreenHeader";

export default function NowPlayingScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ songId?: string }>();
  const { songs, isLoading } = useSongs();
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
      const song = songs.find(s => s.id === songId);
      if (song) {
        // Solo reproducir si no es la canción actual
        if (!playerState.currentSong || playerState.currentSong.id !== song.id) {
          playSong(song);
        }
      }
    } else if (songs.length > 0 && !playerState.currentSong && !isLoading) {
      // Si no hay canción seleccionada y hay canciones disponibles, reproducir la primera
      playSong(songs[0]);
    }
  }, [params.songId, songs, playSong, playerState.currentSong, isLoading]);

  const currentSong: Song | null = playerState.currentSong ?? (songs?.[0] ?? null);

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
          <SongCard
            coverUrl={currentSong?.coverUrl}
            title={currentSong?.title || 'Sin título'}
            artist={currentSong?.artist || 'Artista desconocido'}
            onLikePress={() => {
              // Aquí puedes agregar la lógica para guardar en favoritos
              console.log('Me gusta presionado para:', currentSong?.title);
            }}
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
  },
  songSection: {
    flexShrink: 1,
    justifyContent: "flex-start",
    alignItems: "stretch",
    paddingTop: 0,
    paddingBottom: 20,
    overflow: "visible",
    minHeight: 400,
  },
  playerSection: {
    width: "100%",
    paddingBottom: 40,
    paddingTop: 24,
    paddingHorizontal: 20,
    marginTop: 32,
    backgroundColor: "#121212",
    position: "relative",
    zIndex: 10,
  },
  loading: { 
    color: "#fff", 
    marginTop: 40, 
    textAlign: "center", 
    fontSize: 16 
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
});

