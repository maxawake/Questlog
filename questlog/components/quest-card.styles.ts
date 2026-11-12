import { StyleSheet } from 'react-native';

import { serifFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 8, overflow: 'hidden' },
    top: { padding: 20 },
    kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 11 },
    kindLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
    readOnly: { fontSize: 12, color: colors.readOnly, marginLeft: 4 },
    menuRow: { flexDirection: 'row', gap: 10, marginLeft: 'auto', alignItems: 'center' },
    titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
    checkMargin: { marginTop: 4 },
    titleWrap: { flex: 1 },
    title: { fontFamily: serifFont, fontSize: 24, lineHeight: 30, color: colors.questTitle },
    titleDoneDecoration: { textDecorationLine: 'line-through', textDecorationColor: colors.completedText },
    description: { fontSize: 14, color: colors.questDescription, lineHeight: 20, marginTop: 8, marginLeft: 31 },
    subquests: { paddingHorizontal: 21 },
    addSubquest: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 21, marginBottom: 10, paddingVertical: 6 },
    addSubquestText: { fontSize: 14, color: colors.addSubquest },
    progressWrap: { paddingHorizontal: 21, paddingBottom: 16 },
    progressTrack: { height: 3, backgroundColor: colors.cardProgressTrack, borderRadius: 20, overflow: 'hidden' },
    progressFill: { height: '100%', backgroundColor: colors.cardProgressFill, borderRadius: 20 },
    footer: {
      backgroundColor: colors.cardFooterBg,
      borderTopWidth: 1,
      borderTopColor: colors.cardFooterBorder,
      paddingHorizontal: 21,
      paddingVertical: 11,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      flexWrap: 'wrap',
    },
    footerSide: { backgroundColor: colors.sideFooterBg },
    footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
    footerText: { fontSize: 13, color: colors.cardFooterText },
    overdueText: { color: colors.overdue },
    miniTag: { borderWidth: 1, borderColor: colors.miniTagBorder, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 3 },
    miniTagText: { fontSize: 12, color: colors.cardFooterText },
    dueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
  });
