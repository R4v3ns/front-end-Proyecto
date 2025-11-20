import { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TextInput,
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

const { width, height } = Dimensions.get('window');
const isMobile = width < 768; // Consideramos móvil si el ancho es menor a 768px

// Datos de ejemplo para las canciones
const featuredSongs = [
  {
    id: 1,
    title: 'Titulo de la cancion 1',
    artist: 'Cancion 1',
    image: 'https://via.placeholder.com/200/FF6B35/FFFFFF?text=Pasajero',
  },
  {
    id: 2,
    title: 'Titulo de la cancion 2',
    artist: 'Cancion 2',
    image: 'https://via.placeholder.com/200/87CEEB/FFFFFF?text=La+Perla',
  },
  {
    id: 3,
    title: 'Titulo de la cancion 3',
    artist: 'Cancion 3',
    image: 'https://via.placeholder.com/200/FFB6C1/FFFFFF?text=Supersonic',
  },
  {
    id: 4,
    title: 'Titulo de la cancion 4',
    artist: 'Cancion 4',
    image: 'https://via.placeholder.com/200/FF69B4/FFFFFF?text=VLONE',
  },
  {
    id: 5,
    title: 'Titulo de la cancion 5',
    artist: 'Cancion 5',
    image: 'https://via.placeholder.com/200/FFA500/FFFFFF?text=Cantante',
  },
  {
    id: 6,
    title: 'Titulo de la cancion 6',
    artist: 'Cancion 6',
    image: 'https://via.placeholder.com/200/FF0000/FFFFFF?text=RAPIDO',
  },
];

// Datos de ejemplo para artistas
const popularArtists = [
  {
    id: 1,
    name: 'Artista 1',
    image: 'https://via.placeholder.com/200/333333/FFFFFF?text=Artist1',
  },
  {
    id: 2,
    name: 'Artista 2',
    image: 'https://via.placeholder.com/200/444444/FFFFFF?text=Artist2',
  },
  {
    id: 3,
    name: 'Artista 3',
    image: 'https://via.placeholder.com/200/555555/FFFFFF?text=Artist3',
  },
  {
    id: 4,
    name: 'Artista 4',
    image: 'https://via.placeholder.com/200/666666/FFFFFF?text=Artist4',
  },
  {
    id: 5,
    name: 'Artista 5',
    image: 'https://via.placeholder.com/200/777777/FFFFFF?text=Artist5',
  },
  {
    id: 6,
    name: 'Artista 6',
    image: 'https://via.placeholder.com/200/888888/FFFFFF?text=Artist6',
  },
];

export default function HomeScreen() {
  const { isAuthenticated, user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');

  // Si el usuario está autenticado, redirigir al perfil
  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/profile');
    }
  }, [isAuthenticated]);

  return (
    <ThemedView style={[styles.container, { backgroundColor: '#121212' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#121212' }, isMobile && styles.headerMobile]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.logoButton}>
            <Ionicons name="musical-notes" size={isMobile ? 28 : 32} color="#F22976" />
          </TouchableOpacity>
          {!isMobile && (
            <TouchableOpacity style={styles.homeButton}>
              <Ionicons name="home" size={24} color={textColor} />
            </TouchableOpacity>
          )}
        </View>
        {!isMobile && (
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#B3B3B3" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="¿Qué quieres reproducir?"
              placeholderTextColor="#B3B3B3"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}
        <View style={[styles.headerRight, isMobile && styles.headerRightMobile]}>
          <TouchableOpacity 
            style={[styles.registerButton, isMobile && styles.registerButtonMobile]}
            onPress={() => {
              console.log('Navigating to register');
              router.push('/auth?screen=register');
            }}
          >
            <ThemedText style={[styles.registerButtonText, isMobile && styles.registerButtonTextMobile]}>Regístrate</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.loginButton, isMobile && styles.loginButtonMobile]}
            onPress={() => {
              console.log('Navigating to login');
              router.push('/auth?screen=login');
            }}
          >
            <ThemedText style={[styles.loginButtonText, isMobile && styles.loginButtonTextMobile]}>Iniciar sesión</ThemedText>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Barra de búsqueda móvil */}
      {isMobile && (
        <View style={styles.searchContainerMobile}>
          <Ionicons name="search" size={20} color="#B3B3B3" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="¿Qué quieres reproducir?"
            placeholderTextColor="#B3B3B3"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      )}

      <View style={styles.contentContainer}>
        {/* Sidebar - Oculto en móvil */}
        {!isMobile && (
          <View style={[styles.sidebar, { backgroundColor: '#000000' }]}>
          <View style={styles.libraryHeader}>
            <ThemedText style={styles.libraryTitle}>Tu biblioteca</ThemedText>
            <TouchableOpacity style={styles.addButton}>
              <Ionicons name="add" size={24} color={textColor} />
            </TouchableOpacity>
          </View>

          <View style={styles.libraryCard}>
            <ThemedText style={styles.cardTitle}>Crea tu primera playlist</ThemedText>
            <ThemedText style={styles.cardDescription}>
              ¡Es muy fácil! Te vamos a ayudar
            </ThemedText>
            <TouchableOpacity style={styles.createButton}>
              <ThemedText style={styles.createButtonText}>Crear playlist</ThemedText>
            </TouchableOpacity>
          </View>

          <View style={styles.libraryCard}>
            <ThemedText style={styles.cardTitle}>
              Busquemos algunos podcasts para seguir
            </ThemedText>
            <ThemedText style={styles.cardDescription}>
              Te avisaremos cuando salgan nuevos episodios
            </ThemedText>
          </View>

          <TouchableOpacity style={styles.languageButton}>
            <Ionicons name="globe-outline" size={20} color={textColor} />
            <ThemedText style={styles.languageText}>Español de Latinoamérica</ThemedText>
          </TouchableOpacity>
          </View>
        )}

        {/* Main Content */}
        <ScrollView
          style={styles.mainContent}
          contentContainerStyle={[styles.mainContentScroll, isMobile && styles.mainContentScrollMobile]}
          showsVerticalScrollIndicator={false}
        >
          {/* Canciones del momento */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Canciones del momento</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.showAllLink}>Mostrar todo</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {featuredSongs.map((song) => (
                <TouchableOpacity key={song.id} style={[styles.songCard, isMobile && styles.songCardMobile]}>
                  <Image 
                    source={{ uri: song.image }} 
                    style={[styles.songImage, isMobile && styles.songImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText style={[styles.songTitle, isMobile && styles.songTitleMobile]} numberOfLines={1}>
                    {song.title}
                  </ThemedText>
                  <ThemedText style={[styles.songArtist, isMobile && styles.songArtistMobile]} numberOfLines={1}>
                    {song.artist}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Artistas populares */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <ThemedText style={styles.sectionTitle}>Artistas populares</ThemedText>
              <TouchableOpacity>
                <ThemedText style={styles.showAllLink}>Mostrar todo</ThemedText>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.horizontalScroll}
            >
              {popularArtists.map((artist) => (
                <TouchableOpacity key={artist.id} style={[styles.artistCard, isMobile && styles.artistCardMobile]}>
                  <Image 
                    source={{ uri: artist.image }} 
                    style={[styles.artistImage, isMobile && styles.artistImageMobile]}
                    contentFit="cover"
                    transition={200}
                  />
                  <ThemedText style={[styles.artistName, isMobile && styles.artistNameMobile]} numberOfLines={1}>
                    {artist.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>
      </View>

      {/* Bottom Banner */}
      <View style={[styles.bottomBanner, isMobile && styles.bottomBannerMobile]}>
        <ThemedText style={[styles.bannerText, isMobile && styles.bannerTextMobile]}>
          {isMobile 
            ? 'Regístrate para acceder a canciones y podcasts ilimitados con algunos anuncios.'
            : 'Muestra de Spotify Regístrate para acceder a canciones y podcasts ilimitados con algunos anuncios. No necesitas tarjeta de crédito.'}
        </ThemedText>
        <TouchableOpacity style={[styles.bannerButton, isMobile && styles.bannerButtonMobile]}>
          <ThemedText style={[styles.bannerButtonText, isMobile && styles.bannerButtonTextMobile]}>Regístrate gratis</ThemedText>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    gap: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  logoButton: {
    padding: 4,
  },
  homeButton: {
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
    maxWidth: 400,
    marginHorizontal: 16,
  },
  searchIcon: {
    marginRight: 8,
    color: '#B3B3B3',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginLeft: 'auto',
  },
  registerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  registerButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 24,
  },
  loginButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 240,
    backgroundColor: '#000000',
    padding: 16,
    borderRightWidth: 1,
    borderRightColor: '#282828',
  },
  libraryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  libraryTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  addButton: {
    padding: 4,
  },
  libraryCard: {
    backgroundColor: '#121212',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  cardDescription: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 16,
  },
  createButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 24,
    alignSelf: 'flex-start',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  legalLinks: {
    marginTop: 24,
    gap: 8,
  },
  legalLink: {
    fontSize: 11,
    color: '#B3B3B3',
    marginBottom: 4,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    padding: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#282828',
    gap: 8,
  },
  languageText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  mainContent: {
    flex: 1,
    backgroundColor: '#121212',
  },
  mainContentScroll: {
    padding: 24,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  showAllLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  horizontalScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
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
  bottomBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#7B2CBF',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#282828',
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#FFFFFF',
    marginRight: 16,
  },
  bannerButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
  },
  bannerButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000000',
  },
  // Estilos móviles
  headerMobile: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  headerRightMobile: {
    gap: 8,
  },
  searchContainerMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#282828',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    marginHorizontal: 12,
    marginVertical: 8,
  },
  registerButtonMobile: {
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  registerButtonTextMobile: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  loginButtonMobile: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 18,
  },
  loginButtonTextMobile: {
    fontSize: 11,
    fontWeight: '700',
    color: '#000000',
  },
  mainContentScrollMobile: {
    padding: 12,
    paddingBottom: 140,
  },
  songCardMobile: {
    width: 140,
    marginRight: 12,
  },
  songImageMobile: {
    width: 140,
    height: 140,
    borderRadius: 6,
  },
  songTitleMobile: {
    fontSize: 13,
    marginTop: 8,
  },
  songArtistMobile: {
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
    marginTop: 8,
  },
  bottomBannerMobile: {
    flexDirection: 'column',
    padding: 12,
    gap: 10,
    alignItems: 'center',
  },
  bannerTextMobile: {
    fontSize: 11,
    textAlign: 'center',
    marginRight: 0,
    lineHeight: 16,
  },
  bannerButtonMobile: {
    paddingVertical: 10,
    paddingHorizontal: 28,
    borderRadius: 20,
    minWidth: 140,
  },
  bannerButtonTextMobile: {
    fontSize: 12,
    fontWeight: '700',
  },
});



