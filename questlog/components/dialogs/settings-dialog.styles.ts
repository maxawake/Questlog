import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
    card: {
      padding: 16,
      borderWidth: 1,
      borderColor: colors.connectionCardBorder,
      borderRadius: 7,
      backgroundColor: colors.connectionCardBg,
      marginVertical: 14,
    },
    cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: 15, color: colors.ink },
    cardBody: { fontSize: 14, color: colors.connectionCardText, lineHeight: 21 },
    themeRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
    themeOption: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: 10,
      borderWidth: 1,
      borderColor: colors.pillBorder,
      borderRadius: 5,
      backgroundColor: colors.pillBg,
    },
    themeOptionActive: { borderColor: colors.pillBorderChecked, backgroundColor: colors.pillBgChecked },
    themeOptionText: { fontSize: 13, color: colors.pillText },
    buttonStack: { gap: 10 },
    wideButton: { justifyContent: 'center' },
  });
