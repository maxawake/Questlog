import React from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import { Icon } from '../icon';
import { PrimaryButton } from './form-parts';
import { ModalShell } from '../modal-shell';

export function ShareDialog({ visible, onClose, onConnect }: { visible: boolean; onClose: () => void; onConnect: () => void }) {
  const { mode, currentJournal, config } = useQuestlog();
  const title = currentJournal()?.title || 'Your journal';

  return (
    <ModalShell visible={visible} title="Better with a party" onClose={onClose}>
      <View style={styles.illustration}>
        <View style={styles.avatar}><Text style={styles.avatarText}>Y</Text></View>
        <Icon name="spark" size={16} color={colors.search} />
        <View style={styles.avatar}><Text style={styles.avatarText}>+</Text></View>
      </View>
      <Text style={styles.body}>
        {mode === 'demo'
          ? `"${title}" is a local demo journal. Its party members are illustrative; this preview does not share data with anyone.`
          : `Share "${title}" from Nextcloud Calendar with the people in your party. Grant edit access so they can add and complete quests, or read-only access to let them follow along.`}
      </Text>
      <View style={styles.card}>
        <View style={styles.cardHeading}>
          <Icon name="shield" size={15} color={colors.ink} />
          <Text style={styles.cardTitle}>One journal, individual accounts</Text>
        </View>
        <Text style={styles.cardBody}>
          {mode === 'demo'
            ? 'In the self-hosted app, everyone signs in with their own Nextcloud account and sees the journals shared with them.'
            : 'People with access sign in to this same Questlog app using their own Nextcloud username and app password. Shared journals appear automatically. All changes stay in Nextcloud.'}
        </Text>
      </View>
      {mode === 'live' && config.nextcloud_url ? (
        <PrimaryButton
          title="Manage sharing in Nextcloud"
          icon="users"
          onPress={() => Linking.openURL(`${config.nextcloud_url}/index.php/apps/calendar/`)}
        />
      ) : (
        <PrimaryButton title="Connect your world" onPress={onConnect} />
      )}
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  illustration: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 10, marginBottom: 18 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#d9dfc7',
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
