import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import { Icon } from './icon';
import { createStyles } from './topbar.styles';

interface Props {
  onOpenMenu: () => void;
  onRefresh: () => void;
  onSettings: () => void;
}

export function Topbar({ onOpenMenu, onRefresh, onSettings }: Props) {
  const insets = useSafeAreaInsets();
  const { currentJournal, busy } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
