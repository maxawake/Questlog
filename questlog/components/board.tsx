import React, { useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';

import { descendants, roots } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import type { Quest, QuestKind } from '@/lib/types';
import { createStyles } from './board.styles';
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
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
