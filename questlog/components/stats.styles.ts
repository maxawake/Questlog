import { StyleSheet } from 'react-native';

import { pixelFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', gap: 8 },
    stat: {
      flex: 1,
      backgroundColor: colors.statBg,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 7,
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 9,
    },
    iconWrap: { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
    value: { fontFamily: pixelFont, fontSize: 18, color: colors.ink },
    label: { fontSize: 12, color: colors.statLabel, marginTop: 8 },
  });
