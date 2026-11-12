import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingBottom: 14,
      gap: 14,
      backgroundColor: colors.topbarBg,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
    },
    breadcrumb: { flex: 1 },
    breadcrumbText: { fontSize: 16, color: colors.breadcrumbActive, fontWeight: '600' },
    actions: { flexDirection: 'row', gap: 9 },
    roundButton: {
      width: 29,
      height: 29,
      borderRadius: 15,
      borderWidth: 1,
      borderColor: colors.roundButtonBorder,
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
