import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, TextInputProps, View } from 'react-native';

import { useTheme } from '@/lib/theme-store';
import { Icon, IconName } from '../icon';
import { createStyles } from './form-parts.styles';

export function FieldLabel({ children, help }: { children: React.ReactNode; help?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Text style={styles.label}>
      {children}
      {help ? <Text style={styles.help}> ({help})</Text> : null}
    </Text>
  );
}

export function TextField(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <TextInput placeholderTextColor={colors.search} {...props} style={[styles.input, props.style]} />;
}

export function TextAreaField(props: TextInputProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <TextInput
      placeholderTextColor={colors.search}
      multiline
      textAlignVertical="top"
      {...props}
      style={[styles.input, styles.textarea, props.style]}
    />
  );
}

export function ErrorText({ children }: { children?: string }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function HelpLine({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <Text style={styles.helpLine}>{children}</Text>;
}

export function DialogActions({ children }: { children: React.ReactNode }) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return <View style={styles.actions}>{children}</View>;
}

interface ButtonProps {
  title: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
}

export function PrimaryButton({ title, onPress, icon, disabled, loading, style }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [styles.primary, style, (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
      {loading ? (
        <ActivityIndicator size="small" color={colors.primaryText} />
      ) : (
        icon && <Icon name={icon} size={15} color={colors.primaryText} />
      )}
      <Text style={styles.primaryText}>{title}</Text>
    </Pressable>
  );
}

export function SecondaryButton({ title, onPress, icon, disabled, style }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.secondary, style, pressed && styles.pressed]}>
      {icon && <Icon name={icon} size={15} color={colors.ink} />}
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

export function DangerButton({ title, onPress, disabled }: ButtonProps) {
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
      <Text style={styles.dangerText}>{title}</Text>
    </Pressable>
  );
}
