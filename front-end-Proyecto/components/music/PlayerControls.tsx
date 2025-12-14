import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  isPlaying: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onTogglePlayPause?: () => void;
  onShufflePress?: () => void;
  onRepeatPress?: () => void;
  isShuffle?: boolean;
  repeatMode?: 'off' | 'all' | 'one';
};

export default function PlayerControls({
  isPlaying,
  onPrev,
  onNext,
  onTogglePlayPause,
  onShufflePress,
  onRepeatPress,
  isShuffle = false,
  repeatMode = 'off',
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
          <Ionicons name="play-skip-back" size={32} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onTogglePlayPause} 
          style={styles.playBtn} 
          activeOpacity={0.8}
        >
          <Ionicons 
            name={isPlaying ? "pause" : "play"} 
            size={30} 
            color="#000" 
            style={isPlaying ? {} : { marginLeft: 3 }} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onNext} 
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
          style={styles.controlButton}
          activeOpacity={0.6}
        >
          <Ionicons name="play-skip-forward" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.secondaryControls}>
        <TouchableOpacity 
          onPress={onShufflePress} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[
            styles.secondaryButton,
            isShuffle && styles.activeButton
          ]}
        >
          <Ionicons 
            name="shuffle" 
            size={20} 
            color={isShuffle ? "#F22976" : "#b3b3b3"} 
          />
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={onRepeatPress} 
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={[
            styles.secondaryButton,
            repeatMode !== 'off' && styles.activeButton
          ]}
        >
          <Ionicons 
            name="repeat" 
            size={20} 
            color={repeatMode !== 'off' ? "#F22976" : "#b3b3b3"} 
          />
          {repeatMode === 'one' && (
            <View style={styles.repeatOneIndicator}>
              <Text style={styles.repeatOneText}>1</Text>
            </View>
          )}
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
    paddingVertical: 12, // Reducido de 16 a 12
    gap: 24, // Reducido de 32 a 24
    width: "100%",
  },
  controlButton: {
    padding: 6, // Reducido de 8 a 6
    width: 40, // Reducido de 48 a 40
    height: 40, // Reducido de 48 a 40
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  playBtn: {
    width: 64, // Reducido de 76 a 64
    height: 64, // Reducido de 76 a 64
    borderRadius: 32, // Reducido de 38 a 32
    backgroundColor: "#F22976",
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: "#F22976",
    shadowOffset: { width: 0, height: 4 }, // Reducido de 6 a 4
    shadowOpacity: 0.5, // Reducido de 0.6 a 0.5
    shadowRadius: 10, // Reducido de 14 a 10
    elevation: 10, // Reducido de 12 a 10
    marginHorizontal: 8, // Reducido de 10 a 8
  },
  secondaryControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 40, // Reducido de 48 a 40
    paddingTop: 6, // Reducido de 8 a 6
    paddingBottom: 2, // Reducido de 4 a 2
    width: "100%",
  },
  secondaryButton: {
    padding: 8, // Reducido de 10 a 8
    width: 36, // Reducido de 40 a 36
    height: 36, // Reducido de 40 a 36
    justifyContent: "center",
    alignItems: "center",
    position: 'relative',
  },
  activeButton: {
    // El color ya se maneja en el icono, pero podemos agregar un efecto visual adicional
    opacity: 1,
  },
  repeatOneIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#F22976',
    borderRadius: 8,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#121212',
  },
  repeatOneText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: 'bold',
    lineHeight: 10,
  },
});

