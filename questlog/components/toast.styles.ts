import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    toast: {
      position: 'absolute',
      bottom: 26,
      alignSelf: 'center',
      backgroundColor: colors.toastBg,
      color: colors.toastText,
      borderWidth: 1,
      borderColor: colors.toastBorder,
      borderRadius: 7,
      paddingHorizontal: 19,
      paddingVertical: 13,
      fontSize: 15,
      maxWidth: '90%',
      overflow: 'hidden',
    },
  });
