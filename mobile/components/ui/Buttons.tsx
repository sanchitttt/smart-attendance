import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { UI } from "@/constants/ui";

type ButtonProps = PressableProps & {
  title: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  icon?: React.ReactNode;           // ← Added support for icon
  disabled?: boolean;
};

export function PrimaryButton({
  title,
  style,
  textStyle,
  icon,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.primary,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.content}>
        {icon && <View style={styles.iconContainer}>{icon}</View>}
        <Text style={[styles.primaryText,textStyle]}>{title}</Text>
      </View>
    </Pressable>
  );
}

export function SecondaryButton({ title,style,disabled,...props }: ButtonProps) {
  return (
    <Pressable
      {...props}
      disabled={disabled}
      style={({ pressed }) => [
        styles.secondary,
        pressed && !disabled ? styles.pressedSecondary : null,
        disabled ? styles.disabled : null,
        style,
      ]}
    >
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  primary: {
    borderRadius: UI.radius.button,
    backgroundColor: UI.colors.indigo600,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    ...UI.shadow.button,
  },
  primaryText: {
    color: UI.colors.white,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  secondary: {
    borderRadius: UI.radius.button,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
    borderColor: "rgba(226,232,240,0.9)",
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: {
    color: UI.colors.slate900,
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: -0.1,
  },
  pressed: {
    transform: [{ scale: 0.99 }],
  },
  pressedSecondary: {
    transform: [{ scale: 0.99 }],
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  disabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    marginRight: 8,
  },
});

