import { StyleSheet } from 'react-native';

import { pixelFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    hero: {
      backgroundColor: colors.heroBg,
      borderWidth: 1,
      borderColor: colors.heroBorder,
      borderRadius: 9,
      padding: 20,
      gap: 16,
    },
    mark: { width: 47, height: 47, alignItems: 'center', justifyContent: 'center' },
    textCol: { gap: 6 },
    title: { fontFamily: pixelFont, fontSize: 13, lineHeight: 20, color: colors.heroTitle },
    body: { fontSize: 14, color: colors.heroBody, lineHeight: 21 },
    progressBlock: { gap: 8 },
    caption: { flexDirection: 'row', justifyContent: 'space-between', gap: 18 },
    captionLabel: { fontSize: 13, color: colors.progressCaption },
    captionValue: { fontSize: 13, color: colors.heroTitle, fontWeight: '600' },
    track: { height: 5, backgroundColor: colors.progressTrack, borderRadius: 20, overflow: 'hidden' },
    fill: { height: '100%', backgroundColor: colors.progressFill, borderRadius: 20 },
    small: { fontSize: 12, color: colors.heroBody, textAlign: 'right' },
  });
