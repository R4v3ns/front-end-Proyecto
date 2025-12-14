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
import { popularArtists } from '@/data/artists';

const { width } = Dimensions.get('window');

export default function ArtistDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const artistId = params.id;
  const textColor = useThemeColor({}, 'text');

  // Buscar el artista por ID
  const artist = popularArtists.find(a => a.id === artistId);

  if (!artist) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={textColor} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Artista no encontrado</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <ThemedText style={styles.emptyText}>No se encontró información del artista</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>{artist.name}</ThemedText>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Información del artista */}
        <View style={styles.artistInfo}>
          <Image
            source={{ uri: artist.imageUrl }}
            style={styles.artistImage}
            contentFit="cover"
            transition={200}
          />
          <ThemedText style={styles.artistName}>{artist.name}</ThemedText>
          <ThemedText style={styles.songCount}>
            {artist.songs.length} {artist.songs.length === 1 ? 'canción' : 'canciones'}
          </ThemedText>
        </View>

        {/* Lista de canciones */}
        <View style={styles.songsSection}>
          <ThemedText style={styles.sectionTitle}>Canciones</ThemedText>
          {artist.songs.map((song, index) => (
            <TouchableOpacity
              key={song.id}
              style={styles.songItem}
              onPress={() => router.push(`/now-playing?songId=${song.id}`)}
            >
              <View style={styles.songNumber}>
                <ThemedText style={styles.songNumberText}>{index + 1}</ThemedText>
              </View>
              {song.coverUrl && (
                <Image
                  source={{ uri: song.coverUrl }}
                  style={styles.songImage}
                  contentFit="cover"
                  transition={200}
                />
              )}
              <View style={styles.songInfo}>
                <ThemedText style={styles.songTitle} numberOfLines={1}>
                  {song.title}
                </ThemedText>
                <ThemedText style={styles.songArtist} numberOfLines={1}>
                  {song.artist}
                </ThemedText>
              </View>
              <Ionicons name="play-circle" size={32} color="#F22976" />
            </TouchableOpacity>
          ))}
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
  },
  artistInfo: {
    alignItems: 'center',
    marginBottom: 32,
    paddingVertical: 24,
  },
  artistImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    marginBottom: 16,
    backgroundColor: '#282828',
  },
  artistName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  songCount: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  songsSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  songItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 4,
  },
  songNumber: {
    width: 32,
    alignItems: 'center',
    marginRight: 12,
  },
  songNumberText: {
    fontSize: 14,
    color: '#B3B3B3',
    fontWeight: '600',
  },
  songImage: {
    width: 56,
    height: 56,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#282828',
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    color: '#B3B3B3',
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



