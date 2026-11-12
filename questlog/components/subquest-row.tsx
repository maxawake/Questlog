import React, { useEffect, useMemo } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { useQuestlog } from '@/lib/questlog-store';
import { useTheme } from '@/lib/theme-store';
import type { Quest } from '@/lib/types';
import { AnimatedCheck } from './animated-check';
import { FadeText } from './fade-text';
import { Icon } from './icon';
import { createStyles } from './subquest-row.styles';

interface Props {
  quest: Quest;
  all: Quest[];
  depth?: number;
  onEdit: (id: string) => void;
  onAddSub: (parentId: string) => void;
  onToggle: (id: string) => void;
  seen?: Set<string>;
}

export function SubquestRow({ quest, all, depth = 0, onEdit, onAddSub, onToggle, seen }: Props) {
  const { editable } = useQuestlog();
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);

  // The row gently fades back once its subquest is complete. These hooks run
  // on every render (even for the already-visited guard below) to satisfy
  // the rules of hooks.
  const fade = useSharedValue(quest.completed ? 1 : 0);
  useEffect(() => {
    fade.value = withTiming(quest.completed ? 1 : 0, { duration: 600, easing: Easing.out(Easing.quad) });
  }, [quest.completed, fade]);
  const rowStyle = useAnimatedStyle(() => ({ opacity: 1 - fade.value * 0.25 }));

  const visited = seen || new Set<string>();
  if (visited.has(quest.id)) return null;
  const next = new Set([...visited, quest.id]);
  const children = all.filter((q) => q.parent === quest.id);
  const canEdit = editable(quest);

  return (
    <View>
      <Animated.View style={[styles.row, { paddingLeft: Math.min(depth, 4) * 18 }, rowStyle]}>
        {depth > 0 && <View style={[styles.connector, { left: Math.min(depth, 4) * 18 - 10 }]} />}
        <AnimatedCheck
          checked={quest.completed}
          onPress={() => onToggle(quest.id)}
          disabled={!canEdit}
          size={16}
          iconSize={10}
          borderRadius={3}
          style={styles.checkMargin}
          accessibilityLabel={`${quest.completed ? 'Reopen' : 'Complete'} ${quest.title}`}
        />
        <Pressable style={styles.titleWrap} onPress={() => onEdit(quest.id)}>
          <FadeText
            done={quest.completed}
            fromColor={colors.subTitle}
            toColor={colors.completedText}
            style={[styles.title, quest.completed && styles.titleDoneDecoration]}>
            {quest.title}
          </FadeText>
        </Pressable>
        <Pressable onPress={() => onAddSub(quest.id)} disabled={!canEdit} hitSlop={8} style={styles.addButton}>
          <Icon name="plus" size={13} color={colors.subActions} />
        </Pressable>
      </Animated.View>
      {children.map((child) => (
        <SubquestRow key={child.id} quest={child} all={all} depth={depth + 1} onEdit={onEdit} onAddSub={onAddSub} onToggle={onToggle} seen={next} />
      ))}
    </View>
  );
}
