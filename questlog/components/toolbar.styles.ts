import { StyleSheet } from 'react-native';

import type { ThemeColors } from '@/constants/theme';

export const createStyles = (colors: ThemeColors) =>
  StyleSheet.create({
    wrap: { borderBottomWidth: 1, borderColor: colors.line, paddingBottom: 4 },
    tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
    tab: { paddingBottom: 14, position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 4 },
    tabText: { fontSize: 14, color: colors.tab },
    tabTextActive: { color: colors.tabActive, fontWeight: '600' },
    tabCount: { backgroundColor: colors.tabCountBg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
    tabCountText: { fontSize: 12, color: colors.tabCountText },
    tabIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: colors.tabIndicator },
    search: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      borderTopWidth: 1,
      borderTopColor: colors.searchBorderTop,
      paddingVertical: 12,
      marginTop: 4,
    },
    searchInput: { flex: 1, fontSize: 15, color: colors.searchInputText, padding: 0 },
  });
