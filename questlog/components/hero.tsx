import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme-store';
import { AnimatedProgressBar } from './animated-progress-bar';
import { createStyles } from './hero.styles';
import { Icon } from './icon';

export function Hero({ percent, completed, total }: { percent: number; completed: number; total: number }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.hero}>
      <View style={styles.mark}>
        <Icon name="compass" size={33} color={colors.heroMarkIcon} strokeWidth={1} />
      </View>
      <View style={styles.textCol}>
        <Text style={styles.title}>Every small step counts.</Text>
        <Text style={styles.body}>You don&apos;t need to finish the whole journey today. Just take the next step.</Text>
      </View>
      <View style={styles.progressBlock}>
        <View style={styles.caption}>
          <Text style={styles.captionLabel}>Your journal progress</Text>
          <Text style={styles.captionValue}>{percent}%</Text>
        </View>
        <AnimatedProgressBar percent={percent} trackStyle={styles.track} fillStyle={styles.fill} />
        <Text style={styles.small}>
          {completed} of {total} quests &amp; subquests complete
        </Text>
      </View>
    </View>
  );
}
