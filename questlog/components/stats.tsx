import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { colors, pixelFont } from '@/constants/theme';
import { Icon, IconName } from './icon';

function Stat({ icon, iconColor, iconBg, value, label }: { icon: IconName; iconColor: string; iconBg: string; value: number; label: string }) {
  return (
    <View style={styles.stat}>
      <View style={[styles.iconWrap, { backgroundColor: iconBg }]}>
        <Icon name={icon} size={17} color={iconColor} />
      </View>
      <View>
        <Text style={styles.value}>{String(value).padStart(2, '0')}</Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

export function Stats({ active, subquestsCleared, completed }: { active: number; subquestsCleared: number; completed: number }) {
  return (
    <View style={styles.row}>
      <Stat icon="sword" iconColor={colors.statIconGold} iconBg={colors.statIconGoldBg} value={active} label="Active quests" />
      <Stat icon="flag" iconColor={colors.statIconGreen} iconBg={colors.statIconGreenBg} value={subquestsCleared} label="Subquests cleared" />
      <Stat icon="circleCheck" iconColor={colors.statIconGrey} iconBg={colors.statIconGreyBg} value={completed} label="Quests completed" />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  stat: {
    flex: 1,
    backgroundColor: colors.statBg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    padding: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  iconWrap: { width: 29, height: 29, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  value: { fontFamily: pixelFont, fontSize: 18 },
  label: { fontSize: 12, color: colors.statLabel, marginTop: 8 },
});
