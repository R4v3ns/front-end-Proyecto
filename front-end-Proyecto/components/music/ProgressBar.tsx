import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, LayoutChangeEvent, GestureResponderEvent, Platform } from "react-native";
import { formatTime } from "@/utils/formatTime";

type Props = {
  position: number;
  duration: number;
  onSeek?: (sec: number) => void;
};

export default function ProgressBar({ position, duration, onSeek }: Props) {
  const [barWidth, setBarWidth] = useState(1);
  const [containerLayout, setContainerLayout] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const containerRef = useRef<View>(null);
  const safePosition = isFinite(position) && position >= 0 ? position : 0;
  const safeDuration = isFinite(duration) && duration > 0 ? duration : 0;
  const progress = safeDuration ? Math.max(0, Math.min(safePosition / safeDuration, 1)) : 0;

  const onBarLayout = (e: LayoutChangeEvent) => {
    const { width, x, y, height } = e.nativeEvent.layout;
    setBarWidth(width || 1);
    setContainerLayout({ x: x || 0, y: y || 0, width: width || 1, height: height || 0 });
  };

  const handleTap = (e: GestureResponderEvent) => {
    if (!onSeek || !safeDuration || safeDuration <= 0 || !containerRef.current) {
      console.log('⚠️ ProgressBar - No se puede hacer seek:', { duration: safeDuration, hasOnSeek: !!onSeek, hasRef: !!containerRef.current });
      return;
    }

    const nativeEvent = e.nativeEvent as any;
    
    // Usar measure para obtener la posición del contenedor y calcular la posición relativa del toque
    containerRef.current.measure((fx, fy, width, height, px, py) => {
      if (width <= 0) {
        console.warn('⚠️ ProgressBar - Ancho inválido:', width);
        return;
      }

      // Obtener la posición del toque
      let pageX: number | undefined;
      
      // Intentar diferentes formas de obtener la posición X según la plataforma
      if (Platform.OS === 'web') {
        // En web, usar pageX o clientX
        pageX = nativeEvent.pageX ?? nativeEvent.clientX;
      } else {
        // En móvil, usar locationX si está disponible, sino calcular desde pageX
        if (nativeEvent.locationX !== undefined && nativeEvent.locationX !== null) {
          // locationX es relativo al contenedor, así que podemos usarlo directamente
          const ratio = Math.max(0, Math.min(nativeEvent.locationX / width, 1));
          const seekTime = ratio * safeDuration;
          if (isFinite(seekTime) && seekTime >= 0 && seekTime <= safeDuration) {
            console.log(`🎯 ProgressBar (móvil) - Seek a ${seekTime.toFixed(2)}s`);
            onSeek(seekTime);
          }
          return;
        } else {
          pageX = nativeEvent.pageX;
        }
      }

      // Si tenemos pageX, calcular la posición relativa
      if (pageX !== undefined && isFinite(pageX)) {
        const relativeX = pageX - px;
        const ratio = Math.max(0, Math.min(relativeX / width, 1));
        const seekTime = ratio * safeDuration;
        
        if (isFinite(seekTime) && seekTime >= 0 && seekTime <= safeDuration) {
          console.log(`🎯 ProgressBar - Seek a ${seekTime.toFixed(2)}s (ratio: ${ratio.toFixed(2)}, x: ${relativeX}, width: ${width})`);
          onSeek(seekTime);
        } else {
          console.warn('⚠️ ProgressBar - Tiempo de seek inválido:', seekTime);
        }
      } else {
        console.warn('⚠️ ProgressBar - No se pudo obtener posición del toque:', { pageX, platform: Platform.OS, event: nativeEvent });
      }
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        ref={containerRef}
        activeOpacity={1}
        onLayout={onBarLayout}
        onPress={handleTap}
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
    marginBottom: 16, // Reducido de 24 a 16
    paddingVertical: 2, // Reducido de 4 a 2
    width: "100%",
  },
  progressBarContainer: { 
    width: "100%", 
    height: 44, // Aumentado para mejor área táctil
    justifyContent: "center", 
    marginBottom: 6, // Reducido de 8 a 6
    paddingVertical: 12, // Aumentado para mejor área táctil
    // Asegurar que toda el área sea clickeable
    alignItems: "center",
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

