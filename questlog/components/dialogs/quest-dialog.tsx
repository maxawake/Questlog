import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/constants/theme';
import { descendants } from '@/lib/model';
import { useQuestlog } from '@/lib/questlog-store';
import type { QuestKind } from '@/lib/types';
import { Icon } from '../icon';
import { DangerButton, DialogActions, ErrorText, FieldLabel, HelpLine, PrimaryButton, SecondaryButton, TextAreaField, TextField } from './form-parts';
import { ModalShell } from '../modal-shell';

interface Props {
  visible: boolean;
  questId: string | null;
  parentId: string | null;
  defaultKind: QuestKind;
  onClose: () => void;
  onRequestDelete: (id: string) => void;
}

export function QuestDialog({ visible, questId, parentId, defaultKind, onClose, onRequestDelete }: Props) {
  const { questsHere, currentJournal, editable, createQuest, updateQuest } = useQuestlog();
  const all = questsHere();
  const existing = useMemo(() => all.find((q) => q.id === questId) || null, [all, questId]);
  const parentQuest = useMemo(() => all.find((q) => q.id === parentId) || null, [all, parentId]);
  const journal = currentJournal();
  const canEdit = editable(existing || journal);

  // The parent gives this component a fresh `key` each time a quest dialog is
  // opened, so these only need to be initialized once per mount (no reset
  // effect needed) from whichever quest/parent it opened for.
  const [title, setTitle] = useState(existing?.title || '');
  const [description, setDescription] = useState(existing?.description || '');
  const [kind, setKind] = useState<QuestKind>(existing?.kind || parentQuest?.kind || defaultKind);
  const [parent, setParent] = useState<string>(existing?.parent || parentId || '');
  const [due, setDue] = useState<string | null>(existing?.due || null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const excluded = useMemo(
    () => new Set(existing ? [existing.id, ...descendants(all, existing.id).map((q) => q.id)] : []),
    [all, existing]
  );
  const options = all.filter((q) => !excluded.has(q.id) && !q.readonly);

  const close = () => {
    setError('');
    onClose();
  };

  const handleDeletePress = () => {
    if (!existing) return;
    if (all.some((q) => q.parent === existing.id)) {
      setError('Move or remove the subquests first, so none are lost.');
      return;
    }
    onRequestDelete(existing.id);
  };

  const submit = async () => {
    if (!title.trim()) {
      setError('Give your quest a name.');
      return;
    }
    if (!journal) return;
    const effectiveKind = parent ? all.find((q) => q.id === parent)?.kind || kind : kind;
    setBusy(true);
    const result = existing
      ? await updateQuest(existing.id, existing.etag || '', {
          title: title.trim(),
          description: description.trim(),
          kind: effectiveKind,
          parent: parent || null,
          due,
          list_id: journal.id,
        })
      : await createQuest({
          title: title.trim(),
          description: description.trim(),
          kind: effectiveKind,
          parent: parent || null,
          due,
          list_id: journal.id,
        });
    setBusy(false);
    if (result.ok) close();
    else setError(result.error || 'Could not save this quest.');
  };

  const dialogTitle = existing ? 'A chapter in your journey' : parentId ? 'One step closer' : 'Begin a new quest';
  const intro = parentId
    ? `A subquest for "${parentQuest?.title}".`
    : 'Give your next adventure a name. The small ones count, too.';

  return (
    <ModalShell visible={visible} title={dialogTitle} onClose={close}>
      <Text style={styles.intro}>{intro}</Text>

      <FieldLabel>Quest name</FieldLabel>
      <TextField
        value={title}
        onChangeText={setTitle}
        placeholder="What will your next adventure be?"
        editable={canEdit}
        autoFocus
      />

      <FieldLabel help="optional">A little more detail</FieldLabel>
      <TextAreaField
        value={description}
        onChangeText={setDescription}
        placeholder="A reason to begin, or a reminder for later…"
        editable={canEdit}
      />

      <FieldLabel>Choose your path</FieldLabel>
      <View style={styles.pillRow}>
        {(['main', 'side'] as QuestKind[]).map((option) => (
          <Pressable
            key={option}
            disabled={!canEdit}
            onPress={() => setKind(option)}
            style={[styles.pill, kind === option && styles.pillChecked]}>
            <Icon name={option === 'main' ? 'sword' : 'spark'} size={15} color={colors.pillText} />
            <Text style={styles.pillText}>{option === 'main' ? 'Main quest' : 'Side quest'}</Text>
          </Pressable>
        ))}
      </View>

      <FieldLabel>Part of a bigger quest</FieldLabel>
      <View style={styles.pickerWrap}>
        <Picker selectedValue={parent} onValueChange={(value) => setParent(String(value))} enabled={canEdit}>
          <Picker.Item label="An adventure of its own" value="" />
          {options.map((q) => (
            <Picker.Item key={q.id} label={q.title} value={q.id} />
          ))}
        </Picker>
      </View>

      <FieldLabel help="optional">Aiming for</FieldLabel>
      <Pressable style={styles.dateField} disabled={!canEdit} onPress={() => setShowDatePicker(true)}>
        <Icon name="calendar" size={15} color={colors.ink} />
        <Text style={styles.dateText}>{due || 'No date chosen'}</Text>
        {due ? (
          <Pressable onPress={() => setDue(null)} disabled={!canEdit} hitSlop={8}>
            <Icon name="close" size={14} color={colors.search} />
          </Pressable>
        ) : null}
      </Pressable>
      {showDatePicker && (
        <DateTimePicker
          value={due ? new Date(`${due}T12:00:00`) : new Date()}
          mode="date"
          onChange={(event, selected) => {
            setShowDatePicker(false);
            if (event.type === 'set' && selected) {
              const y = selected.getFullYear();
              const m = String(selected.getMonth() + 1).padStart(2, '0');
              const d = String(selected.getDate()).padStart(2, '0');
              setDue(`${y}-${m}-${d}`);
            }
          }}
        />
      )}

      {existing?.recurring ? (
        <HelpLine>This quest repeats. Edit it in Nextcloud Tasks to keep its recurrence rules intact.</HelpLine>
      ) : !canEdit ? (
        <HelpLine>This quest is currently view only.</HelpLine>
      ) : null}

      <ErrorText>{error}</ErrorText>
      <DialogActions>
        {existing && canEdit ? <DangerButton title="Remove quest" onPress={handleDeletePress} /> : null}
        <SecondaryButton title={canEdit ? 'Cancel' : 'Close'} onPress={close} />
        {canEdit ? (
          <PrimaryButton title={existing ? 'Save changes' : 'Add quest'} icon="plus" onPress={submit} loading={busy} />
        ) : null}
      </DialogActions>
    </ModalShell>
  );
}

const styles = StyleSheet.create({
  intro: { fontSize: 16, lineHeight: 23, color: colors.dialogBodyText },
  pillRow: { flexDirection: 'row', gap: 10 },
  pill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.pillBorder,
    borderRadius: 5,
    backgroundColor: colors.pillBg,
  },
  pillChecked: { borderColor: colors.pillBorderChecked, backgroundColor: colors.pillBgChecked },
  pillText: { color: colors.pillText, fontSize: 15 },
  pickerWrap: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 5, backgroundColor: colors.inputBg },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 5,
    backgroundColor: colors.inputBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  dateText: { flex: 1, color: colors.inputText, fontSize: 16 },
});
