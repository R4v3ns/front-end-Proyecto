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
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity 
          onPress={onPrev} 
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.controlButton}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-back" size={40} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onTogglePlayPause} 
          style={styles.playBtn} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={36} 
            color="#000" 
            style={isPlaying ? {} : { marginLeft: 4 }} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onNext} 
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.controlButton}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={40} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.secondaryControls}>
        <TouchableOpacity 
          onPress={onShufflePress} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.secondaryButton}
        >
          <Ionicons name="shuffle" size={24} color="#b3b3b3" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onRepeatPress} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.secondaryButton}
        >
          <Ionicons name="repeat" size={24} color="#b3b3b3" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    zIndex: 10,
    alignItems: "center",
  },
  row: { 
    flexDirection: "row", 
    alignItems: "center", 
    justifyContent: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
    gap: 32,
    width: "100%",
  },
  controlButton: {
    padding: 8,
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  playBtn: {
    width: 76, 
    height: 76, 
    borderRadius: 38, 
    backgroundColor: "#F22976",
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#F22976",
    shadowOffset: { width: 0, height: 6 }, 
    shadowOpacity: 0.6, 
    shadowRadius: 14, 
    elevation: 12,
    marginHorizontal: 10,
  },
  secondaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 48,
    paddingTop: 8,
    paddingBottom: 4,
    width: "100%",
  },
  secondaryButton: {
    padding: 10,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
});

