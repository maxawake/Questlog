import { StyleSheet } from 'react-native';

import { pixelFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    grid: { gap: 24 },
    column: { gap: 16 },
    columnHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
    columnHeadingText: { fontFamily: pixelFont, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.columnHeading },
    columnLine: { flex: 1, height: 1, backgroundColor: colors.columnLine, marginLeft: 6 },
    newCard: {
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.newCardBorder,
      borderRadius: 7,
      minHeight: 49,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    newCardText: { fontSize: 14, color: colors.newCardText },
    empty: {
      padding: 32,
      alignItems: 'center',
      borderWidth: 1,
      borderStyle: 'dashed',
      borderColor: colors.emptyBorder,
      borderRadius: 8,
      gap: 6,
    },
    emptyTitle: { fontFamily: pixelFont, fontSize: 14, lineHeight: 22, color: colors.emptyText, marginTop: 10, textAlign: 'center' },
    emptyBody: { fontSize: 15, lineHeight: 22, color: colors.emptyText, textAlign: 'center' },
    emptyButton: { backgroundColor: colors.primaryBg, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 5, marginTop: 10 },
    emptyButtonText: { color: colors.primaryText, fontSize: 15 },
  });
