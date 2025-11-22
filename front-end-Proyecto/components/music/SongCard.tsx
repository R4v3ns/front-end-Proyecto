import React, { useState } from "react";
import { View, Text, StyleSheet, ImageStyle, TextStyle, ViewStyle, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  coverUrl?: string;
  title?: string;
  artist?: string;
  coverStyle?: ImageStyle;
  titleStyle?: TextStyle;
  artistStyle?: TextStyle;
  containerStyle?: ViewStyle;
  onLikePress?: () => void;
  isLiked?: boolean;
};

export default function SongCard({
  coverUrl, title, artist, coverStyle, titleStyle, artistStyle, containerStyle, onLikePress,
}: Props) {
  const [isLiked, setIsLiked] = useState(false);

  const handleLikePress = () => {
    setIsLiked(!isLiked);
    onLikePress?.();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      <View style={styles.coverContainer}>
        {coverUrl ? (
          <Image 
            source={{ uri: coverUrl }} 
            style={[styles.cover, coverStyle]}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: "LKO2?U%2Tw=w]~RBVZRi};RPxuwH" }}
            placeholderContentFit="cover"
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
            <Text numberOfLines={2} style={[styles.title, titleStyle]}>
              {title || "Sin título"}
            </Text>
            <Text numberOfLines={1} style={[styles.artist, artistStyle]}>
              {artist || "Artista desconocido"}
            </Text>
          </View>
          <TouchableOpacity 
            onPress={handleLikePress}
            style={[styles.likeButton, !isLiked && styles.likeButtonOutline]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={28} 
              color={isLiked ? "#F22976" : "#fff"} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  coverContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    paddingHorizontal: 0,
  },
  cover: { 
    width: "100%", 
    maxWidth: "100%",
    aspectRatio: 1, 
    borderRadius: 0, 
    backgroundColor: "#282828",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
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
    alignItems: "center",
    marginTop: 8,
  },
  titleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    position: "relative",
  },
  titleContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 60,
  },
  title: { 
    color: "#fff", 
    fontSize: 24, 
    fontWeight: "700", 
    marginBottom: 8, 
    letterSpacing: -0.3,
    textAlign: "center",
    lineHeight: 30,
  },
  artist: { 
    color: "#b3b3b3", 
    fontSize: 16, 
    fontWeight: "500",
    textAlign: "center",
    lineHeight: 22,
  },
  likeButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    right: 0,
    top: "50%",
    marginTop: -22,
  },
  likeButtonOutline: {
    borderWidth: 2,
    borderColor: "#fff",
  },
});

