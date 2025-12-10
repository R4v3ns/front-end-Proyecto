import React, { useState } from 'react';
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
import { router } from 'expo-router';
import { usePlaylists, useLikedSongs, useCreatePlaylist, useDeletePlaylist } from '@/hooks/useLibrary';
import { useAuth } from '@/contexts/AuthContext';
import { Playlist } from '@/models/playlist';
import { Song } from '@/models/song';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'playlists' | 'liked'>('playlists');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');

  const { playlists, isLoading: playlistsLoading, refetch: refetchPlaylists } = usePlaylists();
  const { songs: likedSongs, isLoading: likedLoading, refetch: refetchLiked } = useLikedSongs();
  const createPlaylist = useCreatePlaylist();
  const deletePlaylist = useDeletePlaylist();

  const isLoading = activeTab === 'playlists' ? playlistsLoading : likedLoading;

  const handleRefresh = () => {
    if (activeTab === 'playlists') {
      refetchPlaylists();
    } else {
      refetchLiked();
    }
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      Alert.alert('Error', 'El nombre de la playlist es requerido');
      return;
    }

    try {
      await createPlaylist.mutateAsync({
        name: newPlaylistName.trim(),
        isPublic: false,
      });
      setNewPlaylistName('');
      setShowCreateModal(false);
      Alert.alert('Éxito', 'Playlist creada correctamente');
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la playlist');
    }
  };

  const handleDeletePlaylist = (playlist: Playlist) => {
    Alert.alert(
      'Eliminar playlist',
      `¿Estás seguro de que quieres eliminar "${playlist.name}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist.mutateAsync(playlist.id);
              Alert.alert('Éxito', 'Playlist eliminada');
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la playlist');
            }
          },
        },
      ]
    );
  };

  const renderPlaylistCard = (playlist: Playlist) => (
    <TouchableOpacity
      key={playlist.id}
      style={styles.playlistCard}
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
        <ThemedText style={styles.playlistName} numberOfLines={1}>
          {playlist.name}
        </ThemedText>
        <ThemedText style={styles.playlistMeta}>
          {playlist.songCount || 0} canciones
        </ThemedText>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeletePlaylist(playlist)}
      >
        <Ionicons name="trash-outline" size={20} color="#B3B3B3" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderSongCard = (song: Song, index: number) => (
    <TouchableOpacity
      key={song.id || index}
      style={styles.songCard}
      onPress={() => router.push(`/now-playing?songId=${song.id}`)}
    >
      <Image
        source={{ uri: song.coverUrl }}
        style={styles.songImage}
        contentFit="cover"
      />
      <View style={styles.songInfo}>
        <ThemedText style={styles.songTitle} numberOfLines={1}>
          {song.title}
        </ThemedText>
        <ThemedText style={styles.songArtist} numberOfLines={1}>
          {song.artist}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );

  if (!isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.emptyState}>
          <Ionicons name="library-outline" size={64} color="#B3B3B3" />
          <ThemedText style={styles.emptyStateText}>
            Inicia sesión para ver tu biblioteca
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
        <ThemedText style={styles.headerTitle}>Tu biblioteca</ThemedText>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowCreateModal(true)}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'playlists' && styles.tabActive]}
          onPress={() => setActiveTab('playlists')}
        >
          <ThemedText
            style={[styles.tabText, activeTab === 'playlists' && styles.tabTextActive]}
          >
            Playlists
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.tabActive]}
          onPress={() => setActiveTab('liked')}
        >
          <ThemedText
            style={[styles.tabText, activeTab === 'liked' && styles.tabTextActive]}
          >
            Canciones que te gustan
          </ThemedText>
        </TouchableOpacity>
      </View>

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
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#F22976" />
          </View>
        ) : activeTab === 'playlists' ? (
          playlists.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="list-outline" size={64} color="#B3B3B3" />
              <ThemedText style={styles.emptyStateText}>
                No tienes playlists aún
              </ThemedText>
              <ThemedText style={styles.emptyStateSubtext}>
                Crea tu primera playlist para comenzar
              </ThemedText>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => setShowCreateModal(true)}
              >
                <ThemedText style={styles.createButtonText}>Crear playlist</ThemedText>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.playlistsGrid}>
              {playlists.map(renderPlaylistCard)}
            </View>
          )
        ) : likedSongs.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color="#B3B3B3" />
            <ThemedText style={styles.emptyStateText}>
              No tienes canciones guardadas
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Dale like a las canciones que te gusten
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
            <ThemedText style={styles.modalTitle}>Crear nueva playlist</ThemedText>
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre de la playlist"
              placeholderTextColor="#B3B3B3"
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
                <ThemedText style={styles.modalButtonText}>Cancelar</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCreate]}
                onPress={handleCreatePlaylist}
                disabled={createPlaylist.isPending}
              >
                <ThemedText style={styles.modalButtonText}>
                  {createPlaylist.isPending ? 'Creando...' : 'Crear'}
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
    backgroundColor: '#121212',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: isMobile ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
  },
  addButton: {
    padding: 4,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#282828',
    gap: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tabActive: {
    backgroundColor: '#282828',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
  },
  tabTextActive: {
    color: '#FFFFFF',
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
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  playlistImage: {
    width: 60,
    height: 60,
    borderRadius: 4,
    backgroundColor: '#282828',
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
    color: '#FFFFFF',
    marginBottom: 4,
  },
  playlistMeta: {
    fontSize: 14,
    color: '#B3B3B3',
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
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  songImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
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
    backgroundColor: '#181818',
    borderRadius: 12,
    padding: 24,
    width: isMobile ? '90%' : 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  modalInput: {
    backgroundColor: '#282828',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 16,
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
    backgroundColor: '#282828',
  },
  modalButtonCreate: {
    backgroundColor: '#F22976',
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});


