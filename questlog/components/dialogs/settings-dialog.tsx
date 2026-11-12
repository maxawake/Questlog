import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme, type ThemeMode } from '@/lib/theme-store';
import { Icon } from '../icon';
import { ModalShell } from '../modal-shell';
import { createStyles } from './settings-dialog.styles';
import { HelpLine, SecondaryButton } from './form-parts';

const THEME_OPTIONS: { key: ThemeMode; title: string }[] = [
  { key: 'light', title: 'Light' },
  { key: 'dark', title: 'Dark' },
  { key: 'system', title: 'System' },
];

export function SettingsDialog({ visible, onClose, onConnect }: { visible: boolean; onClose: () => void; onConnect: () => void }) {
  const { mode, exportBackup } = useQuestlog();
  const { colors, mode: themeMode, setMode: setThemeMode } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  return (
    <ModalShell visible={visible} title="Make yourself at home" onClose={onClose}>
      <Text style={styles.intro}>A quiet place for the things you want to do.</Text>
      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <Icon name="cloud" size={15} color={colors.ink} />
          <Text style={styles.cardTitle}>{mode === 'demo' ? 'Exploring the demo' : 'Nextcloud connected'}</Text>
        </View>
        <Text style={styles.cardBody}>
          {mode === 'demo'
            ? 'These sample journals are stored only on this device. To sync across devices and share lists, connect this app to your self-hosted Questlog server.'
            : 'Your Nextcloud server stores your quests. This app checks for updates every 20 seconds. Sessions last eight hours; signing out clears the session.'}
        </Text>
      </View>
      <Text style={styles.cardTitle}>Appearance</Text>
      <View style={styles.themeRow}>
        {THEME_OPTIONS.map((option) => (
          <Pressable
            key={option.key}
            onPress={() => setThemeMode(option.key)}
            style={[styles.themeOption, themeMode === option.key && styles.themeOptionActive]}>
            <Text style={styles.themeOptionText}>{option.title}</Text>
          </Pressable>
        ))}
      </View>
      <View style={styles.buttonStack}>
        <SecondaryButton title="Connection options" icon="cloud" onPress={onConnect} style={styles.wideButton} />
        <SecondaryButton title="Export a JSON backup" icon="download" onPress={exportBackup} style={styles.wideButton} />
      </View>
      <HelpLine>
        Main quests are the bigger picture. Side quests are worthwhile detours. Add as many nested subquests as your
        journey needs.
      </HelpLine>
    </ModalShell>
  );
}
