import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSearch } from '@/hooks/useSearch';
import { useDebounce } from '@/hooks/useDebounce';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

/**
 * CAT-02: Búsqueda de contenido
 * Pantalla para buscar canciones, álbumes, artistas, podcasts y episodios
 */
export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 500);
  const { results, isLoading, hasResults } = useSearch(debouncedQuery, undefined, 20);

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const renderSection = (
    title: string,
    items: any[],
    onItemPress: (item: any) => void,
    renderItem: (item: any, index: number) => React.ReactNode
  ) => {
    if (items.length === 0) return null;

    return (
      <View style={styles.section}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {items.map((item, index) => renderItem(item, index))}
        </ScrollView>
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header con barra de búsqueda */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#B3B3B3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué quieres reproducir?"
            placeholderTextColor="#B3B3B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoFocus
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color="#B3B3B3" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {!searchQuery.trim() ? (
          <View style={styles.emptyState}>
            <Ionicons name="search" size={64} color="#B3B3B3" />
            <ThemedText style={styles.emptyStateText}>
              Busca canciones, artistas, álbumes o podcasts
            </ThemedText>
          </View>
        ) : isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F22976" />
            <ThemedText style={styles.loadingText}>Buscando...</ThemedText>
          </View>
        ) : !hasResults ? (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color="#B3B3B3" />
            <ThemedText style={styles.emptyStateText}>
              No se encontraron resultados para "{searchQuery}"
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Intenta con otros términos de búsqueda
            </ThemedText>
          </View>
        ) : (
          <>
            {/* Canciones */}
            {renderSection(
              'Canciones',
              results.songs,
              (song) => {
                router.push(`/now-playing?songId=${song.id}`);
              },
              (song, index) => (
                <TouchableOpacity
                  key={song.id || index}
                  style={[styles.songCard, isMobile && styles.songCardMobile]}
                  onPress={() => router.push(`/now-playing?songId=${song.id}`)}
                >
                  <Image
                    source={{ uri: song.coverUrl }}
                    style={[styles.songImage, isMobile && styles.songImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText
                    style={[styles.songTitle, isMobile && styles.songTitleMobile]}
                    numberOfLines={1}
                  >
                    {song.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.songArtist, isMobile && styles.songArtistMobile]}
                    numberOfLines={1}
                  >
                    {song.artist}
                  </ThemedText>
                </TouchableOpacity>
              )
            )}

            {/* Álbumes */}
            {renderSection(
              'Álbumes',
              results.albums,
              (album) => {
                router.push(`/album/${album.id}`);
              },
              (album, index) => (
                <TouchableOpacity
                  key={album.id || index}
                  style={[styles.albumCard, isMobile && styles.albumCardMobile]}
                  onPress={() => router.push(`/album/${album.id}`)}
                >
                  <Image
                    source={{ uri: album.coverUrl }}
                    style={[styles.albumImage, isMobile && styles.albumImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText
                    style={[styles.albumTitle, isMobile && styles.albumTitleMobile]}
                    numberOfLines={1}
                  >
                    {album.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.albumArtist, isMobile && styles.albumArtistMobile]}
                    numberOfLines={1}
                  >
                    {album.artist}
                  </ThemedText>
                </TouchableOpacity>
              )
            )}

            {/* Artistas */}
            {renderSection(
              'Artistas',
              results.artists,
              (artist) => {
                router.push(`/artist/${artist.id}`);
              },
              (artist, index) => (
                <TouchableOpacity
                  key={artist.id || index}
                  style={[styles.artistCard, isMobile && styles.artistCardMobile]}
                  onPress={() => router.push(`/artist/${artist.id}`)}
                >
                  <Image
                    source={{ uri: artist.imageUrl }}
                    style={[styles.artistImage, isMobile && styles.artistImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText
                    style={[styles.artistName, isMobile && styles.artistNameMobile]}
                    numberOfLines={1}
                  >
                    {artist.name}
                  </ThemedText>
                </TouchableOpacity>
              )
            )}

            {/* Podcasts */}
            {renderSection(
              'Podcasts',
              results.podcasts,
              (podcast) => {
                router.push(`/podcast/${podcast.id}`);
              },
              (podcast, index) => (
                <TouchableOpacity
                  key={podcast.id || index}
                  style={[styles.podcastCard, isMobile && styles.podcastCardMobile]}
                  onPress={() => router.push(`/podcast/${podcast.id}`)}
                >
                  <Image
                    source={{ uri: podcast.coverUrl }}
                    style={[styles.podcastImage, isMobile && styles.podcastImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText
                    style={[styles.podcastTitle, isMobile && styles.podcastTitleMobile]}
                    numberOfLines={2}
                  >
                    {podcast.title}
                  </ThemedText>
                  <ThemedText
                    style={[styles.podcastPublisher, isMobile && styles.podcastPublisherMobile]}
                    numberOfLines={1}
                  >
                    {podcast.publisher}
                  </ThemedText>
                </TouchableOpacity>
              )
            )}

            {/* Episodios */}
            {renderSection(
              'Episodios',
              results.episodes,
              (episode) => {
                router.push(`/episode/${episode.id}`);
              },
              (episode, index) => (
                <TouchableOpacity
                  key={episode.id || index}
                  style={[styles.episodeCard, isMobile && styles.episodeCardMobile]}
                  onPress={() => router.push(`/episode/${episode.id}`)}
                >
                  <Image
                    source={{ uri: episode.coverUrl }}
                    style={[styles.episodeImage, isMobile && styles.episodeImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText
                    style={[styles.episodeTitle, isMobile && styles.episodeTitleMobile]}
                    numberOfLines={2}
                  >
                    {episode.title}
                  </ThemedText>
                </TouchableOpacity>
              )
            )}
          </>
        )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: isMobile ? 40 : 12,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  backButton: {
    padding: 4,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 24,
    paddingHorizontal: 16,
    height: 40,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  clearButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: isMobile ? 12 : 24,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: isMobile ? 18 : 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  horizontalScroll: {
    marginHorizontal: isMobile ? -12 : -24,
    paddingHorizontal: isMobile ? 12 : 24,
  },
  horizontalScrollContent: {
    paddingRight: isMobile ? 12 : 24,
  },
  songCard: {
    width: 180,
    marginRight: 16,
  },
  songImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
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
  albumCard: {
    width: 180,
    marginRight: 16,
  },
  albumImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  albumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  artistCard: {
    width: 180,
    marginRight: 16,
    alignItems: 'center',
  },
  artistImage: {
    width: 180,
    height: 180,
    borderRadius: 90,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  artistName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  podcastCard: {
    width: 180,
    marginRight: 16,
  },
  podcastImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  podcastTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  podcastPublisher: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  episodeCard: {
    width: 180,
    marginRight: 16,
  },
  episodeImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 8,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  loadingText: {
    fontSize: 14,
    color: '#B3B3B3',
    marginTop: 16,
  },
  // Estilos móviles
  songCardMobile: {
    width: 140,
    marginRight: 12,
  },
  songImageMobile: {
    width: 140,
    height: 140,
  },
  songTitleMobile: {
    fontSize: 13,
  },
  songArtistMobile: {
    fontSize: 11,
  },
  albumCardMobile: {
    width: 140,
    marginRight: 12,
  },
  albumImageMobile: {
    width: 140,
    height: 140,
  },
  albumTitleMobile: {
    fontSize: 13,
  },
  albumArtistMobile: {
    fontSize: 11,
  },
  artistCardMobile: {
    width: 140,
    marginRight: 12,
  },
  artistImageMobile: {
    width: 140,
    height: 140,
  },
  artistNameMobile: {
    fontSize: 11,
  },
  podcastCardMobile: {
    width: 140,
    marginRight: 12,
  },
  podcastImageMobile: {
    width: 140,
    height: 140,
  },
  podcastTitleMobile: {
    fontSize: 13,
  },
  podcastPublisherMobile: {
    fontSize: 11,
  },
  episodeCardMobile: {
    width: 140,
    marginRight: 12,
  },
  episodeImageMobile: {
    width: 140,
    height: 140,
  },
  episodeTitleMobile: {
    fontSize: 13,
  },
});



