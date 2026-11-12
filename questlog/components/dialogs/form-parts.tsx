import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';

import { colors } from '@/constants/theme';
import { Icon, IconName } from '../icon';

export function FieldLabel({ children, help }: { children: React.ReactNode; help?: string }) {
  return (
    <Text style={styles.label}>
      {children}
      {help ? <Text style={styles.help}> ({help})</Text> : null}
    </Text>
  );
}

export function TextField(props: TextInputProps) {
  return <TextInput placeholderTextColor={colors.search} {...props} style={[styles.input, props.style]} />;
}

export function TextAreaField(props: TextInputProps) {
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
  if (!children) return null;
  return <Text style={styles.error}>{children}</Text>;
}

export function HelpLine({ children }: { children: React.ReactNode }) {
  return <Text style={styles.helpLine}>{children}</Text>;
}

export function DialogActions({ children }: { children: React.ReactNode }) {
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
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.secondary, style, pressed && styles.pressed]}>
      {icon && <Icon name={icon} size={15} color={colors.ink} />}
      <Text style={styles.secondaryText}>{title}</Text>
    </Pressable>
  );
}

export function DangerButton({ title, onPress, disabled }: ButtonProps) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.dangerButton, pressed && styles.pressed]}>
      <Text style={styles.dangerText}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, color: colors.label, marginTop: 14, marginBottom: 7 },
  help: { fontSize: 13, color: colors.helpLine },
  input: {
    width: '100%',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    backgroundColor: colors.inputBg,
    fontSize: 16,
    color: colors.inputText,
  },
  textarea: { minHeight: 80 },
  error: { fontSize: 15, color: colors.formError, marginTop: 12, lineHeight: 21 },
  helpLine: { fontSize: 14, color: colors.helpLine, lineHeight: 20, marginTop: 8 },
  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 10, marginTop: 22, flexWrap: 'wrap' },
  primary: {
    backgroundColor: colors.primaryBg,
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  primaryText: { color: colors.primaryText, fontSize: 15 },
  secondary: {
    borderWidth: 1,
    borderColor: colors.secondaryBorder,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    backgroundColor: colors.paper,
  },
  secondaryText: { color: colors.ink, fontSize: 15 },
  dangerButton: { marginRight: 'auto', paddingVertical: 7 },
  dangerText: { color: colors.danger, fontSize: 15 },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.8 },
});
