import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, pixelFont } from '@/constants/theme';
import { descendants, roots } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import type { Quest, QuestKind } from '@/lib/types';
import { Icon } from './icon';
import { QuestCard } from './quest-card';

interface Props {
  onEdit: (id: string) => void;
  onAddSub: (parentId: string, kind: QuestKind) => void;
  onToggle: (id: string) => void;
  onNewQuest: (kind: QuestKind) => void;
}

export function Board({ onEdit, onAddSub, onToggle, onNewQuest }: Props) {
  const { questsHere, filter, search, currentJournal, editable } = useQuestlog();
  const all = questsHere();
  const query = search.trim().toLowerCase();
  let visible = roots(all).filter((q) => (filter === 'completed' ? q.completed : !q.completed));
  if (filter === 'main' || filter === 'side') visible = visible.filter((q) => q.kind === filter);
  if (query) {
    visible = visible.filter((q) =>
      [q, ...descendants(all, q.id)].some((c) => `${c.title} ${c.description}`.toLowerCase().includes(query))
    );
  }

  if (!visible.length) {
    const title = query ? 'No quests found' : filter === 'completed' ? 'Your story is still unfolding' : 'A new adventure awaits';
    const body = query
      ? 'Try another word, or explore a different journal.'
      : filter === 'completed'
      ? 'Completed quests will find their home here.'
      : 'Start with something meaningful. Every great quest begins with a small step.';
    return (
      <View style={styles.empty}>
        <Icon name="compass" size={30} color={colors.emptyIcon} />
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyBody}>{body}</Text>
        {filter !== 'completed' && !query && (
          <Pressable style={styles.emptyButton} onPress={() => onNewQuest('main')}>
            <Text style={styles.emptyButtonText}>Begin a quest</Text>
          </Pressable>
        )}
      </View>
    );
  }

  const kinds: QuestKind[] = filter === 'main' ? ['main'] : filter === 'side' ? ['side'] : ['main', 'side'];
  const journal = currentJournal();
  const canAdd = filter !== 'completed' && editable(journal);

  return (
    <View style={styles.grid}>
      {kinds.map((kind) => {
        const items = visible.filter((q: Quest) => q.kind === kind);
        const heading = kind === 'main' ? 'The bigger picture' : 'Little adventures';
        return (
          <View key={kind} style={styles.column}>
            <View style={styles.columnHeading}>
              <Icon name={kind === 'main' ? 'sword' : 'spark'} size={13} color={colors.cardKind} />
              <Text style={styles.columnHeadingText}>{heading}</Text>
              <View style={styles.columnLine} />
            </View>
            {items.map((quest) => (
              <QuestCard key={quest.id} quest={quest} all={all} onEdit={onEdit} onAddSub={onAddSub} onToggle={onToggle} />
            ))}
            {canAdd && (
              <Pressable style={styles.newCard} onPress={() => onNewQuest(kind)}>
                <Icon name="plus" size={14} color={colors.newCardText} />
                <Text style={styles.newCardText}>Add a {kind} quest</Text>
              </Pressable>
            )}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { gap: 24 },
  column: { gap: 16 },
  columnHeading: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  columnHeadingText: { fontFamily: pixelFont, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: '#929887' },
  columnLine: { flex: 1, height: 1, backgroundColor: '#dedfd3', marginLeft: 6 },
  newCard: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.newCardBorder,
    borderRadius: 7,
    minHeight: 49,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  newCardText: { fontSize: 14, color: colors.newCardText },
  empty: {
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.emptyBorder,
    borderRadius: 8,
    gap: 6,
  },
  emptyTitle: { fontFamily: pixelFont, fontSize: 14, lineHeight: 22, color: colors.emptyText, marginTop: 10, textAlign: 'center' },
  emptyBody: { fontSize: 15, lineHeight: 22, color: colors.emptyText, textAlign: 'center' },
  emptyButton: { backgroundColor: colors.primaryBg, paddingVertical: 11, paddingHorizontal: 16, borderRadius: 5, marginTop: 10 },
  emptyButtonText: { color: colors.primaryText, fontSize: 15 },
});
