import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  View,
} from "react-native";
import { useAuth } from "../auth/AuthContext";
import { API_BASE_URL } from "../config";
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
        !error?.response && API_BASE_URL.startsWith("http://")
          ? `${message}\n\nCurrent API URL: ${API_BASE_URL}\nIf this is a physical device, make sure the backend is reachable on the same network.`
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
          <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Text className="text-lg font-bold text-primary-foreground">CO</Text>
          </View>
          <View>
            <Text className="text-base font-bold text-foreground">CleanOps Staff</Text>
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
                placeholder="staff@cleanops.com"
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
              onPress={() => void handleLogin()}
            >
              Sign In
            </Button>

            {lastError ? (
              <Text className="text-sm text-destructive">{lastError}</Text>
            ) : null}

            <View className="rounded-lg bg-secondary p-3 gap-1">
              <Text className="text-xs font-medium text-muted-foreground">
                Connected endpoint
              </Text>
              <Text className="text-xs text-muted-foreground">{API_BASE_URL}</Text>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
