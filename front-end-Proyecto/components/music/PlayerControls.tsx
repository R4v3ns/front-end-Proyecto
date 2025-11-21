import React from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  isPlaying: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onTogglePlayPause?: () => void;
  onShufflePress?: () => void;
  onRepeatPress?: () => void;
};

export default function PlayerControls({
  isPlaying,
  onPrev,
  onNext,
  onTogglePlayPause,
  onShufflePress,
  onRepeatPress,
}: Props) {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={onShufflePress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="shuffle" size={24} color="#9aa0a6" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onPrev} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="play-skip-back" size={36} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onTogglePlayPause} style={styles.playBtn} activeOpacity={0.8}>
        <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#000" style={isPlaying ? {} : { marginLeft: 2 }} />
      </TouchableOpacity>

      <TouchableOpacity onPress={onNext} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="play-skip-forward" size={36} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onRepeatPress} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Ionicons name="repeat" size={24} color="#9aa0a6" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 8 },
  playBtn: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: "#fff",
    alignItems: "center", justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8,
  },
});

