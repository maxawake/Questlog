import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import { Icon } from '../icon';
import { HelpLine, SecondaryButton } from './form-parts';
import { ModalShell } from '../modal-shell';

export function SettingsDialog({ visible, onClose, onConnect }: { visible: boolean; onClose: () => void; onConnect: () => void }) {
  const { mode, exportBackup } = useQuestlog();

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

const styles = StyleSheet.create({
  intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: colors.connectionCardBorder,
    borderRadius: 7,
    backgroundColor: colors.connectionCardBg,
    marginVertical: 14,
  },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  cardTitle: { fontSize: 15, color: colors.ink },
  cardBody: { fontSize: 14, color: colors.connectionCardText, lineHeight: 21 },
  buttonStack: { gap: 10 },
  wideButton: { justifyContent: 'center' },
});
