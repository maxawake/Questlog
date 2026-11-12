import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    illustration: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 18 },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.shareAvatarBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: { fontFamily: 'serif', fontSize: 18, color: colors.ink },
    body: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText, marginBottom: 14 },
    card: {
      padding: 16,
      borderWidth: 1,
      borderColor: colors.connectionCardBorder,
      borderRadius: 7,
      backgroundColor: colors.connectionCardBg,
      marginBottom: 16,
    },
    cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    cardTitle: { fontSize: 15, color: colors.ink },
    cardBody: { fontSize: 14, color: colors.connectionCardText, lineHeight: 21 },
  });
