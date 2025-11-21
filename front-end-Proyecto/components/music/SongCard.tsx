import React from "react";
import { View, Text, Image, StyleSheet, ImageStyle, TextStyle, ViewStyle } from "react-native";

type Props = {
  coverUrl?: string;
  title?: string;
  artist?: string;
  coverStyle?: ImageStyle;
  titleStyle?: TextStyle;
  artistStyle?: TextStyle;
  containerStyle?: ViewStyle;
};

export default function SongCard({
  coverUrl, title, artist, coverStyle, titleStyle, artistStyle, containerStyle,
}: Props) {
  return (
    <View style={[styles.container, containerStyle]}>
      <Image source={{ uri: coverUrl }} style={[styles.cover, coverStyle]} />
      <View style={styles.meta}>
        <Text numberOfLines={2} style={[styles.title, titleStyle]}>{title ?? ""}</Text>
        <Text numberOfLines={1} style={[styles.artist, artistStyle]}>{artist ?? ""}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  cover: { width: "100%", aspectRatio: 1, borderRadius: 8, marginBottom: 32, backgroundColor: "#282828" },
  meta: { marginBottom: 24 },
  title: { color: "#fff", fontSize: 28, fontWeight: "700", marginBottom: 8, letterSpacing: -0.5 },
  artist: { color: "#b3b3b3", fontSize: 16, fontWeight: "500" },
});

