import React, { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors, serifFont } from '@/constants/theme';
import { dueLabel, isOverdue } from '@/lib/format';
import { progress } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import type { Quest } from '@/lib/types';
import { AnimatedCheck } from './animated-check';
import { AnimatedProgressBar } from './animated-progress-bar';
import { FadeText } from './fade-text';
import { Icon } from './icon';
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

const styles = StyleSheet.create({
  card: { backgroundColor: colors.paper, borderWidth: 1, borderColor: colors.cardBorder, borderRadius: 8, overflow: 'hidden' },
  top: { padding: 20 },
  kindRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 11 },
  kindLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 1 },
  readOnly: { fontSize: 12, color: colors.readOnly, marginLeft: 4 },
  menuRow: { flexDirection: 'row', gap: 10, marginLeft: 'auto', alignItems: 'center' },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 11 },
  checkMargin: { marginTop: 4 },
  titleWrap: { flex: 1 },
  title: { fontFamily: serifFont, fontSize: 24, lineHeight: 30, color: colors.questTitle },
  titleDoneDecoration: { textDecorationLine: 'line-through', textDecorationColor: colors.completedText },
  description: { fontSize: 14, color: colors.questDescription, lineHeight: 20, marginTop: 8, marginLeft: 31 },
  subquests: { paddingHorizontal: 21 },
  addSubquest: { flexDirection: 'row', alignItems: 'center', gap: 7, marginHorizontal: 21, marginBottom: 10, paddingVertical: 6 },
  addSubquestText: { fontSize: 14, color: colors.addSubquest },
  progressWrap: { paddingHorizontal: 21, paddingBottom: 16 },
  progressTrack: { height: 3, backgroundColor: '#edf0e6', borderRadius: 20, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#bdc6a7', borderRadius: 20 },
  footer: {
    backgroundColor: colors.cardFooterBg,
    borderTopWidth: 1,
    borderTopColor: colors.cardFooterBorder,
    paddingHorizontal: 21,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  footerSide: { backgroundColor: colors.sideFooterBg },
  footerLeft: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 13, color: colors.cardFooterText },
  overdueText: { color: colors.overdue },
  miniTag: { borderWidth: 1, borderColor: colors.miniTagBorder, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 3 },
  miniTagText: { fontSize: 12, color: colors.cardFooterText },
  dueRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginLeft: 'auto' },
});
