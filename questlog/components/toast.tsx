import React from 'react';
import { StyleSheet, Text } from 'react-native';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';

export function Toast() {
  const { toastMessage } = useQuestlog();
  if (!toastMessage) return null;
  return <Text style={styles.toast}>{toastMessage}</Text>;
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: 26,
    alignSelf: 'center',
    backgroundColor: colors.toastBg,
    color: colors.toastText,
    borderWidth: 1,
    borderColor: colors.toastBorder,
    borderRadius: 7,
    paddingHorizontal: 19,
    paddingVertical: 13,
    fontSize: 15,
    maxWidth: '90%',
    overflow: 'hidden',
  },
});
