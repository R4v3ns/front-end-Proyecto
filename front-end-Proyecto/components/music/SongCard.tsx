import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ImageStyle, TextStyle, ViewStyle, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getSongCoverUrl, getYouTubeThumbnailFallbacks } from "@/utils/youtubeImages";

type Props = {
  coverUrl?: string;
  title?: string;
  artist?: string;
  coverStyle?: ImageStyle;
  titleStyle?: TextStyle;
  artistStyle?: TextStyle;
  containerStyle?: ViewStyle;
  onLikePress?: () => void;
  onMenuPress?: () => void;
  isLiked?: boolean;
};

export default function SongCard({
  coverUrl, title, artist, coverStyle, titleStyle, artistStyle, containerStyle, onLikePress, onMenuPress,
}: Props) {
  const [isLiked, setIsLiked] = useState(false);
  const [currentImageUrl, setCurrentImageUrl] = useState(coverUrl || '');

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    onLikePress?.();
  };

  // Actualizar la URL de imagen cuando cambie coverUrl
  useEffect(() => {
    setCurrentImageUrl(coverUrl || '');
  }, [coverUrl]);

  // Extraer youtubeId de coverUrl si es una URL de YouTube
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const match = url.match(/\/vi\/([^\/]+)/);
    return match ? match[1] : null;
  };

  // Manejar error de carga de imagen - intentar con fallback
  const handleImageError = () => {
    if (!currentImageUrl || !currentImageUrl.includes('ytimg.com')) {
      return;
    }

    // Si es maxresdefault, intentar con hqdefault
    if (currentImageUrl.includes('maxresdefault')) {
      const youtubeId = extractYoutubeId(currentImageUrl);
      if (youtubeId) {
        const fallbackUrl = `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`;
        setCurrentImageUrl(fallbackUrl);
      }
    } else if (currentImageUrl.includes('hqdefault')) {
      // Si hqdefault falla, intentar con mqdefault
      const youtubeId = extractYoutubeId(currentImageUrl);
      if (youtubeId) {
        const fallbackUrl = `https://i.ytimg.com/vi/${youtubeId}/mqdefault.jpg`;
        setCurrentImageUrl(fallbackUrl);
      }
    }
  };

  const imageUrl = currentImageUrl;

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.coverContainer}>
        {imageUrl ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={[styles.cover, coverStyle]}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            placeholderContentFit="cover"
            onError={handleImageError}
          />
        ) : (
          <View style={[styles.cover, styles.coverPlaceholder]}>
            <Ionicons name="musical-notes" size={64} color="#4d4d4d" />
          </View>
        )}
      </View>
      <View style={styles.meta}>
        <View style={styles.titleRow}>
          <View style={styles.titleContainer}>
            {title ? (
              <Text numberOfLines={2} style={[styles.title, titleStyle]}>
                {title}
              </Text>
            ) : (
              <Text numberOfLines={2} style={[styles.title, titleStyle, { opacity: 0.5 }]}>
                Sin título
              </Text>
            )}
            {artist ? (
              <Text numberOfLines={1} style={[styles.artist, artistStyle]}>
                {artist}
              </Text>
            ) : (
              <Text numberOfLines={1} style={[styles.artist, artistStyle, { opacity: 0.5 }]}>
                Artista desconocido
              </Text>
            )}
          </View>
          <View style={styles.buttonsContainer}>
            {onMenuPress && (
              <TouchableOpacity 
                onPress={onMenuPress}
                style={styles.menuButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                activeOpacity={0.7}
              >
                <Ionicons 
                  name="ellipsis-horizontal" 
                  size={18} 
                  color="#fff" 
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity 
              onPress={handleLikePress}
              style={[styles.likeButton, isLiked && { backgroundColor: "#F22976", borderColor: "#F22976" }]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isLiked ? "heart" : "heart-outline"} 
                size={20} 
                color={isLiked ? "#fff" : "#fff"} 
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start",
    paddingBottom: 16,
    paddingHorizontal: 0,
  },
  coverContainer: {
    width: "100%",
    maxWidth: "90%", // Ocupa el 90% del ancho disponible
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
    alignSelf: "center",
  },
  cover: { 
    width: "100%", 
    maxWidth: "100%", // Ocupa todo el ancho del contenedor
    aspectRatio: 1, 
    borderRadius: 12, 
    backgroundColor: "#282828",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    alignSelf: "center",
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1a1a1a",
  },
  meta: { 
    width: "100%",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    marginTop: 0,
    marginBottom: 0,
    paddingTop: 16,
    paddingBottom: 8,
    zIndex: 1,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    position: "relative",
    paddingHorizontal: 0,
    minHeight: 65,
  },
  titleContainer: {
    flex: 1,
    alignItems: "flex-start",
    justifyContent: "flex-start",
    minHeight: 65,
    paddingRight: 110, // Espacio para ambos botones
    marginRight: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    position: "absolute",
    right: 0,
    top: 0,
    zIndex: 10,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  title: { 
    color: "#FFFFFF", 
    fontSize: 20, 
    fontWeight: "700", 
    marginBottom: 4, 
    letterSpacing: -0.1,
    textAlign: "left",
    lineHeight: 26,
    width: "100%",
  },
  artist: { 
    color: "#b3b3b3", 
    fontSize: 15, 
    fontWeight: "500",
    textAlign: "left",
    lineHeight: 20,
  },
  likeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderWidth: 1.5,
    borderColor: "#fff",
  },
  likeButtonOutline: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
});

