import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/use-theme-color';
import { usePreferences } from '@/contexts/PreferencesContext';
import { useQueue, useRemoveFromQueue, useReorderQueue, useClearQueue } from '@/hooks/useQueue';
import { QueueItem } from '@/models/queue';
import { Image } from 'expo-image';
import { Song } from '@/models/song';
import { usePlayer } from '@/contexts/PlayerContext';

interface QueueModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function QueueModal({ visible, onClose }: QueueModalProps) {
  const { queue, isLoading } = useQueue();
  const removeFromQueue = useRemoveFromQueue();
  const clearQueue = useClearQueue();
  const { playSong } = usePlayer();
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const { currentTheme } = usePreferences();
  const isDark = currentTheme === 'dark';
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({ light: '#CC7AF240', dark: '#333333' }, 'background');
  const iconColor = useThemeColor({}, 'icon');

  const dynamicStyles = useMemo(() => StyleSheet.create({
    modalOverlay: {
      backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(0, 0, 0, 0.7)',
    },
    modalContent: {
      backgroundColor,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      borderWidth: 1,
      borderColor: isDark ? '#333333' : '#CC7AF280',
    },
    header: {
      borderBottomColor: borderColor,
    },
    title: {
      color: textColor,
    },
    clearButton: {
      color: textColor,
    },
    itemContainer: {
      borderBottomColor: borderColor,
      backgroundColor: isDark ? 'transparent' : '#FFFFFF',
    },
    itemActive: {
      backgroundColor: isDark ? '#1DB95420' : '#F2297620',
    },
    itemTitle: {
      color: textColor,
    },
    itemArtist: {
      color: isDark ? '#B3B3B3' : '#666666',
    },
    emptyText: {
      color: isDark ? '#B3B3B3' : '#666666',
    },
  }), [isDark, backgroundColor, textColor, borderColor]);

  const handleRemoveItem = async (itemId: string) => {
    console.log('🗑️ [QueueModal] handleRemoveItem llamado con itemId:', itemId);
    
    // En web, ejecutar directamente sin confirmación
    if (Platform.OS === 'web') {
      try {
        console.log('🗑️ [QueueModal] (Web) Intentando eliminar itemId:', itemId);
        console.log('🗑️ [QueueModal] (Web) removeFromQueue.mutateAsync disponible:', !!removeFromQueue.mutateAsync);
        const result = await removeFromQueue.mutateAsync({ itemIds: [itemId] });
        console.log('✅ [QueueModal] Item eliminado exitosamente, resultado:', result);
      } catch (error: any) {
        console.error('❌ [QueueModal] Error eliminando de la cola:', error);
        console.error('❌ [QueueModal] Error details:', {
          message: error?.message,
          status: error?.status,
          data: error?.data,
        });
        // En web, mostrar error en alert nativo
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(error?.message || 'No se pudo eliminar la canción de la cola');
        }
      }
      return;
    }
    
    // En móvil, usar Alert.alert
    Alert.alert(
      'Eliminar de la cola',
      '¿Quieres eliminar esta canción de la cola?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [QueueModal] Intentando eliminar itemId:', itemId);
              await removeFromQueue.mutateAsync({ itemIds: [itemId] });
              console.log('✅ [QueueModal] Item eliminado exitosamente');
            } catch (error: any) {
              console.error('❌ [QueueModal] Error eliminando de la cola:', error);
              Alert.alert(
                'Error',
                error?.message || 'No se pudo eliminar la canción de la cola'
              );
            }
          },
        },
      ]
    );
  };

  const handleClearQueue = async () => {
    console.log('🗑️ [QueueModal] handleClearQueue llamado, queue length:', queue.length);
    
    if (queue.length === 0) {
      console.log('⚠️ [QueueModal] Cola ya está vacía, no hacer nada');
      return;
    }

    // En web, ejecutar directamente sin confirmación (o con confirm nativo)
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm) {
        const confirmed = window.confirm('¿Quieres eliminar todas las canciones de la cola?');
        if (!confirmed) {
          console.log('❌ [QueueModal] Usuario canceló la limpieza');
          return;
        }
      }
      
      try {
        console.log('🗑️ [QueueModal] (Web) Intentando limpiar cola');
        console.log('🗑️ [QueueModal] (Web) clearQueue.mutateAsync disponible:', !!clearQueue.mutateAsync);
        const result = await clearQueue.mutateAsync();
        console.log('✅ [QueueModal] Cola limpiada exitosamente, resultado:', result);
      } catch (error: any) {
        console.error('❌ [QueueModal] Error limpiando cola:', error);
        console.error('❌ [QueueModal] Error details:', {
          message: error?.message,
          status: error?.status,
          data: error?.data,
        });
        if (typeof window !== 'undefined' && window.alert) {
          window.alert(error?.message || 'No se pudo limpiar la cola');
        }
      }
      return;
    }

    // En móvil, usar Alert.alert
    Alert.alert(
      'Limpiar cola',
      '¿Quieres eliminar todas las canciones de la cola?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpiar',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🗑️ [QueueModal] Intentando limpiar cola');
              await clearQueue.mutateAsync();
              console.log('✅ [QueueModal] Cola limpiada exitosamente');
            } catch (error: any) {
              console.error('❌ [QueueModal] Error limpiando cola:', error);
              Alert.alert(
                'Error',
                error?.message || 'No se pudo limpiar la cola'
              );
            }
          },
        },
      ]
    );
  };

  const handlePlaySong = (song: Song) => {
    playSong(song);
    onClose();
  };

  const sortedQueue = useMemo(() => {
    // Ordenar por posición
    return [...queue].sort((a, b) => a.position - b.position);
  }, [queue]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={[styles.modalOverlay, dynamicStyles.modalOverlay]}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContent, dynamicStyles.modalContent]}>
          <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
            {/* Header */}
            <View style={[styles.header, dynamicStyles.header]}>
              <Text style={[styles.title, dynamicStyles.title]}>Cola de reproducción</Text>
              <View style={styles.headerActions}>
                {queue.length > 0 && (
                  <TouchableOpacity
                    onPress={async () => {
                      console.log('🗑️ [QueueModal] Botón Limpiar presionado');
                      await handleClearQueue();
                    }}
                    style={styles.clearButton}
                    disabled={clearQueue.isPending}
                  >
                    <Text style={[styles.clearButtonText, dynamicStyles.clearButton]}>
                      {clearQueue.isPending ? 'Limpiando...' : 'Limpiar'}
                    </Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <Ionicons name="close" size={24} color={textColor} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Content */}
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#F22976" />
              </View>
            ) : sortedQueue.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="musical-notes-outline" size={64} color={iconColor} />
                <Text style={[styles.emptyText, dynamicStyles.emptyText]}>
                  Tu cola está vacía
                </Text>
                <Text style={[styles.emptySubtext, dynamicStyles.emptyText]}>
                  Agrega canciones para reproducirlas después
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {sortedQueue.map((item, index) => (
                  <QueueItemRow
                    key={item.id}
                    item={item}
                    index={index}
                    onRemove={handleRemoveItem}
                    onPlay={handlePlaySong}
                    dynamicStyles={dynamicStyles}
                    textColor={textColor}
                    iconColor={iconColor}
                  />
                ))}
              </ScrollView>
            )}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

interface QueueItemRowProps {
  item: QueueItem;
  index: number;
  onRemove: (itemId: string) => void;
  onPlay: (song: Song) => void;
  dynamicStyles: any;
  textColor: string;
  iconColor: string;
}

function QueueItemRow({
  item,
  index,
  onRemove,
  onPlay,
  dynamicStyles,
  textColor,
  iconColor,
}: QueueItemRowProps) {
  const handleLongPress = () => {
    console.log('📱 [QueueItemRow] Long press en item:', item.id);
    onRemove(item.id);
  };

  const handleRemovePress = (e: any) => {
    console.log('🗑️ [QueueItemRow] Botón X presionado para item:', item.id);
    e.stopPropagation(); // Evitar que se propague al onPress del item
    onRemove(item.id);
  };

  const handleItemPress = () => {
    console.log('▶️ [QueueItemRow] Item presionado para reproducir:', item.song.title);
    onPlay(item.song);
  };

  return (
    <TouchableOpacity
      style={[styles.itemContainer, dynamicStyles.itemContainer]}
      onPress={handleItemPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.itemLeft}>
        <View style={styles.itemNumber}>
          <Text style={[styles.itemNumberText, { color: iconColor }]}>
            {index + 1}
          </Text>
        </View>
        <Image
          source={{ uri: item.song.coverUrl || '' }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <Text
            style={[styles.itemTitle, dynamicStyles.itemTitle]}
            numberOfLines={1}
          >
            {item.song.title}
          </Text>
          <Text
            style={[styles.itemArtist, dynamicStyles.itemArtist]}
            numberOfLines={1}
          >
            {item.song.artist}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={handleRemovePress}
        style={styles.removeButton}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="close-circle-outline" size={24} color={iconColor} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemNumber: {
    width: 24,
    alignItems: 'center',
    marginRight: 12,
  },
  itemNumberText: {
    fontSize: 14,
    fontWeight: '600',
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    backgroundColor: '#333',
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemArtist: {
    fontSize: 14,
  },
  removeButton: {
    padding: 4,
    marginLeft: 8,
  },
});

