import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Board } from '@/components/board';
import { ConfirmDialog } from '@/components/dialogs/confirm-dialog';
import { ConnectionDialog } from '@/components/dialogs/connection-dialog';
import { JournalDialog } from '@/components/dialogs/journal-dialog';
import { QuestDialog } from '@/components/dialogs/quest-dialog';
import { SettingsDialog } from '@/components/dialogs/settings-dialog';
import { ShareDialog } from '@/components/dialogs/share-dialog';
import { Hero } from '@/components/hero';
import { Icon } from '@/components/icon';
import { Sidebar } from '@/components/sidebar';
import { Stats } from '@/components/stats';
import { Toast } from '@/components/toast';
import { Toolbar } from '@/components/toolbar';
import { Topbar } from '@/components/topbar';
import { colors, pixelFont, serifFont } from '@/constants/theme';
import { roots } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import type { QuestKind } from '@/lib/types';

type DialogKind = 'quest' | 'journal' | 'connection' | 'share' | 'settings' | 'delete' | null;

export default function QuestlogScreen() {
  const insets = useSafeAreaInsets();
  const {
    filter,
    currentJournal,
    questsHere,
    editable,
    mode,
    offline,
    connectionError,
    refresh,
    deleteQuest,
    toggleQuest,
  } = useQuestlog();

  const [sidebarVisible, setSidebarVisible] = useState(false);
  const [dialog, setDialog] = useState<DialogKind>(null);
  const [questTarget, setQuestTarget] = useState<{ questId: string | null; parentId: string | null; kind: QuestKind }>({
    questId: null,
    parentId: null,
    kind: 'main',
  });
  // Bumped each time the quest/connection dialog opens, so each one mounts
  // fresh (see the comments in quest-dialog.tsx/connection-dialog.tsx).
  const [questDialogNonce, setQuestDialogNonce] = useState(0);
  const [connectionDialogNonce, setConnectionDialogNonce] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string; etag: string } | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleteBusy, setDeleteBusy] = useState(false);

  const journal = currentJournal();
  const all = questsHere();
  const top = roots(all);
  const active = top.filter((q) => !q.completed);
  const cleared = all.filter((q) => q.completed);
  const finished = top.filter((q) => q.completed);
  const percentage = all.length ? Math.round((cleared.length / all.length) * 100) : 0;
  const counts = {
    all: active.length,
    main: active.filter((q) => q.kind === 'main').length,
    side: active.filter((q) => q.kind === 'side').length,
    completed: finished.length,
  };

  const closeDialog = () => setDialog(null);

  const openConnection = () => {
    setConnectionDialogNonce((n) => n + 1);
    setDialog('connection');
  };

  const openNewQuest = (kind: QuestKind) => {
    if (!journal) {
      setDialog('journal');
      return;
    }
    setQuestTarget({ questId: null, parentId: null, kind });
    setQuestDialogNonce((n) => n + 1);
    setDialog('quest');
  };
  const openEditQuest = (id: string) => {
    setQuestTarget({ questId: id, parentId: null, kind: 'main' });
    setQuestDialogNonce((n) => n + 1);
    setDialog('quest');
  };
  const openAddSub = (parentId: string, kind: QuestKind) => {
    setQuestTarget({ questId: null, parentId, kind });
    setQuestDialogNonce((n) => n + 1);
    setDialog('quest');
  };

  const requestDelete = (id: string) => {
    const quest = all.find((q) => q.id === id);
    if (!quest) return;
    setDeleteError('');
    setDeleteTarget({ id, title: quest.title, etag: quest.etag || '' });
    setDialog('delete');
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteBusy(true);
    const result = await deleteQuest(deleteTarget.id, deleteTarget.etag);
    setDeleteBusy(false);
    if (result.ok) {
      setDialog(null);
      setDeleteTarget(null);
    } else {
      setDeleteError(result.error || 'Could not remove this quest.');
    }
  };

  const showNotice = mode === 'live' && (offline || !!connectionError);

  return (
    <View style={[styles.root, { paddingBottom: insets.bottom }]}>
      <Topbar onOpenMenu={() => setSidebarVisible(true)} onRefresh={() => refresh(true)} onSettings={() => setDialog('settings')} />

      <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
        <View style={styles.intro}>
          <View style={styles.eyebrow}>
            <Icon name="spark" size={11} color={colors.gold} />
            <Text style={styles.eyebrowText}>A LITTLE PROGRESS, EVERY DAY</Text>
          </View>
          <Text style={styles.heading}>Your everyday adventure.</Text>
          <Text style={styles.subheading}>Big dreams. Small steps. A few worthwhile detours.</Text>
          <Pressable
            style={[styles.primaryButton, !(journal && editable(journal)) && styles.disabled]}
            disabled={!(journal && editable(journal))}
            onPress={() => openNewQuest(filter === 'side' ? 'side' : 'main')}>
            <Icon name="plus" size={15} color={colors.primaryText} />
            <Text style={styles.primaryButtonText}>New quest</Text>
          </Pressable>
        </View>

        <Hero percent={percentage} completed={cleared.length} total={all.length} />

        {showNotice && (
          <View style={styles.notice}>
            <Text style={styles.noticeText}>
              {offline ? 'You’re offline. You can view this journal; reconnect to make changes.' : connectionError}
            </Text>
            <Pressable onPress={() => refresh(true)}>
              <Text style={styles.noticeAction}>Try again</Text>
            </Pressable>
          </View>
        )}

        <Stats active={active.length} subquestsCleared={all.filter((q) => q.parent && q.completed).length} completed={finished.length} />

        <Toolbar allCount={counts.all} />

        <View style={styles.boardHeading}>
          <Text style={styles.boardTitle} numberOfLines={1}>
            {journal?.title || 'Your first chapter'}
          </Text>
          <Text style={styles.boardCount}>{active.length} active</Text>
          <View style={{ flex: 1 }} />
          {mode === 'demo' && journal?.shared && (
            <View style={styles.membersRow}>
              <View style={[styles.memberAvatar, { backgroundColor: '#dfd7c0' }]}>
                <Text style={styles.memberAvatarText}>Y</Text>
              </View>
              <View style={[styles.memberAvatar, { backgroundColor: '#b7c7b1', marginLeft: -8 }]}>
                <Text style={styles.memberAvatarText}>A</Text>
              </View>
              <Text style={styles.sharedLabel}>Demo party</Text>
            </View>
          )}
          {mode === 'demo' && <View style={styles.demoBadge}><Text style={styles.demoBadgeText}>DEMO</Text></View>}
          {journal && (
            <Pressable style={styles.shareButton} onPress={() => setDialog('share')}>
              <Icon name="users" size={13} color="#76846a" />
              <Text style={styles.shareButtonText}>Sharing</Text>
            </Pressable>
          )}
        </View>

        <Board onEdit={openEditQuest} onAddSub={openAddSub} onToggle={(id) => { toggleQuest(id); }} onNewQuest={openNewQuest} />

        <View style={styles.footnote}>
          <View style={styles.footnoteLine} />
          <Text style={styles.footnoteText}>The journey is better, one quest at a time.</Text>
          <View style={styles.footnoteLine} />
        </View>
      </ScrollView>

      <Sidebar
        visible={sidebarVisible}
        onClose={() => setSidebarVisible(false)}
        counts={counts}
        onNewJournal={() => setDialog('journal')}
        onConnect={openConnection}
        onSettings={() => setDialog('settings')}
      />

      <QuestDialog
        key={`quest-${questDialogNonce}`}
        visible={dialog === 'quest'}
        questId={questTarget.questId}
        parentId={questTarget.parentId}
        defaultKind={questTarget.kind}
        onClose={closeDialog}
        onRequestDelete={(id) => requestDelete(id)}
      />
      <JournalDialog visible={dialog === 'journal'} onClose={closeDialog} />
      <ConnectionDialog key={`connection-${connectionDialogNonce}`} visible={dialog === 'connection'} onClose={closeDialog} />
      <ShareDialog visible={dialog === 'share'} onClose={closeDialog} onConnect={openConnection} />
      <SettingsDialog visible={dialog === 'settings'} onClose={closeDialog} onConnect={openConnection} />
      <ConfirmDialog
        visible={dialog === 'delete'}
        title="Remove this quest?"
        message={`Remove "${deleteTarget?.title || ''}" from this journal? ${mode === 'live' ? 'This also removes it from Nextcloud for everyone with access.' : 'This cannot be undone.'}`}
        confirmLabel="Remove quest"
        cancelLabel="Keep quest"
        error={deleteError}
        busy={deleteBusy}
        onConfirm={confirmDelete}
        onCancel={() => {
          if (deleteTarget) openEditQuest(deleteTarget.id);
          else setDialog(null);
          setDeleteTarget(null);
        }}
      />

      <Toast />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1 },
  contentInner: { padding: 20, paddingBottom: 50, gap: 20 },
  intro: { gap: 10 },
  eyebrow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowText: { fontSize: 12, fontWeight: '700', letterSpacing: 1.5, color: colors.gold },
  heading: { fontFamily: pixelFont, fontSize: 18, lineHeight: 27, color: colors.intro, marginTop: 8 },
  subheading: { fontSize: 14, color: colors.introBody },
  primaryButton: {
    backgroundColor: colors.primaryBg,
    paddingVertical: 11,
    paddingHorizontal: 15,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  primaryButtonText: { color: colors.primaryText, fontSize: 14 },
  disabled: { opacity: 0.5 },
  notice: {
    backgroundColor: colors.noticeBg,
    borderWidth: 1,
    borderColor: colors.noticeBorder,
    borderRadius: 5,
    padding: 11,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  noticeText: { flex: 1, fontSize: 14, color: colors.noticeText, lineHeight: 20 },
  noticeAction: { fontSize: 14, color: colors.noticeText, textDecorationLine: 'underline' },
  boardHeading: { flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  boardTitle: { fontFamily: serifFont, fontSize: 20, color: '#40503b', flexShrink: 1 },
  boardCount: { fontSize: 13, color: '#969d8e' },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  memberAvatar: { width: 23, height: 23, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  memberAvatarText: { fontFamily: serifFont, fontSize: 12, color: colors.ink },
  sharedLabel: { fontSize: 12, color: '#8a9381', marginLeft: 4 },
  demoBadge: { backgroundColor: colors.localBadgeBg, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 4 },
  demoBadgeText: { fontSize: 11, color: colors.localBadgeText },
  shareButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  shareButtonText: { fontSize: 13, color: '#76846a' },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 10 },
  footnoteLine: { width: 35, height: 1, backgroundColor: colors.footnoteLine },
  footnoteText: { fontFamily: serifFont, fontStyle: 'italic', fontSize: 15, color: colors.footnoteText },
});
