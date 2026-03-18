import React from "react";
import { View, StyleSheet, type ViewStyle, type StyleProp } from "react-native";
import { UI } from "@/constants/ui";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
};

export default function SurfaceCard({ children, style }: Props) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    borderRadius: UI.radius.card,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    padding: 18,
    ...UI.shadow.card,
  },
});

