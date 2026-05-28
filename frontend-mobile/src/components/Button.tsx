import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from "react-native";
import { colors, radius, shadow } from "../theme";

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const palette = stylesByVariant[variant];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        palette.button,
        style,
        pressed && !disabled && !loading ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={palette.spinnerColor} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.label, palette.label]}>{label}</Text>
          {variant === "primary" ? (
            <View style={styles.trailingOrb}>
              <Text style={styles.trailingGlyph}>↗</Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: radius.pill,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  buttonPressed: {
    transform: [{ scale: 0.975 }],
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  label: {
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  trailingOrb: {
    width: 30,
    height: 30,
    borderRadius: radius.pill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  trailingGlyph: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "900",
    lineHeight: 18,
  },
});

const stylesByVariant: Record<
  NonNullable<ButtonProps["variant"]>,
  {
    button: ViewStyle;
    label: TextStyle;
    spinnerColor: string;
  }
> = {
  primary: {
    button: {
      backgroundColor: colors.forest,
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.12)",
      ...shadow.panel,
    },
    label: {
      color: colors.white,
    },
    spinnerColor: colors.white,
  },
  secondary: {
    button: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.line,
    },
    label: {
      color: colors.ink,
    },
    spinnerColor: colors.ink,
  },
  ghost: {
    button: {
      backgroundColor: "rgba(255,255,255,0.08)",
      borderWidth: 1,
      borderColor: "rgba(255,255,255,0.20)",
    },
    label: {
      color: colors.white,
    },
    spinnerColor: colors.white,
  },
};
