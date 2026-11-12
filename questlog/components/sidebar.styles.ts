import { StyleSheet } from 'react-native';

import { pixelFont, serifFont, type ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    backdrop: { flex: 1, flexDirection: 'row', backgroundColor: colors.overlay },
    drawer: { width: '82%', maxWidth: 300, backgroundColor: colors.sidebar },
    drawerContent: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
    brand: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 32 },
    brandName: { fontFamily: pixelFont, fontSize: 15, lineHeight: 20, color: colors.brand },
    brandTag: { fontSize: 11, letterSpacing: 2, color: colors.sidebarMuted, marginTop: 7 },
    navLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: colors.sidebarMuted, marginVertical: 12 },
    navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 13, borderRadius: 6, marginVertical: 2 },
    navItemActive: { backgroundColor: colors.sidebarItemActiveBg },
    navItemText: { fontSize: 15, color: colors.sidebarItem, flex: 1 },
    navItemTextActive: { color: colors.sidebarItemActiveText },
    // These stay literal: the nav drawer is always dark-styled, in both themes.
    navCount: { fontSize: 13, color: colors.navCount, backgroundColor: '#ffffff14', paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4 },
    newJournalText: { fontSize: 14, color: colors.sidebarMuted },
    journalDot: { width: 7, height: 7, borderWidth: 1, borderColor: '#c4a260', transform: [{ rotate: '45deg' }], marginHorizontal: 5 },
    journalDotPersonal: { borderColor: '#90a98e' },
    divider: { height: 1, backgroundColor: '#ffffff1a', marginTop: 18 },
    syncBox: { marginTop: 24, padding: 14, borderWidth: 1, borderColor: colors.syncBoxBorder, borderRadius: 7 },
    syncHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    syncHeadingText: { fontSize: 14, color: colors.syncHeading },
    statusDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.statusDot },
    statusDotLive: { backgroundColor: colors.statusDotLive },
    syncBody: { fontSize: 13, lineHeight: 19, color: colors.syncBody, marginVertical: 10 },
    syncLink: { fontSize: 13, color: colors.syncLink },
    profile: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 24 },
    avatar: { width: 31, height: 31, borderRadius: 16, backgroundColor: colors.avatarBg, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.sidebar },
    avatarText: { fontFamily: serifFont, fontSize: 16, color: colors.avatarText },
    profileName: { fontSize: 14, color: colors.profileName },
    profileSubtitle: { fontSize: 12, color: colors.profileSubtitle, marginTop: 4 },
  });
