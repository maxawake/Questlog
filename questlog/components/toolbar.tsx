import React, { useMemo } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import type { Filter } from '@/lib/types';
import { Icon } from './icon';
import { createStyles } from './toolbar.styles';

const TABS: { key: Filter; title: string }[] = [
  { key: 'all', title: 'All quests' },
  { key: 'main', title: 'Main quests' },
  { key: 'side', title: 'Side quests' },
  { key: 'completed', title: 'Completed' },
];

export function Toolbar({ allCount }: { allCount: number }) {
  const { filter, setFilter, search, setSearch } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
