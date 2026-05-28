import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { cardCore, cardShell, colors, shadow, typography } from "../theme";

type LoadingStateProps = {
  title?: string;
  message?: string;
  fullScreen?: boolean;
};

export function LoadingState({
  title = "Loading",
  message = "Please wait a moment while we prepare your workspace.",
  fullScreen = false,
}: LoadingStateProps) {
  return (
    <View style={[styles.shell, fullScreen ? styles.fullScreen : null]}>
      <View style={styles.panelShell}>
        <View style={styles.panel}>
          <View style={styles.mark}>
            <ActivityIndicator size="small" color={colors.white} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  panelShell: {
    ...cardShell,
    ...shadow.panel,
  },
  panel: {
    ...cardCore,
    paddingHorizontal: 22,
    paddingVertical: 26,
    alignItems: "center",
    gap: 12,
  },
  mark: {
    width: 54,
    height: 54,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
  },
  title: {
    ...typography.sectionTitle,
    color: colors.ink,
    textAlign: "center",
  },
  message: {
    ...typography.body,
    color: colors.inkMuted,
    textAlign: "center",
  },
});
