import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
    pillRow: { flexDirection: 'row', gap: 10 },
    pill: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.pillBorder,
      borderRadius: 5,
      backgroundColor: colors.pillBg,
    },
    pillChecked: { borderColor: colors.pillBorderChecked, backgroundColor: colors.pillBgChecked },
    pillText: { color: colors.pillText, fontSize: 15 },
    pickerWrap: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 5, backgroundColor: colors.inputBg },
    picker: { color: colors.inputText },
    dateField: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderWidth: 1,
      borderColor: colors.inputBorder,
      borderRadius: 5,
      backgroundColor: colors.inputBg,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    dateText: { flex: 1, color: colors.inputText, fontSize: 16 },
  });
