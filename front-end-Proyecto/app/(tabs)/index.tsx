import { useState, useEffect } from 'react';
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
import { router } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useFeatured, usePopular } from '@/hooks/useCatalog';
import { usePodcasts } from '@/hooks/usePodcasts';
import { exampleSongs } from '@/data/exampleSongs';
import { popularArtists } from '@/data/artists';
import { examplePodcasts } from '@/data/podcasts';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const { featured, isLoading: featuredLoading } = useFeatured();
  const { popular, isLoading: popularLoading } = usePopular();
  const { podcasts, isLoading: podcastsLoading } = usePodcasts();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');

  // Obtener nombre de usuario para el saludo
  const getUserDisplayName = () => {
    if (user?.name) {
      return user.name.trim();
    }
    return user?.email?.split('@')[0] || 'Usuario';
  };

  // Si el usuario está autenticado, mostrar contenido personalizado
  // Si no, redirigir a la pantalla de home principal
  useEffect(() => {
    if (!isAuthenticated) {
      // En móvil, mantener en tabs pero mostrar mensaje
      // En web, podría redirigir
    }
  }, [isAuthenticated]);

  const renderSection = (
    title: string,
    items: any[],
    onItemPress: (item: any) => void,
    renderItem: (item: any, index: number) => React.ReactNode
  ) => {
    if (items.length === 0) return null;

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

  if (!isAuthenticated) {
  return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>Inicio</ThemedText>
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="musical-notes-outline" size={64} color="#B3B3B3" />
          <ThemedText style={styles.emptyStateText}>
            Inicia sesión para ver contenido personalizado
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth?screen=login')}
          >
            <ThemedText style={styles.loginButtonText}>Iniciar sesión</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Inicio</ThemedText>
        <TouchableOpacity onPress={() => router.push('/search')}>
          <Ionicons name="search" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Saludo */}
        <View style={styles.welcomeSection}>
          <ThemedText style={styles.welcomeText}>
            Bienvenido {getUserDisplayName()}
          </ThemedText>
          <ThemedText style={styles.subtitleText}>
            ¿Qué deseas escuchar hoy?
          </ThemedText>
        </View>

        {/* Artistas populares - Círculos */}
        {renderSection(
          'Artistas populares',
          popularArtists,
          (artist) => {
            router.push(`/artist/${artist.id}`);
          },
          (artist, index) => (
            <TouchableOpacity
              key={artist.id || index}
              style={styles.artistCard}
              onPress={() => router.push(`/artist/${artist.id}`)}
            >
              <Image
                source={{ uri: artist.imageUrl }}
                style={styles.artistCircle}
                contentFit="cover"
                transition={200}
              />
              <ThemedText style={styles.artistName} numberOfLines={1}>
                {artist.name}
              </ThemedText>
            </TouchableOpacity>
          )
        )}

        {/* Podcasts - Recuadros */}
        {renderSection(
          'Podcasts',
          podcasts.length > 0 ? podcasts : examplePodcasts, // Usar podcasts del API si están disponibles
          (podcast) => {
            // Navegar a pantalla de podcast o reproducir directamente
            router.push(`/podcast/${podcast.id}`);
          },
          (podcast, index) => (
            <TouchableOpacity
              key={podcast.id || index}
              style={styles.podcastCard}
              onPress={() => router.push(`/podcast/${podcast.id}`)}
            >
              <Image
                source={{ uri: podcast.coverUrl }}
                style={styles.podcastImage}
                contentFit="cover"
                transition={200}
              />
              <ThemedText style={styles.podcastTitle} numberOfLines={2}>
                {podcast.title}
              </ThemedText>
              {podcast.description && (
                <ThemedText style={styles.podcastDescription} numberOfLines={1}>
                  {podcast.description}
                </ThemedText>
              )}
            </TouchableOpacity>
          )
        )}

        {/* Canciones destacadas - Usar canciones de ejemplo si no hay datos del API */}
        {renderSection(
          'Canciones destacadas',
          (featured?.albums && featured.albums.length > 0) 
            ? featured.albums.slice(0, 10) 
            : exampleSongs.filter(song => !song.isExample), // Excluir podcasts de las canciones destacadas
          (item) => {
            // Navegar al reproductor o detalle
            router.push('/now-playing');
          },
          (item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={styles.albumCard}
              onPress={() => {
                // Navegar con el ID de la canción inmediatamente
                // Las canciones de ejemplo tienen IDs del 1 al 21, así que usamos ese ID
                if (item.id) {
                  // Navegar inmediatamente - la pantalla se actualizará al instante
                  router.push(`/now-playing?songId=${item.id}`);
                } else {
                  router.push('/now-playing');
                }
              }}
            >
              {item.coverUrl ? (
                <Image
                  source={{ uri: item.coverUrl }}
                  style={styles.albumImage}
                  contentFit="cover"
                  transition={200}
                  placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                  onError={(error) => {
                    // Si falla maxresdefault, intentar con hqdefault
                    if (item.coverUrl.includes('maxresdefault') && item.youtubeId) {
                      const fallbackUrl = item.coverUrl.replace('maxresdefault', 'hqdefault');
                      // Nota: expo-image no soporta fallbacks automáticos, así que solo logueamos
                      console.warn('Error cargando imagen, intenta usar:', fallbackUrl);
                    } else {
                      console.warn('Error cargando imagen:', item.coverUrl);
                    }
                  }}
                />
              ) : item.youtubeId ? (
                // Si no hay coverUrl pero hay youtubeId, generar URL automáticamente
                <Image
                  source={{ uri: `https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg` }}
                  style={styles.albumImage}
                  contentFit="cover"
                  transition={200}
                  placeholder={{ blurhash: 'LKO2?U%2Tw=w]~RBVZRi};RPxuwH' }}
                />
              ) : (
                <View style={[styles.albumImage, { backgroundColor: '#282828', justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="musical-notes" size={40} color="#4d4d4d" />
                </View>
              )}
              <ThemedText style={styles.albumTitle} numberOfLines={1}>
                {item.title}
        </ThemedText>
              <ThemedText style={styles.albumArtist} numberOfLines={1}>
                {item.artist}
          </ThemedText>
            </TouchableOpacity>
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  welcomeSection: {
    marginBottom: 32,
    paddingTop: 8,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#B3B3B3',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  section: {
    marginBottom: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  showAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  horizontalScroll: {
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  horizontalScrollContent: {
    paddingRight: 16,
  },
  albumCard: {
    width: 140,
    marginRight: 12,
  },
  albumImage: {
    width: 140,
    height: 140,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  albumTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  albumArtist: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  artistCard: {
    width: 120,
    marginRight: 16,
    alignItems: 'center',
  },
  artistCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  artistName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
  },
  podcastCard: {
    width: 160,
    marginRight: 12,
  },
  podcastImage: {
    width: 160,
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#282828',
  },
  podcastTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  podcastDescription: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    textAlign: 'center',
  },
  loginButton: {
    marginTop: 24,
    backgroundColor: '#F22976',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
