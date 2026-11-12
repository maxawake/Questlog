import React, { useMemo, useState } from 'react';
import { Text } from 'react-native';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import { ModalShell } from '../modal-shell';
import { createStyles } from './journal-dialog.styles';
import { DialogActions, ErrorText, FieldLabel, PrimaryButton, SecondaryButton, TextField } from './form-parts';

export function JournalDialog({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { createJournal } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const close = () => {
    setTitle('');
    setError('');
    onClose();
  };

  const submit = async () => {
    if (!title.trim()) return;
    setBusy(true);
    const result = await createJournal(title.trim());
    setBusy(false);
    if (result.ok) close();
    else setError(result.error || 'Could not create this journal.');
  };

  return (
    <ModalShell visible={visible} title="A new chapter" onClose={close}>
      <Text style={styles.intro}>
        A journal gathers quests for one part of your life. You can share a Nextcloud journal with your party later.
      </Text>
      <FieldLabel>Journal name</FieldLabel>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder="Our next great adventure"
        autoFocus
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      <ErrorText>{error}</ErrorText>
      <DialogActions>
        <SecondaryButton title="Cancel" onPress={close} />
        <PrimaryButton title="Create journal" onPress={submit} loading={busy} disabled={!title.trim()} />
      </DialogActions>
    </ModalShell>
  );
}
