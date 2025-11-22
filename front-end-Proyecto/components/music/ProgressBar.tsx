import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent } from "react-native";
import { formatTime } from "@/utils/formatTime";

type Props = {
  position: number;
  duration: number;
  onSeek?: (sec: number) => void;
};

export default function ProgressBar({ position, duration, onSeek }: Props) {
  const [barWidth, setBarWidth] = useState(1);
  const safePosition = isFinite(position) && position >= 0 ? position : 0;
  const safeDuration = isFinite(duration) && duration > 0 ? duration : 0;
  const progress = safeDuration ? Math.max(0, Math.min(safePosition / safeDuration, 1)) : 0;

  const onBarLayout = (e: LayoutChangeEvent) =>
    setBarWidth(e.nativeEvent.layout.width || 1);

  const handleTap = (x: number) => {
    if (!duration || !onSeek || !isFinite(duration) || duration <= 0) return;
    const ratio = Math.max(0, Math.min(x / barWidth, 1));
    const seekTime = ratio * duration;
    if (isFinite(seekTime) && seekTime >= 0) {
      onSeek(seekTime);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={1}
        onLayout={onBarLayout}
        onPress={(e) => handleTap(e.nativeEvent.locationX)}
        style={styles.progressBarContainer}
      >
        <View style={styles.progressBarBackground}>
          {progress > 0 && (
            <View style={[styles.progressBarFill, { width: `${progress * 100}%` }]} />
          )}
        </View>
      </TouchableOpacity>

      <View style={styles.timeRow}>
        <Text style={styles.timeTxt}>{formatTime(safePosition)}</Text>
        <Text style={styles.timeTxt}>
          {safeDuration > 0 ? `-${formatTime(safeDuration - safePosition)}` : "0:00"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    marginBottom: 24,
    paddingVertical: 4,
    width: "100%",
  },
  progressBarContainer: { 
    width: "100%", 
    height: 40, 
    justifyContent: "center", 
    marginBottom: 8,
    paddingVertical: 12,
  },
  progressBarBackground: { 
    width: "100%", 
    height: 4, 
    backgroundColor: "#4d4d4d", 
    borderRadius: 2, 
    overflow: "hidden" 
  },
  progressBarFill: { 
    height: "100%", 
    backgroundColor: "#F22976", 
    borderRadius: 2,
  },
  timeRow: { 
    flexDirection: "row", 
    justifyContent: "space-between",
    paddingHorizontal: 2,
    alignItems: "center",
  },
  timeTxt: { 
    color: "#b3b3b3", 
    fontSize: 12, 
    fontWeight: "500",
    letterSpacing: 0.3,
  },
});

