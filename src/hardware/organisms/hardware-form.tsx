import { Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { HARDWARE_CATEGORIES } from '@/hardware/constants';
import type { HardwareCategory } from '@/hardware/constants';

export type HardwareFormValues = {
  name: string;
  category: HardwareCategory;
  specs: string;
  datasheetUrl: string;
};

type HardwareFormProps = {
  values: HardwareFormValues;
  onChange: (patch: Partial<HardwareFormValues>) => void;
  submitLabel: string;
  onSubmit: () => void;
};

export function HardwareForm({ values, onChange, submitLabel, onSubmit }: HardwareFormProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Name</ThemedText>
        <TextInput
          value={values.name}
          onChangeText={(text) => onChange({ name: text })}
          placeholder="e.g. Arduino Nano, MPU6050, ESP32"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Category</ThemedText>
        <View style={styles.typeWrap}>
          {HARDWARE_CATEGORIES.map((category) => {
            const active = values.category === category;
            return (
              <Pressable
                key={category}
                onPress={() => onChange({ category })}
                style={[
                  styles.typeChip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.background,
                  },
                ]}>
                <ThemedText>{category}</ThemedText>
              </Pressable>
            );
          })}
        </View>
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Specs</ThemedText>
        <TextInput
          value={values.specs}
          onChangeText={(text) => onChange({ specs: text })}
          multiline
          placeholder="Pinout, voltage, ranges, package…"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, styles.textArea, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <View style={styles.group}>
        <ThemedText type="defaultSemiBold">Datasheet URL (optional)</ThemedText>
        <TextInput
          value={values.datasheetUrl}
          onChangeText={(text) => onChange({ datasheetUrl: text })}
          placeholder="https://..."
          placeholderTextColor={themeColors.mutedText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="url"
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
      </View>
      <Pressable style={[styles.submitButton, { backgroundColor: themeColors.primary }]} onPress={onSubmit}>
        <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
          {submitLabel}
        </ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { gap: 12 },
  group: { gap: 6 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  textArea: { minHeight: 90, textAlignVertical: 'top' },
  typeWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  typeChip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  submitButton: { borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
});
