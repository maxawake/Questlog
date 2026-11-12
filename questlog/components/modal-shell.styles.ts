import { StyleSheet } from 'react-native';

import { pixelFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: { flex: 1, backgroundColor: colors.dialogBackdrop, justifyContent: 'center', padding: 18 },
    cardWrap: { maxHeight: '90%' },
    card: {
      backgroundColor: colors.dialogBg,
      borderRadius: 13,
      borderWidth: 1,
      borderColor: colors.dialogBorder,
      maxHeight: '100%',
      overflow: 'hidden',
    },
    head: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 22,
      paddingTop: 22,
      paddingBottom: 6,
    },
    title: { fontSize: 15, lineHeight: 22, color: colors.dialogText, flexShrink: 1, fontFamily: pixelFont, paddingRight: 10 },
    body: { paddingHorizontal: 22 },
    bodyContent: { paddingBottom: 23, paddingTop: 11 },
  });
