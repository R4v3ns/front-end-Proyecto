import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/utils/formatTime';

export default function MiniPlayer() {
  const router = useRouter();
  const segments = useSegments();
  
  const {
    playerState,
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
  } = usePlayer();

  // No mostrar si no hay canción actual o si estamos en la pantalla now-playing
  const isNowPlaying = segments.some(segment => segment === 'now-playing');
  if (!playerState.currentSong || isNowPlaying) {
    return null;
  }

  const currentSong = playerState.currentSong;
  const isPlaying = playerState.isPlaying;
  const currentTime = playerState.currentTime || 0;
  const duration = playerState.duration || 0;
  const progress = duration > 0 ? currentTime / duration : 0;

  const handlePress = () => {
    router.push(`/now-playing?songId=${currentSong.id}`);
  };

  const handleSeek = (sec: number) => {
    if (sec >= 0 && sec <= duration) {
      seekTo?.(sec);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.content}
        onPress={handlePress}
        activeOpacity={0.9}
      >
        {/* Portada */}
        <Image
          source={{ uri: currentSong.coverUrl }}
          style={styles.cover}
          contentFit="cover"
          transition={200}
        />

        {/* Información de la canción */}
        <View style={styles.songInfo}>
          <Text style={styles.title} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentSong.artist}
          </Text>
        </View>

        {/* Controles */}
        <View style={styles.controls}>
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handlePrevious();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.playButton}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color="#000000"
            />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={styles.controlButton}
          >
            <Ionicons name="play-skip-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Barra de progreso */}
      <TouchableOpacity
        style={styles.progressContainer}
        onPress={(e) => {
          e.stopPropagation();
          // Calcular posición basada en el toque
          // Esto es una aproximación simple, se puede mejorar
        }}
        activeOpacity={1}
      >
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    paddingBottom: 12,
    paddingTop: 10,
    paddingHorizontal: 16,
    zIndex: 1000,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 10,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cover: {
    width: 56,
    height: 56,
    borderRadius: 6,
    marginRight: 12,
    backgroundColor: '#333333',
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  title: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    color: '#B3B3B3',
    fontSize: 12,
    fontWeight: '400',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  controlButton: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: 2, // Ajuste para centrar el icono de play
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  progressContainer: {
    marginTop: 4,
  },
  progressBar: {
    height: 2,
    backgroundColor: '#333333',
    borderRadius: 1,
    marginBottom: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#F22976',
    borderRadius: 1,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  timeText: {
    color: '#B3B3B3',
    fontSize: 10,
    fontWeight: '400',
  },
});

