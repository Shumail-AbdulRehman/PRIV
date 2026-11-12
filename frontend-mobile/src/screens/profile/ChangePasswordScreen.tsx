import * as React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/AuthContext';
import { TopBar } from '../../design/TopBar';
import { colors, space } from '../../design/tokens';
import { LaunchRecovery } from '../../launch/LaunchRecovery';

/** Own password replacement reached from Profile. Signs the person out after a saved change, as Help did. */
export function ChangePasswordScreen() {
  const navigation = useNavigation<{ goBack: () => void }>();
  const { logout } = useAuth();
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TopBar title="Change password" onBack={() => navigation.goBack()} backLabel="Back" withSafeArea />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + space.gutter }]}
      >
        <LaunchRecovery
          onCancel={() => navigation.goBack()}
          onComplete={async () => { await logout().catch(() => {}); }}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.surface },
  content: { padding: space.gutter, flexGrow: 1 },
});
