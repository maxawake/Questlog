import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    row: { flexDirection: 'row', alignItems: 'flex-start', gap: 9, paddingVertical: 9, minHeight: 33 },
    connector: { position: 'absolute', top: 0, height: 22, width: 8, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: colors.line, borderBottomLeftRadius: 3 },
    checkMargin: { marginTop: 2 },
    titleWrap: { flex: 1 },
    title: { fontSize: 15, lineHeight: 21, color: colors.subTitle },
    titleDoneDecoration: { textDecorationLine: 'line-through', textDecorationColor: colors.completedText },
    addButton: { padding: 2 },
  });
