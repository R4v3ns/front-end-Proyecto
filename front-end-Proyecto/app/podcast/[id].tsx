import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router, useLocalSearchParams } from 'expo-router';
import { examplePodcasts } from '@/data/podcasts';

const { width } = Dimensions.get('window');

export default function PodcastDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const podcastId = params.id;
  const textColor = useThemeColor({}, 'text');

  // Buscar el podcast por ID
  const podcast = examplePodcasts.find(p => p.id === podcastId);

  if (!podcast) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Podcast no encontrado</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No se encontró información del podcast</ThemedText>
        </View>
      </ThemedView>
    );
  }

  const handlePlay = () => {
    // TODO: Implementar reproducción de podcast
    // Por ahora, navegar al reproductor
    console.log('Reproducir podcast:', podcast.title);
    // router.push('/now-playing?podcastId=' + podcast.id);
    alert('Funcionalidad de podcasts próximamente');
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Podcast</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del podcast */}
        <View style={styles.podcastInfo}>
          <Image
            source={{ uri: podcast.coverUrl }}
            style={styles.podcastImage}
            contentFit="cover"
            transition={200}
          />
          <ThemedText style={styles.podcastTitle}>{podcast.title}</ThemedText>
          {podcast.description && (
            <ThemedText style={styles.podcastDescription}>
              {podcast.description}
            </ThemedText>
          )}
          
          {/* Botón de reproducir */}
          <TouchableOpacity
            style={styles.playButton}
            onPress={handlePlay}
          >
            <Ionicons name="play" size={28} color="#FFFFFF" />
            <ThemedText style={styles.playButtonText}>Reproducir</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    alignItems: 'center',
  },
  podcastInfo: {
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  podcastImage: {
    width: '100%',
    aspectRatio: 1,
    maxWidth: 400,
    borderRadius: 12,
    marginBottom: 24,
    backgroundColor: '#282828',
  },
  podcastTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 12,
    textAlign: 'center',
  },
  podcastDescription: {
    fontSize: 16,
    color: '#B3B3B3',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F22976',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    minWidth: 200,
  },
  playButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 12,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

