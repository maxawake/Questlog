import React, { useEffect } from 'react';
import { TextProps } from 'react-native';
import Animated, { Easing, interpolateColor, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props extends TextProps {
  /** True once the quest/subquest this text belongs to is completed. */
  done: boolean;
  fromColor: string;
  toColor: string;
  /** Opacity once fully faded; 1 means no dimming, just the color fade. */
  toOpacity?: number;
  duration?: number;
}

/** Quest/subquest title text that slowly fades color (and optionally dims) when completed, instead of snapping instantly. */
export function FadeText({ done, fromColor, toColor, toOpacity = 1, duration = 600, style, children, ...rest }: Props) {
  const progress = useSharedValue(done ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(done ? 1 : 0, { duration, easing: Easing.out(Easing.quad) });
  }, [done, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [fromColor, toColor]),
    opacity: 1 - progress.value * (1 - toOpacity),
  }));

  return (
    <Animated.Text style={[style, animatedStyle]} {...rest}>
      {children}
    </Animated.Text>
  );
}
