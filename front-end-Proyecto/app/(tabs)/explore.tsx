import React from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useFeatured, useNewReleases, usePopular, useGenres } from '@/hooks/useCatalog';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

/**
 * CAT-01: Explorar catálogo
 * Pantalla para explorar álbumes, artistas, géneros y contenido destacado
 */
export default function ExploreScreen() {
  const { featured, isLoading: featuredLoading, refetch: refetchFeatured } = useFeatured();
  const { albums: newReleases, isLoading: newReleasesLoading, refetch: refetchNewReleases } = useNewReleases();
  const { popular, isLoading: popularLoading, refetch: refetchPopular } = usePopular();
  const { genres, isLoading: genresLoading, refetch: refetchGenres } = useGenres();

  const isLoading = featuredLoading || newReleasesLoading || popularLoading || genresLoading;

  const handleRefresh = () => {
    refetchFeatured();
    refetchNewReleases();
    refetchPopular();
    refetchGenres();
  };

  const renderSection = (
    title: string,
    items: any[],
    onItemPress: (item: any) => void,
    renderItem: (item: any, index: number) => React.ReactNode,
    emptyMessage?: string
  ) => {
    if (isLoading) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F22976" />
          </View>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <ThemedText style={styles.emptyMessage}>
            {emptyMessage || 'No hay contenido disponible'}
          </ThemedText>
        </View>
      );
    }

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <TouchableOpacity>
            <ThemedText style={styles.showAllLink}>Ver todo</ThemedText>
          </TouchableOpacity>
        </View>
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
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#F22976"
          />
        }
      >
        {/* Nuevos lanzamientos */}
        {renderSection(
          'Nuevos lanzamientos',
          newReleases,
          (album) => {
            // Navegar a detalles del álbum
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
          ),
          'No hay nuevos lanzamientos disponibles'
        )}

        {/* Artistas populares */}
        {renderSection(
          'Artistas populares',
          popular.artists,
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
          ),
          'No hay artistas populares disponibles'
        )}

        {/* Álbumes populares */}
        {renderSection(
          'Álbumes populares',
          popular.albums,
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
          ),
          'No hay álbumes populares disponibles'
        )}

        {/* Géneros */}
        {renderSection(
          'Explorar por género',
          genres,
          (genre) => {
            router.push(`/genre/${genre.id}`);
          },
          (genre, index) => (
            <TouchableOpacity
              key={genre.id || index}
              style={[styles.genreCard, isMobile && styles.genreCardMobile]}
              onPress={() => router.push(`/genre/${genre.id}`)}
            >
              {genre.imageUrl ? (
                <Image
                  source={{ uri: genre.imageUrl }}
                  style={[styles.genreImage, isMobile && styles.genreImageMobile]}
                  contentFit="cover"
                  transition={200}
                />
              ) : (
                <View
                  style={[
                    styles.genreImage,
                    isMobile && styles.genreImageMobile,
                    { backgroundColor: genre.color || '#F22976' },
                  ]}
                >
                  <Ionicons name="musical-notes" size={40} color="#FFFFFF" />
                </View>
              )}
              <ThemedText
                style={[styles.genreName, isMobile && styles.genreNameMobile]}
                numberOfLines={1}
              >
                {genre.name}
              </ThemedText>
            </TouchableOpacity>
          ),
          'No hay géneros disponibles'
        )}

        {/* Contenido destacado */}
        {featured.albums.length > 0 && (
          renderSection(
            'Destacado',
            featured.albums,
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
          )
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
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  showAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  horizontalScroll: {
    marginHorizontal: isMobile ? -12 : -24,
    paddingHorizontal: isMobile ? 12 : 24,
  },
  horizontalScrollContent: {
    paddingRight: isMobile ? 12 : 24,
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
  genreCard: {
    width: 180,
    marginRight: 16,
  },
  genreImage: {
    width: 180,
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
    justifyContent: 'center',
    alignItems: 'center',
  },
  genreName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyMessage: {
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
    padding: 20,
  },
  // Estilos móviles
  albumCardMobile: {
    width: 140,
    marginRight: 12,
  },
  albumImageMobile: {
    width: 140,
    height: 140,
    borderRadius: 6,
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
  genreCardMobile: {
    width: 140,
    marginRight: 12,
  },
  genreImageMobile: {
    width: 140,
    height: 140,
  },
  genreNameMobile: {
    fontSize: 13,
  },
});
