import React, { useEffect, useMemo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { dueLabel, isOverdue } from '@/lib/format';
import { progress } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import type { Quest } from '@/lib/types';
import { AnimatedCheck } from './animated-check';
import { AnimatedProgressBar } from './animated-progress-bar';
import { FadeText } from './fade-text';
import { Icon } from './icon';
import { createStyles } from './quest-card.styles';
import { SubquestRow } from './subquest-row';

interface Props {
  quest: Quest;
  all: Quest[];
  onEdit: (id: string) => void;
  onAddSub: (parentId: string, kind: Quest['kind']) => void;
  onToggle: (id: string) => void;
}

export function QuestCard({ quest, all, onEdit, onAddSub, onToggle }: Props) {
  const { collapsed, toggleCollapsed, editable } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const p = progress(all, quest.id);
  const isCollapsed = collapsed.has(quest.id);
  const children = all.filter((q) => q.parent === quest.id);
  const canEdit = editable(quest);
  const overdue = isOverdue(quest.due, quest.completed);
  const label = quest.kind === 'main' ? 'MAIN QUEST' : 'SIDE QUEST';

  // The whole card gently fades back once its quest is complete, instead of
  // snapping to its dimmed look.
  const fade = useSharedValue(quest.completed ? 1 : 0);
  useEffect(() => {
    fade.value = withTiming(quest.completed ? 1 : 0, { duration: 650, easing: Easing.out(Easing.quad) });
  }, [quest.completed, fade]);
  const cardStyle = useAnimatedStyle(() => ({ opacity: 1 - fade.value * 0.22 }));

  return (
    <Animated.View style={[styles.card, cardStyle]}>
      <View style={styles.top}>
        <View style={styles.kindRow}>
          <Icon name={quest.kind === 'main' ? 'sword' : 'spark'} size={12} color={quest.kind === 'main' ? colors.cardKind : colors.cardKindSide} />
          <Text style={[styles.kindLabel, { color: quest.kind === 'main' ? colors.cardKind : colors.cardKindSide }]}>{label}</Text>
          {quest.recurring && <Text style={styles.readOnly}>Recurring · view only</Text>}
          <View style={styles.menuRow}>
            <Pressable onPress={() => onEdit(quest.id)} hitSlop={8} accessibilityLabel={`Edit ${quest.title}`}>
              <Icon name="edit" size={15} color={colors.cardFooterText} />
            </Pressable>
            {p.total > 0 && (
              <Pressable onPress={() => toggleCollapsed(quest.id)} hitSlop={8} accessibilityLabel={isCollapsed ? 'Expand' : 'Collapse'}>
                <Icon name={isCollapsed ? 'chevron' : 'down'} size={15} color={colors.cardFooterText} />
              </Pressable>
            )}
          </View>
        </View>
        <View style={styles.titleRow}>
          <AnimatedCheck
            checked={quest.completed}
            onPress={() => onToggle(quest.id)}
            disabled={!canEdit}
            size={20}
            iconSize={12}
            borderRadius={4}
            style={styles.checkMargin}
            accessibilityLabel={`${quest.completed ? 'Reopen' : 'Complete'} ${quest.title}`}
          />
          <Pressable style={styles.titleWrap} onPress={() => onEdit(quest.id)}>
            <FadeText
              done={quest.completed}
              fromColor={colors.questTitle}
              toColor={colors.completedText}
              style={[styles.title, quest.completed && styles.titleDoneDecoration]}>
              {quest.title}
            </FadeText>
          </Pressable>
        </View>
        {!!quest.description && <Text style={styles.description}>{quest.description}</Text>}
      </View>

      {!isCollapsed && p.total > 0 && (
        <View style={styles.subquests}>
          {children.map((child) => (
            <SubquestRow key={child.id} quest={child} all={all} onEdit={onEdit} onAddSub={(id) => onAddSub(id, quest.kind)} onToggle={onToggle} seen={new Set([quest.id])} />
          ))}
        </View>
      )}

      {!isCollapsed && canEdit && (
        <Pressable style={styles.addSubquest} onPress={() => onAddSub(quest.id, quest.kind)}>
          <Icon name="plus" size={12} color={colors.addSubquest} />
          <Text style={styles.addSubquestText}>Add subquest</Text>
        </Pressable>
      )}

      {p.total > 0 && (
        <View style={styles.progressWrap}>
          <AnimatedProgressBar percent={p.percent} trackStyle={styles.progressTrack} fillStyle={styles.progressFill} />
        </View>
      )}

      <View style={[styles.footer, quest.kind === 'side' && styles.footerSide]}>
        <View style={styles.footerLeft}>
          <Icon name={quest.completed ? 'circleCheck' : 'flag'} size={12} color={colors.cardFooterText} />
          <Text style={styles.footerText}>
            {p.total > 0 ? `${p.done} of ${p.total} subquests` : quest.completed ? 'Quest completed' : 'A small adventure'}
          </Text>
        </View>
        {quest.readonly && (
          <View style={styles.miniTag}>
            <Text style={styles.miniTagText}>View only</Text>
          </View>
        )}
        {!!quest.due && (
          <View style={styles.dueRow}>
            <Icon name="calendar" size={12} color={overdue ? colors.overdue : colors.cardFooterText} />
            <Text style={[styles.footerText, overdue && styles.overdueText]}>{dueLabel(quest.due)}</Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
}
