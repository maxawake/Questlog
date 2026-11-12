import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme-store';
import { ModalShell } from '../modal-shell';
import { createStyles } from './confirm-dialog.styles';
import { DialogActions, ErrorText, PrimaryButton, SecondaryButton } from './form-parts';

interface Props {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  error?: string;
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = 'Cancel', error, busy, onConfirm, onCancel }: Props) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <ModalShell visible={visible} title={title} onClose={onCancel}>
      <View>
        <Text style={styles.message}>{message}</Text>
        <ErrorText>{error}</ErrorText>
        <DialogActions>
          <SecondaryButton title={cancelLabel} onPress={onCancel} />
          <PrimaryButton title={confirmLabel} onPress={onConfirm} loading={busy} />
        </DialogActions>
      </View>
    </ModalShell>
  );
}
