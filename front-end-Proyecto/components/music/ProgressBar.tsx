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
  const progress = duration ? Math.max(0, Math.min(position / duration, 1)) : 0;

  const onBarLayout = (e: LayoutChangeEvent) =>
    setBarWidth(e.nativeEvent.layout.width || 1);

  const handleTap = (x: number) => {
    if (!duration || !onSeek) return;
    const ratio = Math.max(0, Math.min(x / barWidth, 1));
    onSeek(ratio * duration);
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
        <Text style={styles.timeTxt}>{formatTime(position)}</Text>
        <Text style={styles.timeTxt}>
          {duration > 0 ? `-${formatTime(duration - position)}` : "0:00"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  progressBarContainer: { width: "100%", height: 20, justifyContent: "center", marginBottom: 8 },
  progressBarBackground: { width: "100%", height: 4, backgroundColor: "#4d4d4d", borderRadius: 2, overflow: "hidden" },
  progressBarFill: { height: "100%", backgroundColor: "#fff", borderRadius: 2 },
  timeRow: { flexDirection: "row", justifyContent: "space-between" },
  timeTxt: { color: "#a7a7a7", fontSize: 12, fontWeight: "500" },
});

