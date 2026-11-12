import React from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, pixelFont } from '@/constants/theme';
import { Icon } from './icon';

interface Props {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  closeLabel?: string;
}

/** A centered card dialog, styled after questlog/dist/styles.css's `<dialog>`. */
export function ModalShell({ visible, title, onClose, children }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} accessibilityLabel="Close dialog" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={[styles.cardWrap, { pointerEvents: 'box-none' }]}>
          <View style={styles.card}>
            <View style={styles.head}>
              <Text style={styles.title}>{title}</Text>
              <Pressable onPress={onClose} accessibilityLabel="Close dialog" hitSlop={10}>
                <Icon name="close" size={18} color={colors.breadcrumb} />
              </Pressable>
            </View>
            <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} keyboardShouldPersistTaps="handled">
              {children}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.dialogBackdrop, justifyContent: 'center', padding: 18 },
  cardWrap: { maxHeight: '90%' },
  card: {
    backgroundColor: colors.dialogBg,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: colors.dialogBorder,
    maxHeight: '100%',
    overflow: 'hidden',
  },
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 6,
  },
  title: { fontSize: 15, lineHeight: 22, color: colors.dialogText, flexShrink: 1, fontFamily: pixelFont, paddingRight: 10 },
  body: { paddingHorizontal: 22 },
  bodyContent: { paddingBottom: 23, paddingTop: 11 },
});
