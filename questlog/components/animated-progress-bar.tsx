import React, { useEffect } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

interface Props {
  percent: number;
  trackStyle?: StyleProp<ViewStyle>;
  fillStyle?: StyleProp<ViewStyle>;
  duration?: number;
}

/** A progress bar whose fill slowly animates to its new width instead of snapping. */
export function AnimatedProgressBar({ percent, trackStyle, fillStyle, duration = 650 }: Props) {
  const width = useSharedValue(percent);

  useEffect(() => {
    width.value = withTiming(percent, { duration, easing: Easing.out(Easing.cubic) });
  }, [percent, duration, width]);

  const animatedStyle = useAnimatedStyle(() => ({ width: `${width.value}%` }));

  return (
    <View style={trackStyle}>
      <Animated.View style={[fillStyle, animatedStyle]} />
    </View>
  );
}
