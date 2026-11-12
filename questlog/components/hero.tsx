import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, pixelFont } from '@/constants/theme';
import { AnimatedProgressBar } from './animated-progress-bar';
import { Icon } from './icon';

export function Hero({ percent, completed, total }: { percent: number; completed: number; total: number }) {
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

const styles = StyleSheet.create({
  hero: {
    backgroundColor: colors.heroBg,
    borderWidth: 1,
    borderColor: colors.heroBorder,
    borderRadius: 9,
    padding: 20,
    gap: 16,
  },
  mark: { width: 47, height: 47, alignItems: 'center', justifyContent: 'center' },
  textCol: { gap: 6 },
  title: { fontFamily: pixelFont, fontSize: 13, lineHeight: 20, color: colors.heroTitle },
  body: { fontSize: 14, color: colors.heroBody, lineHeight: 21 },
  progressBlock: { gap: 8 },
  caption: { flexDirection: 'row', justifyContent: 'space-between', gap: 18 },
  captionLabel: { fontSize: 13, color: colors.progressCaption },
  captionValue: { fontSize: 13, color: colors.heroTitle, fontWeight: '600' },
  track: { height: 5, backgroundColor: colors.progressTrack, borderRadius: 20, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: colors.progressFill, borderRadius: 20 },
  small: { fontSize: 12, color: colors.heroBody, textAlign: 'right' },
});
