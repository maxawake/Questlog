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
      marginBottom: 14,
    },
    cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: 16, color: colors.ink },
    cardBody: { fontSize: 15, color: colors.connectionCardText, lineHeight: 22 },
  });
