import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useTheme } from '@/lib/theme-store';
import { Icon, IconName } from './icon';
import { createStyles } from './stats.styles';

function Stat({
  icon,
  iconColor,
  iconBg,
  value,
  label,
  styles,
}: {
  icon: IconName;
  iconColor: string;
  iconBg: string;
  value: number;
  label: string;
  styles: ReturnType<typeof createStyles>;
}) {
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
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <View style={styles.row}>
      <Stat styles={styles} icon="sword" iconColor={colors.statIconGold} iconBg={colors.statIconGoldBg} value={active} label="Active quests" />
      <Stat
        styles={styles}
        icon="flag"
        iconColor={colors.statIconGreen}
        iconBg={colors.statIconGreenBg}
        value={subquestsCleared}
        label="Subquests cleared"
      />
      <Stat styles={styles} icon="circleCheck" iconColor={colors.statIconGrey} iconBg={colors.statIconGreyBg} value={completed} label="Quests completed" />
    </View>
  );
}
