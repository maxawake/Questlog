import React from 'react';
import { Text, View } from 'react-native';

import { ModalShell } from '../modal-shell';
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
  return (
    <ModalShell visible={visible} title={title} onClose={onCancel}>
      <View>
        <Text style={{ fontSize: 16, lineHeight: 23, color: '#7b8771' }}>{message}</Text>
        <ErrorText>{error}</ErrorText>
        <DialogActions>
          <SecondaryButton title={cancelLabel} onPress={onCancel} />
          <PrimaryButton title={confirmLabel} onPress={onConfirm} loading={busy} />
        </DialogActions>
      </View>
    </ModalShell>
  );
}
