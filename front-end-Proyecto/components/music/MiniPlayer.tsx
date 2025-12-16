import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, usePathname } from 'expo-router';
import { usePlayer } from '@/contexts/PlayerContext';
import { formatTime } from '@/utils/formatTime';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePreferences } from '@/contexts/PreferencesContext';

export default function MiniPlayer() {
  const router = useRouter();
  const pathname = usePathname();
  
  // Colores dinámicos del tema
  const { currentTheme } = usePreferences();
  const isDark = currentTheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#CC7AF240', dark: '#333333' }, 'background');
  const metaTextColor = isDark ? '#B3B3B3' : '#666666';
  
  const {
    playerState,
    togglePlayPause,
    handleNext,
    handlePrevious,
    seekTo,
  } = usePlayer();

  // Solo ocultar si no hay canción actual o si estamos en la pantalla de reproducción completa
  const isNowPlaying = pathname?.includes('/now-playing');
  
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

  // Crear estilos dinámicos que se actualicen con el tema
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      backgroundColor,
      borderTopColor: borderColor,
    },
    title: {
      color: textColor,
    },
    artist: {
      color: metaTextColor,
    },
    playButton: {
      backgroundColor: isDark ? '#333333' : '#FFFFFF',
    },
    timeText: {
      color: metaTextColor,
    },
  }), [backgroundColor, textColor, borderColor, metaTextColor, isDark]);

  return (
    <View style={[styles.container, dynamicStyles.container]}>
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
          <Text style={[styles.title, dynamicStyles.title]} numberOfLines={1}>
            {currentSong.title}
          </Text>
          <Text style={[styles.artist, dynamicStyles.artist]} numberOfLines={1}>
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
            <Ionicons name="play-skip-back" size={20} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            style={[styles.playButton, dynamicStyles.playButton]}
          >
            <Ionicons
              name={isPlaying ? "pause" : "play"}
              size={20}
              color={isDark ? '#FFFFFF' : '#000000'}
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
            <Ionicons name="play-skip-forward" size={20} color={textColor} />
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
          <Text style={[styles.timeText, dynamicStyles.timeText]}>{formatTime(currentTime)}</Text>
          <Text style={[styles.timeText, dynamicStyles.timeText]}>{formatTime(duration)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 65, // Posicionar justo encima de la barra de tabs (altura: 65px)
    left: 0,
    right: 0,
    // backgroundColor se aplica dinámicamente
    borderTopWidth: 1,
    // borderTopColor se aplica dinámicamente
    paddingBottom: 12,
    paddingTop: 10,
    paddingHorizontal: 16,
    zIndex: 999, // Menor que la barra de tabs pero mayor que el contenido
    shadowColor: '#7129F2',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 9,
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
    backgroundColor: '#CC7AF215', // Fondo púrpura claro muy sutil
  },
  songInfo: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'center',
  },
  title: {
    // color se aplica dinámicamente
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  artist: {
    // color se aplica dinámicamente
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
    // backgroundColor se aplica dinámicamente
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
    backgroundColor: '#CC7AF240', // Púrpura claro con opacidad
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
    // color se aplica dinámicamente
    fontSize: 10,
    fontWeight: '400',
  },
});

