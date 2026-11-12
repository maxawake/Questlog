import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    label: { fontSize: 15, color: colors.label, marginTop: 14, marginBottom: 7 },
    help: { fontSize: 13, color: colors.helpLine },
    input: {
      width: '100%',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 5,
      backgroundColor: colors.inputBg,
      fontSize: 16,
      color: colors.inputText,
    },
    textarea: { minHeight: 80 },
    error: { fontSize: 15, color: colors.formError, marginTop: 12, lineHeight: 21 },
    helpLine: { fontSize: 14, color: colors.helpLine, lineHeight: 20, marginTop: 8 },
    actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 22, flexWrap: 'wrap' },
    primary: {
      backgroundColor: colors.primaryBg,
      paddingVertical: 11,
      paddingHorizontal: 16,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    primaryText: { color: colors.primaryText, fontSize: 15 },
    secondary: {
      borderWidth: 1,
      borderColor: colors.secondaryBorder,
      paddingVertical: 10,
      paddingHorizontal: 14,
      borderRadius: 5,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 7,
      backgroundColor: colors.paper,
    },
    secondaryText: { color: colors.ink, fontSize: 15 },
    dangerButton: { marginRight: 'auto', paddingVertical: 7 },
    dangerText: { color: colors.danger, fontSize: 15 },
    disabled: { opacity: 0.5 },
    pressed: { opacity: 0.8 },
  });
