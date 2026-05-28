import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Button } from "../components/Button";
import { API_BASE_URL } from "../config";
import { useAuth } from "../auth/AuthContext";
import { cardCore, cardShell, colors, radius, shadow, typography } from "../theme";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password are both required.");
      return;
    }

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unable to sign in.";

      const detail =
        !error?.response && API_BASE_URL.startsWith("http://")
          ? `${message}\n\nCurrent API URL: ${API_BASE_URL}\nIf this is a physical device, make sure the backend is reachable on the same network.`
          : message;

      Alert.alert("Login failed", detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.screen}
    >
      <View style={styles.glowTop} />
      <View style={styles.glowBottom} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandMark}>
            <Text style={styles.brandMarkText}>CO</Text>
          </View>
          <View>
            <Text style={styles.brandName}>CleanOps</Text>
            <Text style={styles.brandSub}>Staff field app</Text>
          </View>
        </View>

        <View style={styles.hero}>
          <Text style={styles.kicker}>Mobile shift command</Text>
          <Text style={styles.title}>Sign in and run the shift from your phone.</Text>
          <Text style={styles.subtitle}>
            Attendance, QR starts, and proof uploads stay close to the work, not buried in a dashboard.
          </Text>
        </View>

        <View style={styles.cardShell}>
          <View style={styles.card}>
            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                accessibilityLabel="Email"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="staff@cleanops.com"
                placeholderTextColor={colors.inkSoft}
                style={styles.input}
                value={email}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                accessibilityLabel="Password"
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Enter password"
                placeholderTextColor={colors.inkSoft}
                secureTextEntry
                style={styles.input}
                value={password}
              />
            </View>

            <Button label="Sign In" onPress={handleLogin} loading={loading} />

            <View style={styles.apiPanel}>
              <Text style={styles.apiLabel}>Connected endpoint</Text>
              <Text style={styles.hint}>{API_BASE_URL}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: 24,
    minHeight: "100%",
    justifyContent: "center",
    gap: 26,
  },
  glowTop: {
    position: "absolute",
    top: -140,
    right: -120,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "#d8eee5",
  },
  glowBottom: {
    position: "absolute",
    bottom: -170,
    left: -130,
    width: 310,
    height: 310,
    borderRadius: 155,
    backgroundColor: "#eadcc3",
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  brandMark: {
    width: 52,
    height: 52,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.forest,
    ...shadow.panel,
  },
  brandMarkText: {
    color: colors.white,
    fontWeight: "900",
    fontSize: 15,
    letterSpacing: 0.4,
  },
  brandName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 2.6,
    textTransform: "uppercase",
  },
  brandSub: {
    color: colors.inkMuted,
    fontSize: 13,
    fontWeight: "700",
  },
  hero: {
    gap: 12,
  },
  kicker: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.mint,
    color: colors.teal,
    ...typography.eyebrow,
  },
  title: {
    ...typography.title,
    color: colors.ink,
  },
  subtitle: {
    ...typography.body,
    color: colors.inkMuted,
    maxWidth: 340,
  },
  cardShell: {
    ...cardShell,
    ...shadow.lifted,
  },
  card: {
    ...cardCore,
    padding: 20,
    gap: 17,
  },
  field: {
    gap: 8,
  },
  label: {
    ...typography.small,
    color: colors.ink,
  },
  input: {
    minHeight: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 16,
    fontSize: 16,
    color: colors.ink,
    fontWeight: "700",
  },
  apiPanel: {
    borderRadius: radius.md,
    backgroundColor: colors.surfaceSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  apiLabel: {
    ...typography.eyebrow,
    color: colors.inkSoft,
    fontSize: 10,
  },
  hint: {
    color: colors.inkMuted,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "700",
  },
});
