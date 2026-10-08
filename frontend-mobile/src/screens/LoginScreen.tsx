import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../config";
import { changeApiServerAddress } from '../api/client';
import { getServerAddress, loadServerAddress } from '../api/serverAddress';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Text } from "../components/ui/text";
import { Card, CardContent } from "../components/ui/card";

export function LoginScreen() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);
  const [serverAddress, setServerAddress] = useState(API_BASE_URL);
  const [serverDraft, setServerDraft] = useState(API_BASE_URL);
  const [editingServer, setEditingServer] = useState(false);
  const [savingServer, setSavingServer] = useState(false);

  useEffect(() => {
    void loadServerAddress().then(address => { setServerAddress(address); setServerDraft(address); });
  }, []);

  const saveServer = async () => {
    try {
      setSavingServer(true);
      const address = await changeApiServerAddress(serverDraft);
      setServerAddress(address);
      setServerDraft(address);
      setLastError(null);
      setEditingServer(false);
    } catch (error) {
      Alert.alert('Server address', error instanceof Error ? error.message : 'Could not save the server address.');
    } finally {
      setSavingServer(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing fields", "Email and password are both required.");
      return;
    }

    setLastError(null);

    try {
      setLoading(true);
      await login(email.trim(), password);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ??
        error?.message ??
        "Unable to sign in.";

      const detail =
        ["ERR_NETWORK", "ECONNABORTED", "ETIMEDOUT"].includes(error?.code) && getServerAddress().startsWith("http://")
          ? `${message}\n\nServer: ${getServerAddress()}\nCheck that your phone and server are on the same network, or change the server address below.`
          : message;

      setLastError(detail);
      Alert.alert("Login failed", detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      className="flex-1 bg-background"
    >
      <ScrollView
        contentContainerClassName="flex-grow justify-center p-6 gap-6"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View className="flex-row items-center gap-3">
          <Image source={require("../../assets/hygene-ops-mark.png")} style={{ width: 48, height: 48 }} accessible={false} />
          <View>
            <Text className="text-base font-bold text-foreground">Hygene Ops Staff</Text>
            <Text className="text-sm text-muted-foreground">Field operations</Text>
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-3xl font-extrabold tracking-tight text-foreground">
            Sign in to your shift
          </Text>
          <Text className="text-base text-muted-foreground">
            Attendance, QR starts, and proof uploads stay close to the work.
          </Text>
        </View>

        <Card>
          <CardContent className="gap-4 p-5">
            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Email</Text>
              <Input
                iconLeft="Mail"
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="staff@example.com"
                value={email}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-medium text-foreground">Password</Text>
              <Input
                iconLeft="Lock"
                autoCapitalize="none"
                onChangeText={setPassword}
                placeholder="Enter password"
                secureTextEntry
                value={password}
              />
            </View>

            <Button
              className="w-full"
              loading={loading}
              disabled={editingServer || savingServer}
              onPress={() => void handleLogin()}
            >
              Sign In
            </Button>

            {lastError ? (
              <Text className="text-sm text-destructive">{lastError}</Text>
            ) : null}

            <View className="rounded-lg bg-secondary p-3 gap-1">
              <Text className="text-xs font-medium text-muted-foreground">
                Server address
              </Text>
              <Text className="text-sm text-foreground" selectable>{serverAddress}</Text>
              {editingServer ? (
                <View className="gap-2 pt-2">
                  <Input
                    accessibilityLabel="Server address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    value={serverDraft}
                    onChangeText={setServerDraft}
                    placeholder="http://192.168.1.10:8080/api"
                  />
                  <Text className="text-xs text-muted-foreground">Use the server computer’s Wi-Fi address. Include :8080/api.</Text>
                  <Button onPress={() => void saveServer()} loading={savingServer} disabled={loading}>Save address</Button>
                  <Button variant="outline" onPress={() => { setServerDraft(serverAddress); setEditingServer(false); }} disabled={savingServer}>Cancel</Button>
                </View>
              ) : (
                <Button variant="outline" onPress={() => setEditingServer(true)} disabled={loading}>Change server address</Button>
              )}
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
