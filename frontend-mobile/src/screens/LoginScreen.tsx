import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../config";
import { changeApiServerAddress } from "../api/client";
import { getServerAddress, loadServerAddress } from "../api/serverAddress";
import { ActionButton } from "../design/ActionButton";
import { Field } from "../design/Field";
import { LanguageToggle } from "../design/LanguageToggle";
import { StaffText } from "../design/StaffText";
import { colors, radius, space } from "../design/tokens";
import { useLanguage } from "../i18n/LanguageProvider";
import { LaunchRecovery } from "../launch/LaunchRecovery";

const WRONG_PASSWORD = "Email or password is wrong. Check them and try again.";
const NETWORK_CODES = ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"];

export function LoginScreen() {
  const { login } = useAuth();
  const { t, isRTL } = useLanguage();
  const [handoff, setHandoff] = useState(false);
  const [recovered, setRecovered] = useState(false);
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  useEffect(() => {
    const show = Keyboard.addListener("keyboardDidShow", event => setKeyboardHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [serverAddress, setServerAddress] = useState(API_BASE_URL);
  const [serverDraft, setServerDraft] = useState(API_BASE_URL);
  const [serverError, setServerError] = useState<string | null>(null);
  const [editingServer, setEditingServer] = useState(false);
  const [showServerSettings, setShowServerSettings] = useState(false);
  const [savingServer, setSavingServer] = useState(false);

  useEffect(() => {
    void loadServerAddress().then((address) => {
      setServerAddress(address);
      setServerDraft(address);
    });
  }, []);

  const saveServer = async () => {
    try {
      setSavingServer(true);
      setServerError(null);
      const address = await changeApiServerAddress(serverDraft);
      setServerAddress(address);
      setServerDraft(address);
      setLastError(null);
      setEditingServer(false);
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Could not save the server address.",
      );
    } finally {
      setSavingServer(false);
    }
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !password.trim()) {
      setLastError("Email and password are both required.");
      return;
    }

    setLastError(null);
    setRecovered(false);

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error: any) {
      const serverMessage = error?.response?.data?.message;
      const status = error?.response?.status;
      let detail: string;
      if (serverMessage) {
        detail = serverMessage;
      } else if (NETWORK_CODES.includes(error?.code)) {
        detail = getServerAddress().startsWith("http://")
          ? `${error?.message ?? "Unable to sign in."}\n\nServer: ${getServerAddress()}\nCheck that your phone and server are on the same network, or change the server address below.`
          : error?.message ?? "Unable to sign in.";
      } else if (status === undefined || status === 400 || status === 401 || status === 403) {
        detail = WRONG_PASSWORD;
      } else {
        detail = error?.message ?? "Unable to sign in.";
      }
      setLastError(detail);
    } finally {
      setLoading(false);
    }
  };

  const rowDirection = isRTL ? "row-reverse" : "row";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.screen}
    >
      {/* Fixed status-bar band, so content scrolled for the keyboard never sits under the clock (spec 67). */}
      <View testID="status-band" style={{ height: insets.top }} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: space.gutter,
          paddingTop: 16,
          paddingBottom: insets.bottom + 20 + (Platform.OS === "android" ? keyboardHeight : 0),
          gap: 30,
        }}
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets={Platform.OS === "ios"}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.topRow, { flexDirection: rowDirection }]}>
          <View style={[styles.brand, { flexDirection: rowDirection }]}>
            <Image
              source={require("../../assets/hygene-ops-mark.png")}
              style={styles.mark}
              accessible={false}
            />
            <StaffText role="sectionTitle" translate={false}>Hygene</StaffText>
            <StaffText role="sectionTitle" color="blue" translate={false}>Ops</StaffText>
          </View>
          <View style={styles.toggle}><LanguageToggle appearance="onWhite" /></View>
        </View>

        <StaffText role="pageTitle" accessibilityRole="header">Staff sign in</StaffText>

        {recovered ? (
          <StaffText role="groupTitle" color="ok" accessibilityLiveRegion="polite">
            Password replaced. Sign in with your new password.
          </StaffText>
        ) : null}

        {handoff ? (
          <LaunchRecovery
            handoff
            onCancel={() => setHandoff(false)}
            onComplete={() => { setPassword(""); setHandoff(false); setRecovered(true); }}
          />
        ) : (
          <>
            <View style={styles.fields}>
              <Field
                label="Email"
                kind="email"
                placeholder="name@company.com"
                value={email}
                onChangeText={setEmail}
                returnKeyType="next"
              />
              <Field
                label="Password"
                kind="password"
                value={password}
                onChangeText={setPassword}
                error={lastError}
                returnKeyType="done"
                onSubmitEditing={() => void handleLogin()}
              />
            </View>

            <View style={styles.bottom}>
              <ActionButton kind="form" label="Sign in" busy={loading} onPress={() => void handleLogin()} />
              <ActionButton
                kind="ghost"
                label="Use manager access code"
                onPress={() => { setPassword(""); setLastError(null); setHandoff(true); }}
              />
              <StaffText role="meta" color="muted" align="center">
                Forgot your password? Ask your manager for a one-use access code.
              </StaffText>
              <ActionButton
                kind="ghost"
                label={showServerSettings ? "Hide connection settings" : "Show connection settings"}
                onPress={() => setShowServerSettings((value) => !value)}
              />
              {showServerSettings ? (
                <View style={styles.server}>
                  <StaffText role="label" color="muted">Server address</StaffText>
                  <StaffText role="body" translate={false} testID="server-address">{serverAddress}</StaffText>
                  {editingServer ? (
                    <View style={styles.serverEdit}>
                      <Field
                        label="Server address"
                        kind="url"
                        value={serverDraft}
                        onChangeText={setServerDraft}
                        error={serverError}
                        placeholder="http://192.168.1.10:8080/api"
                      />
                      <StaffText role="meta" color="muted">
                        Use the server computer’s Wi-Fi address. Include :8080/api.
                      </StaffText>
                      <ActionButton kind="form" label="Save address" busy={savingServer} onPress={() => void saveServer()} />
                      <ActionButton
                        kind="outline"
                        label="Cancel"
                        onPress={() => {
                          setServerDraft(serverAddress);
                          setServerError(null);
                          setEditingServer(false);
                        }}
                      />
                    </View>
                  ) : (
                    <ActionButton kind="outline" label="Change server address" onPress={() => setEditingServer(true)} />
                  )}
                </View>
              ) : null}
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  topRow: { alignItems: "center", justifyContent: "space-between", gap: 12 },
  brand: { alignItems: "center", gap: 6, flexShrink: 1 },
  toggle: { flexShrink: 0 },
  mark: { width: 36, height: 36 },
  fields: { gap: 16 },
  bottom: { gap: 12 },
  server: { backgroundColor: colors.canvas, borderRadius: radius.fieldRadius, padding: 14, gap: 10 },
  serverEdit: { gap: 12 },
});
