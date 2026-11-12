import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import { Icon } from './icon';

interface Props {
  onOpenMenu: () => void;
  onRefresh: () => void;
  onSettings: () => void;
}

export function Topbar({ onOpenMenu, onRefresh, onSettings }: Props) {
  const insets = useSafeAreaInsets();
  const { currentJournal, busy } = useQuestlog();
  const journal = currentJournal();

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 10 }]}>
      <Pressable onPress={onOpenMenu} hitSlop={8} accessibilityLabel="Open navigation">
        <Icon name="menu" size={20} color={colors.breadcrumbActive} />
      </Pressable>
      <View style={styles.breadcrumb}>
        <Text style={styles.breadcrumbText} numberOfLines={1}>
          {journal?.title || 'Start a journal'}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable style={styles.roundButton} onPress={onRefresh} disabled={busy} accessibilityLabel="Refresh journal">
          <Icon name="refresh" size={15} color={colors.breadcrumbActive} />
        </Pressable>
        <Pressable style={styles.roundButton} onPress={onSettings} accessibilityLabel="Journal settings">
          <Icon name="settings" size={15} color={colors.breadcrumbActive} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
