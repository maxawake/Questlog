import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import type { Filter } from '@/lib/types';
import { Icon } from './icon';

const TABS: { key: Filter; title: string }[] = [
  { key: 'all', title: 'All quests' },
  { key: 'main', title: 'Main quests' },
  { key: 'side', title: 'Side quests' },
  { key: 'completed', title: 'Completed' },
];

export function Toolbar({ allCount }: { allCount: number }) {
  const { filter, setFilter, search, setSearch } = useQuestlog();
  return (
    <View style={styles.wrap}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable key={tab.key} onPress={() => setFilter(tab.key)} style={styles.tab}>
            <Text style={[styles.tabText, filter === tab.key && styles.tabTextActive]}>{tab.title}</Text>
            {tab.key === 'all' && (
              <View style={styles.tabCount}>
                <Text style={styles.tabCountText}>{allCount}</Text>
              </View>
            )}
            {filter === tab.key && <View style={styles.tabIndicator} />}
          </Pressable>
        ))}
      </View>
      <View style={styles.search}>
        <Icon name="search" size={14} color={colors.search} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search your quests"
          placeholderTextColor={colors.search}
          style={styles.searchInput}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderBottomWidth: 1, borderColor: colors.line, paddingBottom: 4 },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  tab: { paddingBottom: 14, position: 'relative', flexDirection: 'row', alignItems: 'center', gap: 4 },
  tabText: { fontSize: 14, color: colors.tab },
  tabTextActive: { color: colors.tabActive, fontWeight: '600' },
  tabCount: { backgroundColor: colors.tabCountBg, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  tabCountText: { fontSize: 12, color: colors.tabCountText },
  tabIndicator: { position: 'absolute', bottom: -1, left: 0, right: 0, height: 2, backgroundColor: '#50674a' },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#e4e6da',
    paddingVertical: 12,
    marginTop: 4,
  },
  searchInput: { flex: 1, fontSize: 15, color: '#4b5c46', padding: 0 },
});
