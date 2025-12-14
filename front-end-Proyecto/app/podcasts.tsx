import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { usePodcasts, useFollowingPodcasts, useFollowPodcast, useUnfollowPodcast } from '@/hooks/usePodcasts';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

/**
 * CAT-03: Explorar podcasts
 * Pantalla para explorar podcasts, ver episodios y seguir/dejar de seguir podcasts
 */
export default function PodcastsScreen() {
  const { isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState<'all' | 'following'>('all');
  
  const { podcasts, isLoading: allLoading, refetch: refetchAll } = usePodcasts();
  const { podcasts: following, isLoading: followingLoading, refetch: refetchFollowing } = useFollowingPodcasts();
  
  const followMutation = useFollowPodcast();
  const unfollowMutation = useUnfollowPodcast();

  const isLoading = activeTab === 'all' ? allLoading : followingLoading;
  const displayedPodcasts = activeTab === 'all' ? podcasts : following;

  const handleRefresh = () => {
    if (activeTab === 'all') {
      refetchAll();
    } else {
      refetchFollowing();
    }
  };

  const handleFollow = async (podcastId: number) => {
    try {
      await followMutation.mutateAsync(podcastId);
    } catch (error) {
      console.error('Error following podcast:', error);
    }
  };

  const handleUnfollow = async (podcastId: number) => {
    try {
      await unfollowMutation.mutateAsync(podcastId);
    } catch (error) {
      console.error('Error unfollowing podcast:', error);
    }
  };

  const renderPodcastCard = (podcast: any, index: number) => (
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
      <View style={styles.podcastInfo}>
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
        {podcast.description && (
          <ThemedText
            style={[styles.podcastDescription, isMobile && styles.podcastDescriptionMobile]}
            numberOfLines={2}
          >
            {podcast.description}
          </ThemedText>
        )}
        <View style={styles.podcastMeta}>
          <ThemedText style={styles.podcastEpisodes}>
            {podcast.totalEpisodes || 0} episodios
          </ThemedText>
          {podcast.category && (
            <>
              <ThemedText style={styles.podcastMetaSeparator}>•</ThemedText>
              <ThemedText style={styles.podcastCategory}>{podcast.category}</ThemedText>
            </>
          )}
        </View>
      </View>
      {isAuthenticated && (
        <TouchableOpacity
          style={styles.followButton}
          onPress={(e) => {
            e.stopPropagation();
            if (podcast.isFollowing) {
              handleUnfollow(podcast.id);
            } else {
              handleFollow(podcast.id);
            }
          }}
        >
          <Ionicons
            name={podcast.isFollowing ? 'heart' : 'heart-outline'}
            size={24}
            color={podcast.isFollowing ? '#F22976' : '#FFFFFF'}
          />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Podcasts</ThemedText>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.searchButton}
            onPress={() => router.push('/search')}
          >
            <Ionicons name="search" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tabs */}
      {isAuthenticated && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.tabActive]}
            onPress={() => setActiveTab('all')}
          >
            <ThemedText
              style={[styles.tabText, activeTab === 'all' && styles.tabTextActive]}
            >
              Todos
            </ThemedText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'following' && styles.tabActive]}
            onPress={() => setActiveTab('following')}
          >
            <ThemedText
              style={[styles.tabText, activeTab === 'following' && styles.tabTextActive]}
            >
              Siguiendo
            </ThemedText>
          </TouchableOpacity>
        </View>
      )}

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
            <ThemedText style={styles.loadingText}>Cargando podcasts...</ThemedText>
          </View>
        ) : displayedPodcasts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="radio-outline" size={64} color="#B3B3B3" />
            <ThemedText style={styles.emptyStateText}>
              {activeTab === 'following'
                ? 'No estás siguiendo ningún podcast'
                : 'No hay podcasts disponibles'}
            </ThemedText>
            <ThemedText style={styles.emptyStateSubtext}>
              {activeTab === 'following'
                ? 'Explora podcasts y comienza a seguir tus favoritos'
                : 'Los podcasts aparecerán aquí cuando estén disponibles'}
            </ThemedText>
            {activeTab === 'following' && (
              <TouchableOpacity
                style={styles.exploreButton}
                onPress={() => setActiveTab('all')}
              >
                <ThemedText style={styles.exploreButtonText}>Explorar podcasts</ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <View style={styles.podcastsGrid}>
            {displayedPodcasts.map((podcast, index) => renderPodcastCard(podcast, index))}
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    width: 32,
    alignItems: 'flex-end',
  },
  searchButton: {
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
    padding: isMobile ? 12 : 24,
    paddingBottom: 100,
  },
  podcastsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  podcastCard: {
    width: isMobile ? '100%' : '48%',
    backgroundColor: '#181818',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    gap: 12,
  },
  podcastImage: {
    width: 120,
    height: 120,
    borderRadius: 8,
    backgroundColor: '#282828',
  },
  podcastInfo: {
    flex: 1,
  },
  podcastTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  podcastPublisher: {
    fontSize: 14,
    fontWeight: '600',
    color: '#B3B3B3',
    marginBottom: 8,
  },
  podcastDescription: {
    fontSize: 13,
    color: '#B3B3B3',
    marginBottom: 8,
    lineHeight: 18,
  },
  podcastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  podcastEpisodes: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  podcastMetaSeparator: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  podcastCategory: {
    fontSize: 12,
    color: '#B3B3B3',
  },
  followButton: {
    padding: 8,
    alignSelf: 'flex-start',
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
    paddingHorizontal: 32,
  },
  exploreButton: {
    marginTop: 24,
    backgroundColor: '#F22976',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  exploreButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  // Estilos móviles
  podcastCardMobile: {
    width: '100%',
  },
  podcastImageMobile: {
    width: 100,
    height: 100,
  },
  podcastTitleMobile: {
    fontSize: 16,
  },
  podcastPublisherMobile: {
    fontSize: 12,
  },
  podcastDescriptionMobile: {
    fontSize: 12,
  },
});



