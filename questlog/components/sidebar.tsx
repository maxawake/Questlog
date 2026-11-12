import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, pixelFont, serifFont } from '@/constants/theme';
import { useQuestlog } from '@/lib/questlog-store';
import type { Filter } from '@/lib/types';
import { Icon, IconName } from './icon';

const SECTIONS: { key: Filter; title: string; icon: IconName }[] = [
  { key: 'all', title: 'Your questlog', icon: 'book' },
  { key: 'main', title: 'Main quests', icon: 'sword' },
  { key: 'side', title: 'Side quests', icon: 'spark' },
  { key: 'completed', title: 'Completed', icon: 'circleCheck' },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  counts: Record<Filter, number>;
  onNewJournal: () => void;
  onConnect: () => void;
  onSettings: () => void;
}

export function Sidebar({ visible, onClose, counts, onNewJournal, onConnect, onSettings }: Props) {
  const { data, journalId, filter, setFilter, setJournalId, mode, account, offline, connectionError } = useQuestlog();
  const connected = mode === 'live' && !offline && !connectionError;
  const status = mode === 'demo' ? 'Local demo' : offline ? 'Offline · view only' : connectionError ? 'Connection paused' : 'Connected to Nextcloud';
  const userName = account?.username || 'Adventurer';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close navigation" />
        <ScrollView style={styles.drawer} contentContainerStyle={styles.drawerContent}>
          <View style={styles.brand}>
            <Icon name="compass" size={24} color={colors.brand} />
            <View>
              <Text style={styles.brandName}>Questlog</Text>
              <Text style={styles.brandTag}>THE EVERYDAY ADVENTURE</Text>
            </View>
          </View>

          <Text style={styles.navLabel}>YOUR JOURNEY</Text>
          {SECTIONS.map((section) => (
            <Pressable
              key={section.key}
              onPress={() => {
                setFilter(section.key);
                onClose();
              }}
              style={[styles.navItem, filter === section.key && styles.navItemActive]}>
              <Icon name={section.icon} size={15} color={filter === section.key ? colors.sidebarItemActiveText : colors.sidebarItem} />
              <Text style={[styles.navItemText, filter === section.key && styles.navItemTextActive]}>{section.title}</Text>
              <Text style={styles.navCount}>{counts[section.key]}</Text>
            </Pressable>
          ))}

          <View style={styles.divider} />
          <Text style={styles.navLabel}>YOUR JOURNALS</Text>
          {data.lists.map((journal) => (
            <Pressable
              key={journal.id}
              onPress={() => {
                setJournalId(journal.id);
                onClose();
              }}
              style={[styles.navItem, journal.id === journalId && styles.navItemActive]}>
              <View style={[styles.journalDot, !journal.shared && styles.journalDotPersonal]} />
              <Text style={[styles.navItemText, journal.id === journalId && styles.navItemTextActive]}>{journal.title}</Text>
              {journal.readonly && <Icon name="shield" size={13} color={colors.sidebarItem} />}
            </Pressable>
          ))}
          <Pressable
            onPress={() => {
              onNewJournal();
              onClose();
            }}
            style={styles.navItem}>
            <Icon name="plus" size={14} color={colors.sidebarMuted} />
            <Text style={styles.newJournalText}>New journal</Text>
          </Pressable>

          <View style={styles.syncBox}>
            <View style={styles.syncHeading}>
              <View style={[styles.statusDot, connected && styles.statusDotLive]} />
              <Text style={styles.syncHeadingText}>{status}</Text>
            </View>
            <Text style={styles.syncBody}>
              {mode === 'demo' ? 'Sample quests, saved on this device.\nYour next adventure starts here.' : 'Your journals, together.\nChanges sync across your devices.'}
            </Text>
            <Pressable
              onPress={() => {
                onConnect();
                onClose();
              }}>
              <Text style={styles.syncLink}>{mode === 'demo' ? 'Connect your world ›' : 'Connection settings ›'}</Text>
            </Pressable>
          </View>

          <View style={styles.profile}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{userName.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{userName}</Text>
              <Text style={styles.profileSubtitle}>{mode === 'demo' ? 'One quest at a time' : 'Your Nextcloud account'}</Text>
            </View>
            <Pressable
              onPress={() => {
                onSettings();
                onClose();
              }}
              hitSlop={8}>
              <Icon name="settings" size={17} color={colors.sidebarItem} />
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
