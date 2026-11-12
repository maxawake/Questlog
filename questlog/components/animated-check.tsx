import React, { useEffect } from 'react';
import { Pressable, StyleProp, ViewStyle } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { colors } from '@/constants/theme';
import { Icon } from './icon';

const DURATION = 550;

interface Props {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  size?: number;
  iconSize?: number;
  borderRadius?: number;
  accessibilityLabel: string;
  style?: StyleProp<ViewStyle>;
}

/** A checkbox that slowly fades between its unchecked and checked look. */
export function AnimatedCheck({ checked, onPress, disabled, size = 20, iconSize = 12, borderRadius, accessibilityLabel, style }: Props) {
  const progress = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: DURATION, easing: Easing.out(Easing.quad) });
  }, [checked, progress]);

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], ['rgba(0,0,0,0)', colors.checkChecked]),
    borderColor: interpolateColor(progress.value, [0, 1], [colors.checkBorder, colors.checkChecked]),
  }));
  const iconStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.5 + progress.value * 0.5 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={8}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: borderRadius ?? size * 0.2,
            borderWidth: 1.4,
            alignItems: 'center',
            justifyContent: 'center',
          },
          style,
          boxStyle,
        ]}>
        <Animated.View style={iconStyle}>
          <Icon name="check" size={iconSize} color="white" strokeWidth={3} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}
