import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import { Icon } from '../icon';
import { DialogActions, ErrorText, FieldLabel, PrimaryButton, SecondaryButton, TextField } from './form-parts';
import { ModalShell } from '../modal-shell';

export function ConnectionDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { mode, account, serverUrl, checkServer, login, logout } = useQuestlog();
  // The parent gives this component a fresh `key` each time it is opened, so
  // this only needs to be initialized once per mount (no reset effect needed).
  const [step, setStep] = useState<'server' | 'login'>('server');
  const [serverInput, setServerInput] = useState(serverUrl);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setError('');
    onClose();
  };

  const continueToLogin = async () => {
    if (!serverInput.trim()) {
      setError('Enter the address of your Questlog server.');
      return;
    }
    setBusy(true);
    try {
      const cfg = await checkServer(serverInput.trim());
      if (!cfg.configured) {
        setError('This server has no Nextcloud connection configured yet.');
      } else {
        setStep('login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not reach this server.');
    } finally {
      setBusy(false);
    }
  };

  const submitLogin = async () => {
    if (!username.trim() || !password) {
      setError('Enter your Nextcloud username and app password.');
      return;
    }
    setBusy(true);
    const result = await login(serverInput.trim(), username.trim(), password);
    setBusy(false);
    if (result.ok) close();
    else setError(result.error || 'Could not sign in.');
  };

  if (mode === 'live' && account) {
    return (
      <ModalShell visible={visible} title="Your connected world" onClose={close}>
        <View style={styles.card}>
          <View style={styles.cardHeading}>
            <Icon name="cloud" size={16} color={colors.ink} />
            <Text style={styles.cardTitle}>Connected to Nextcloud</Text>
          </View>
          <Text style={styles.cardBody}>
            Signed in as {account.username}. Changes refresh every 20 seconds and when you return to the app. Each
            person signs in with their own account.
          </Text>
        </View>
        <Text style={styles.intro}>
          Questlog uses your Nextcloud permissions for shared journals. Your app password stays on your Questlog
          server for this session.
        </Text>
        <DialogActions>
          <SecondaryButton title="Sign out" onPress={() => { logout(); close(); }} />
          <PrimaryButton title="Back to the adventure" onPress={close} />
        </DialogActions>
      </ModalShell>
    );
  }

  return (
    <ModalShell visible={visible} title="Connect your world" onClose={close}>
      {step === 'server' ? (
        <>
          <Text style={styles.intro}>
            Enter the address of your self-hosted Questlog server, such as https://questlog.example.com. Sample
            quests stay in the demo until you connect.
          </Text>
          <FieldLabel>Questlog server address</FieldLabel>
          <TextField
            value={serverInput}
            onChangeText={setServerInput}
            placeholder="https://questlog.example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <ErrorText>{error}</ErrorText>
          <DialogActions>
            <SecondaryButton title="Cancel" onPress={close} />
            <PrimaryButton title="Continue" onPress={continueToLogin} loading={busy} />
          </DialogActions>
        </>
      ) : (
        <>
          <Text style={styles.intro}>
            Sign in with your Nextcloud username and an app password from Settings → Security.
          </Text>
          <FieldLabel>Nextcloud username</FieldLabel>
          <TextField value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />
          <FieldLabel>Nextcloud app password</FieldLabel>
          <TextField value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" />
          <ErrorText>{error}</ErrorText>
          <DialogActions>
            <SecondaryButton title="Back" onPress={() => setStep('server')} />
            <PrimaryButton title="Connect Nextcloud" onPress={submitLogin} loading={busy} />
          </DialogActions>
        </>
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.connectionCardBorder,
    borderRadius: 7,
    backgroundColor: colors.connectionCardBg,
    marginBottom: 14,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 16, color: colors.ink },
  cardBody: { fontSize: 15, color: colors.connectionCardText, lineHeight: 22 },
});
