import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import type { ProjectStatus } from '@/project/state/projectSlice';

export type ProjectFormValues = {
  title: string;
  description: string;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
};

type ProjectFormProps = {
  values: ProjectFormValues;
  onChange: (patch: Partial<ProjectFormValues>) => void;
  submitLabel: string;
  onSubmit: () => void;
};

const STATUS_OPTIONS: ProjectStatus[] = ['active', 'completed', 'archived'];

export function ProjectForm({ values, onChange, submitLabel, onSubmit }: ProjectFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [pickerField, setPickerField] = useState<'startDate' | 'dueDate' | null>(null);
  const [draftDate, setDraftDate] = useState(values.startDate || values.dueDate || formatDate(new Date()));

  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 21 }, (_, index) => String(currentYear - 10 + index));
  }, []);

  const dueBeforeStart =
    Boolean(values.startDate) && Boolean(values.dueDate) && values.dueDate < values.startDate;
  const [draftYear, draftMonth, draftDay] = parseDateParts(draftDate);
  const dayOptions = useMemo(() => {
    const days = getDaysInMonth(draftYear, draftMonth);
    return Array.from({ length: days }, (_, index) => String(index + 1).padStart(2, '0'));
  }, [draftYear, draftMonth]);

  const openPicker = (field: 'startDate' | 'dueDate') => {
    setPickerField(field);
    setDraftDate(values[field] || formatDate(new Date()));
  };

  const closePicker = () => setPickerField(null);

  const applyDraftDate = () => {
    if (!pickerField) return;
    onChange({ [pickerField]: draftDate });
    setPickerField(null);
  };

  const onSubmitWithValidation = () => {
    if (dueBeforeStart) return;
    onSubmit();
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Name</ThemedText>
        <TextInput
          value={values.title}
          onChangeText={(text) => onChange({ title: text })}
          placeholder="Project name"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Description</ThemedText>
        <TextInput
          value={values.description}
          onChangeText={(text) => onChange({ description: text })}
          placeholder="What are you building?"
          placeholderTextColor={themeColors.mutedText}
          multiline
          style={[
            styles.input,
            styles.textArea,
            { borderColor: themeColors.border, color: themeColors.text },
          ]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Start Date</ThemedText>
        <Pressable
          onPress={() => openPicker('startDate')}
          style={[styles.input, styles.selector, { borderColor: themeColors.border }]}>
          <ThemedText style={{ color: values.startDate ? themeColors.text : themeColors.mutedText }}>
            {values.startDate || 'Select start date'}
          </ThemedText>
        </Pressable>
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Due Date</ThemedText>
        <Pressable
          onPress={() => openPicker('dueDate')}
          style={[
            styles.input,
            styles.selector,
            { borderColor: dueBeforeStart ? themeColors.danger : themeColors.border },
          ]}>
          <ThemedText style={{ color: values.dueDate ? themeColors.text : themeColors.mutedText }}>
            {values.dueDate || 'Select due date'}
          </ThemedText>
        </Pressable>
        {dueBeforeStart ? (
          <ThemedText style={{ color: themeColors.danger }}>Due Date cannot be before Start Date.</ThemedText>
        ) : null}
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Status</ThemedText>
        <View style={styles.statusRow}>
          {STATUS_OPTIONS.map((status) => {
            const active = values.status === status;
            return (
              <Pressable
                key={status}
                onPress={() => onChange({ status })}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{status}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <Pressable
        style={[
          styles.submitButton,
          { backgroundColor: dueBeforeStart ? themeColors.mutedText : themeColors.primary },
        ]}
        onPress={onSubmitWithValidation}>
        <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
          {submitLabel}
        </ThemedText>
      </Pressable>

      {pickerField ? (
        <View style={styles.overlay}>
          <Pressable style={styles.backdrop} onPress={closePicker} />
          <ThemedView
            style={[
              styles.sheet,
              { borderColor: themeColors.border, backgroundColor: themeColors.surfaceElevated },
            ]}>
            <ThemedText type="subtitle">{pickerField === 'startDate' ? 'Select Start Date' : 'Select Due Date'}</ThemedText>

            <View style={styles.pickerSection}>
              <ThemedText style={{ color: themeColors.mutedText }}>Year</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                {yearOptions.map((year) => (
                  <Pressable
                    key={year}
                    onPress={() => {
                      const nextDay = clampDay(draftDay, year, draftMonth);
                      setDraftDate(`${year}-${draftMonth}-${nextDay}`);
                    }}
                    style={[
                      styles.choiceChip,
                      {
                        borderColor: draftYear === year ? themeColors.primary : themeColors.border,
                        backgroundColor: draftYear === year ? themeColors.heroTint : themeColors.background,
                      },
                    ]}>
                    <ThemedText type={draftYear === year ? 'defaultSemiBold' : 'default'}>{year}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerSection}>
              <ThemedText style={{ color: themeColors.mutedText }}>Month</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                {MONTH_OPTIONS.map((month) => (
                  <Pressable
                    key={month}
                    onPress={() => {
                      const nextDay = clampDay(draftDay, draftYear, month);
                      setDraftDate(`${draftYear}-${month}-${nextDay}`);
                    }}
                    style={[
                      styles.choiceChip,
                      {
                        borderColor: draftMonth === month ? themeColors.primary : themeColors.border,
                        backgroundColor: draftMonth === month ? themeColors.heroTint : themeColors.background,
                      },
                    ]}>
                    <ThemedText type={draftMonth === month ? 'defaultSemiBold' : 'default'}>{month}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.pickerSection}>
              <ThemedText style={{ color: themeColors.mutedText }}>Day</ThemedText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.choiceRow}>
                {dayOptions.map((day) => (
                  <Pressable
                    key={day}
                    onPress={() => setDraftDate(`${draftYear}-${draftMonth}-${day}`)}
                    style={[
                      styles.choiceChip,
                      {
                        borderColor: draftDay === day ? themeColors.primary : themeColors.border,
                        backgroundColor: draftDay === day ? themeColors.heroTint : themeColors.background,
                      },
                    ]}>
                    <ThemedText type={draftDay === day ? 'defaultSemiBold' : 'default'}>{day}</ThemedText>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            <View style={styles.sheetActions}>
              <Pressable
                onPress={() => {
                  if (!pickerField) return;
                  onChange({ [pickerField]: '' });
                  setPickerField(null);
                }}
                style={[styles.actionButton, { borderColor: themeColors.border }]}>
                <ThemedText>Clear</ThemedText>
              </Pressable>
              <Pressable
                onPress={applyDraftDate}
                style={[styles.actionButton, { borderColor: themeColors.primary, backgroundColor: themeColors.heroTint }]}>
                <ThemedText type="defaultSemiBold">Apply</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      ) : null}
    </ThemedView>
  );
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, index) => String(index + 1).padStart(2, '0'));

function parseDateParts(value: string): [string, string, string] {
  const [year = '', month = '', day = ''] = value.split('-');
  const safeYear = /^\d{4}$/.test(year) ? year : String(new Date().getFullYear());
  const safeMonth = /^(0[1-9]|1[0-2])$/.test(month) ? month : '01';
  const maxDay = getDaysInMonth(safeYear, safeMonth);
  const rawDay = /^\d{2}$/.test(day) ? Number(day) : 1;
  const safeDay = String(Math.min(Math.max(rawDay, 1), maxDay)).padStart(2, '0');
  return [safeYear, safeMonth, safeDay];
}

function getDaysInMonth(year: string, month: string): number {
  return new Date(Number(year), Number(month), 0).getDate();
}

function clampDay(day: string, year: string, month: string): string {
  const maxDay = getDaysInMonth(year, month);
  return String(Math.min(Number(day), maxDay)).padStart(2, '0');
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 12,
  },
  group: {
    gap: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: {
    minHeight: 90,
    textAlignVertical: 'top',
  },
  selector: {
    minHeight: 43,
    justifyContent: 'center',
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  submitButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  overlay: { ...StyleSheet.absoluteFillObject, zIndex: 45, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(2, 6, 23, 0.4)' },
  sheet: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 10,
    minHeight: 260,
  },
  pickerSection: {
    gap: 6,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 8,
  },
  choiceChip: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  sheetActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 4,
  },
  actionButton: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
});
