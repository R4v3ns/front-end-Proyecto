import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import {
  usePlaylist,
  useRemoveSongFromPlaylist,
  useUpdatePlaylist,
  useDeletePlaylist,
} from '@/hooks/useLibrary';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { Song } from '@/models/song';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function PlaylistDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const playlistId = params.id ? parseInt(params.id, 10) : null;
  const [showMenu, setShowMenu] = useState(false);

  const { playlist, isLoading, refetch } = usePlaylist(playlistId);
  const removeSong = useRemoveSongFromPlaylist();
  const updatePlaylist = useUpdatePlaylist();
  const deletePlaylist = useDeletePlaylist();
  const { playSong } = useAudioPlayer(playlist?.songs || []);

  const handlePlayAll = () => {
    if (playlist?.songs && playlist.songs.length > 0) {
      playSong(playlist.songs[0]);
    }
  };

  const handleRemoveSong = (songId: number) => {
    if (!playlistId) return;

    Alert.alert(
      'Quitar canción',
      '¿Quieres quitar esta canción de la playlist?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Quitar',
          style: 'destructive',
          onPress: async () => {
            try {
              await removeSong.mutateAsync({ playlistId, songId });
            } catch (error) {
              Alert.alert('Error', 'No se pudo quitar la canción');
            }
          },
        },
      ]
    );
  };

  const handleDeletePlaylist = () => {
    if (!playlistId || !playlist) return;

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
              await deletePlaylist.mutateAsync(playlistId);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la playlist');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Playlist</ThemedText>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F22976" />
        </View>
      </ThemedView>
    );
  }

  if (!playlist) {
    return (
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Playlist</ThemedText>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="list-outline" size={64} color="#B3B3B3" />
          <ThemedText style={styles.emptyStateText}>Playlist no encontrada</ThemedText>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1}>
          {playlist.name}
        </ThemedText>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
          <Ionicons name="ellipsis-vertical" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowMenu(false);
              handleDeletePlaylist();
            }}
          >
            <Ionicons name="trash-outline" size={20} color="#FFFFFF" />
            <ThemedText style={styles.menuItemText}>Eliminar playlist</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#F22976" />
        }
      >
        {/* Header de la playlist */}
        <View style={styles.playlistHeader}>
          {playlist.coverUrl ? (
            <Image
              source={{ uri: playlist.coverUrl }}
              style={styles.playlistCover}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.playlistCover, styles.playlistCoverPlaceholder]}>
              <Ionicons name="musical-notes" size={64} color="#B3B3B3" />
            </View>
          )}
          <View style={styles.playlistInfo}>
            <ThemedText style={styles.playlistName}>{playlist.name}</ThemedText>
            {playlist.description && (
              <ThemedText style={styles.playlistDescription}>{playlist.description}</ThemedText>
            )}
            <ThemedText style={styles.playlistMeta}>
              {playlist.songCount || 0} canciones
            </ThemedText>
          </View>
        </View>

        {/* Botón de reproducir */}
        <TouchableOpacity style={styles.playButton} onPress={handlePlayAll}>
          <Ionicons name="play" size={24} color="#000000" />
          <ThemedText style={styles.playButtonText}>Reproducir</ThemedText>
        </TouchableOpacity>

        {/* Lista de canciones */}
        {playlist.songs && playlist.songs.length > 0 ? (
          <View style={styles.songsList}>
            {playlist.songs.map((song: Song, index: number) => (
              <TouchableOpacity
                key={song.id || index}
                style={styles.songRow}
                onPress={() => playSong(song)}
              >
                <ThemedText style={styles.songIndex}>{index + 1}</ThemedText>
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
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveSong(song.id)}
                >
                  <Ionicons name="close" size={20} color="#B3B3B3" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="musical-notes-outline" size={64} color="#B3B3B3" />
            <ThemedText style={styles.emptyStateText}>
              Esta playlist está vacía
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              Agrega canciones para comenzar
            </ThemedText>
          </View>
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
    paddingTop: isMobile ? 40 : 12,
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
  headerRight: {
    width: 32,
  },
  menu: {
    position: 'absolute',
    top: isMobile ? 60 : 50,
    right: 16,
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 8,
    zIndex: 100,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  menuItemText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  playlistHeader: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  playlistCover: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  playlistCoverPlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playlistInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  playlistName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  playlistDescription: {
    fontSize: 14,
    color: '#B3B3B3',
    marginBottom: 8,
  },
  playlistMeta: {
    fontSize: 14,
    color: '#B3B3B3',
  },
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F22976',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 32,
    marginBottom: 24,
    gap: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  songsList: {
    gap: 8,
  },
  songRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  songIndex: {
    width: 24,
    fontSize: 14,
    color: '#B3B3B3',
    textAlign: 'center',
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
  removeButton: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
});




