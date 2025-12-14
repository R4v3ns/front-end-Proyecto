import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  TextInput,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { router } from 'expo-router';
import { usePlaylists, useLikedSongs, useCreatePlaylist, useDeletePlaylist } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { Playlist } from '@/models/playlist';
import { Song } from '@/models/song';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useTranslation } from '@/hooks/useTranslation';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked'>('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const { playlists, isLoading: playlistsLoading, refetch: refetchPlaylists } = usePlaylists();
  const { songs: likedSongs, isLoading: likedLoading, refetch: refetchLiked } = useLikedSongs();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const isLoading = activeTab === 'playlists' ? playlistsLoading : likedLoading;
  
  // Colores dinámicos del tema
  const { currentTheme } = usePreferences();
  const isDark = currentTheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({ light: '#CC7AF240', dark: '#333333' }, 'background');
  
  // Colores para los bloques
  const cardBg = isDark ? '#000000' : backgroundColor; // Negro en dark, fondo del tema en light
  const cardBorder = isDark ? '#333333' : '#CC7AF280'; // Borde más visible en dark
  const metaTextColor = isDark ? '#B3B3B3' : '#666666'; // Gris más claro en dark
  
  // Crear estilos dinámicos que se actualicen con el tema
  const dynamicStyles = useMemo(() => StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      paddingTop: isMobile ? 50 : 12,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: textColor,
      flex: 1,
    },
    tabs: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: borderColor,
      gap: 8,
    },
    tab: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
    },
    tabActive: {
      backgroundColor: '#CC7AF220', // Púrpura claro con 20% opacidad
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDark ? '#B3B3B3' : '#666666',
    },
    tabTextActive: {
      color: textColor,
      fontWeight: '700',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    playlistCard: {
      backgroundColor: cardBg,
      borderColor: cardBorder,
    },
    playlistName: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    playlistMeta: {
      fontSize: 14,
      color: metaTextColor,
    },
    songCard: {
      backgroundColor: cardBg,
      borderColor: cardBorder,
    },
    songTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: textColor,
      marginBottom: 4,
    },
    songArtist: {
      fontSize: 14,
      color: metaTextColor,
    },
    emptyStateText: {
      fontSize: 18,
      fontWeight: '600',
      color: textColor,
      marginTop: 16,
      textAlign: 'center',
    },
    emptyStateSubtext: {
      fontSize: 14,
      color: metaTextColor,
      marginTop: 8,
      textAlign: 'center',
    },
  }), [backgroundColor, textColor, borderColor, isMobile, cardBg, cardBorder, metaTextColor, isDark, isMobile]);

  const handleRefresh = () => {
    if (activeTab === 'playlists') {
      refetchPlaylists();
    } else {
      refetchLiked();
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert(t('common.error') || 'Error', t('library.nameRequired'));
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: newPlaylistName.trim(),
        isPublic: false,
      });
      setNewPlaylistName('');
      setShowCreateModal(false);
      Alert.alert(t('common.success') || 'Éxito', t('library.createSuccess'));
    } catch (error) {
      Alert.alert(t('common.error') || 'Error', t('library.createError'));
    }
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      t('library.deletePlaylist'),
      t('library.deleteConfirm').replace('{name}', playlist.name),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete') || 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist.mutateAsync(playlist.id);
              Alert.alert(t('common.success') || 'Éxito', t('library.deleteSuccess'));
            } catch (error) {
              Alert.alert(t('common.error') || 'Error', t('library.deleteError'));
            }
          },
        },
      ]
    );
  };

  const renderPlaylistCard = (playlist: Playlist) => (
    <TouchableOpacity
      key={playlist.id}
      style={[styles.playlistCard, dynamicStyles.playlistCard]}
      onPress={() => router.push(`/playlist/${playlist.id}`)}
    >
      {playlist.coverUrl ? (
        <Image
          source={{ uri: playlist.coverUrl }}
          style={styles.playlistImage}
          contentFit="cover"
        />
      ) : (
        <View style={[styles.playlistImage, styles.playlistImagePlaceholder]}>
          <Ionicons name="musical-notes" size={40} color="#B3B3B3" />
        </View>
      )}
      <View style={styles.playlistInfo}>
        <ThemedText style={dynamicStyles.playlistName} numberOfLines={1}>
          {playlist.name}
        </ThemedText>
        <ThemedText style={[styles.playlistMeta, dynamicStyles.playlistMeta]}>
          {playlist.songCount || 0} {t('library.songs')}
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlaylist(playlist)}
      >
        <Ionicons name="trash-outline" size={20} color={metaTextColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongCard = (song: Song, index: number) => (
    <TouchableOpacity
      key={song.id || index}
      style={[styles.songCard, dynamicStyles.songCard]}
      onPress={() => router.push(`/now-playing?songId=${song.id}`)}
    >
      <Image
        source={{ uri: song.coverUrl }}
        style={styles.songImage}
        contentFit="cover"
      />
      <View style={styles.songInfo}>
        <ThemedText style={dynamicStyles.songTitle} numberOfLines={1}>
          {song.title}
        </ThemedText>
        <ThemedText style={[styles.songArtist, dynamicStyles.songArtist]} numberOfLines={1}>
          {song.artist}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={dynamicStyles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color="#666666" />
          <ThemedText style={dynamicStyles.emptyStateText}>
            {t('library.emptyLogin')}
          </ThemedText>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth?screen=login')}
          >
            <ThemedText style={styles.loginButtonText}>{t('home.loginButton')}</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
          <ThemedText style={dynamicStyles.headerTitle}>{t('library.title')}</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color={textColor} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={dynamicStyles.tabs}>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'playlists' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('playlists')}
        >
          <ThemedText
            style={[dynamicStyles.tabText, activeTab === 'playlists' && dynamicStyles.tabTextActive]}
          >
            {t('library.playlists')}
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[dynamicStyles.tab, activeTab === 'liked' && dynamicStyles.tabActive]}
          onPress={() => setActiveTab('liked')}
        >
          <ThemedText
            style={[dynamicStyles.tabText, activeTab === 'liked' && dynamicStyles.tabTextActive]}
          >
            {t('library.liked')}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={dynamicStyles.scrollView}
        contentContainerStyle={dynamicStyles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={handleRefresh}
            tintColor="#F22976"
          />
        }
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F22976" />
          </View>
        ) : activeTab === 'playlists' ? (
          playlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color="#666666" />
              <ThemedText style={dynamicStyles.emptyStateText}>
                {t('library.emptyPlaylists')}
              </ThemedText>
              <ThemedText style={[styles.emptyStateSubtext, dynamicStyles.emptyStateSubtext]}>
                {t('library.emptyPlaylistsSubtext')}
              </ThemedText>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <ThemedText style={styles.createButtonText}>{t('library.createPlaylist')}</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsGrid}>
              {playlists.map(renderPlaylistCard)}
            </View>
          )
        ) : likedSongs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#666666" />
            <ThemedText style={dynamicStyles.emptyStateText}>
              {t('library.emptyLiked')}
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              {t('library.emptyLikedSubtext')}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.songsList}>
            {likedSongs.map((song, index) => renderSongCard(song, index))}
          </View>
        )}
      </ScrollView>

      {/* Modal de crear playlist */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText style={styles.modalTitle}>{t('library.createPlaylistTitle')}</ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder={t('library.playlistNamePlaceholder')}
              placeholderTextColor="#999999"
              value={newPlaylistName}
              onChangeText={setNewPlaylistName}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => {
                  setShowCreateModal(false);
                  setNewPlaylistName('');
                }}
              >
                <ThemedText style={styles.modalButtonText}>{t('common.cancel')}</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreatePlaylist}
                disabled={createPlaylist.isPending}
              >
                <ThemedText style={styles.modalButtonText}>
                  {createPlaylist.isPending ? t('library.creating') : t('library.create')}
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', // Fondo blanco
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: isMobile ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#CC7AF240', // Borde púrpura claro sutil
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000', // Texto negro
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  // tabs, tab, tabActive se aplican dinámicamente
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666666', // Gris oscuro
  },
  tabTextActive: {
    color: '#000000', // Texto negro
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  playlistsGrid: {
    gap: 12,
  },
  playlistCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 8,
    padding: 12,
    gap: 12,
    borderWidth: 1,
    borderColor: '#CC7AF280', // Borde púrpura claro
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#CC7AF215', // Fondo púrpura claro muy sutil
  },
  playlistImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    // color se aplica dinámicamente
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    // color se aplica dinámicamente
  },
  deleteButton: {
    padding: 8,
  },
  songsList: {
    gap: 8,
  },
  songCard: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor se aplica dinámicamente
    borderRadius: 8,
    borderWidth: 1,
    // borderColor se aplica dinámicamente
    padding: 12,
    gap: 12,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    backgroundColor: '#CC7AF215', // Fondo púrpura claro muy sutil
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    // color se aplica dinámicamente
    marginBottom: 4,
  },
  songArtist: {
    fontSize: 14,
    // color se aplica dinámicamente
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '600',
    // color se aplica dinámicamente
    marginTop: 16,
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    // color se aplica dinámicamente
    marginTop: 8,
    textAlign: 'center',
  },
  createButton: {
    marginTop: 24,
    backgroundColor: '#F22976',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
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
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 12,
    padding: 24,
    width: isMobile ? '90%' : 400,
    borderWidth: 1,
    borderColor: '#CC7AF280', // Borde púrpura claro
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000', // Texto negro
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#FFFFFF', // Fondo blanco
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000000', // Texto negro
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#CC7AF280', // Borde púrpura claro
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalButtonCancel: {
    backgroundColor: '#CC7AF215', // Púrpura claro muy sutil
    borderWidth: 1,
    borderColor: '#CC7AF280', // Borde púrpura claro
  },
  modalButtonCreate: {
    backgroundColor: '#F22976', // Rosa para botón de acción
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000', // Texto negro
  },
});




