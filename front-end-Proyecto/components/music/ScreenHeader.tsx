import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = { title: string; onClose?: () => void; onMenu?: () => void };

export default function ScreenHeader({ title, onClose, onMenu }: Props) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="chevron-down" size={28} color="#fff" />
      </TouchableOpacity>
      <Text numberOfLines={1} style={styles.headerTitle}>{title}</Text>
      <TouchableOpacity onPress={onMenu} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
        <Ionicons name="ellipsis-horizontal" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 32, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 12 },
  headerTitle: { color: "#fff", fontSize: 14, fontWeight: "600", flex: 1, textAlign: "center", marginHorizontal: 16 },
});

