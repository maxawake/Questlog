import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
  });
