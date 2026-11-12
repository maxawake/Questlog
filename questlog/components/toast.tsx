import React, { useMemo } from 'react';
import { Text } from 'react-native';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import { createStyles } from './toast.styles';

export function Toast() {
  const { toastMessage } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!toastMessage) return null;
  return <Text style={styles.toast}>{toastMessage}</Text>;
}
