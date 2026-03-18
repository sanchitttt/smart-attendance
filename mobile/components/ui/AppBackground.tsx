import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { UI } from "@/constants/ui";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function AppBackground({ children, style }: Props) {
  return (
    <View style={[styles.root, style]}>
      <LinearGradient
        colors={[
          UI.colors.slate50,
          UI.colors.white,
          "#eff6ff",
          "#eef2ff",
          UI.colors.slate50,
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Subtle grid overlay */}
      <View pointerEvents="none" style={styles.gridOverlay} />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: UI.colors.slate50,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.18,
    backgroundColor: "transparent",
    // Creates a faint “grid” feel using borders
    // (simple and fast; avoids image assets)
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderColor: "rgba(15,23,42,0.06)",
  },
});

