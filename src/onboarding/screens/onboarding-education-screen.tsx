import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { AuthTextInput } from "@/auth/molecules/auth-text-input";
import { ThemedText } from "@/common/atoms/themed-text";
import { ThemedView } from "@/common/atoms/themed-view";
import { Colors } from "@/common/constants/theme";
import { useColorScheme } from "@/common/hooks/use-color-scheme";
import { INSTITUTION_TYPE_OPTIONS } from "@/onboarding/constants/onboardingLabels";
import { setInstitutionFields } from "@/onboarding/state/onboardingSlice";
import type { InstitutionType } from "@/onboarding/types/profileDraft";
import { ROUTES } from "@/sharedModules/navigation/routes";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export default function OnboardingEducationScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? "light";
  const themeColors = Colors[colorScheme];
  const draft = useAppSelector((s) => s.onboarding.profileDraft);
  const [name, setName] = useState(draft.institutionName);
  const [field, setField] = useState(draft.fieldOfStudy);
  const [type, setType] = useState<InstitutionType | null>(
    draft.institutionType,
  );

  const saveAndNext = () => {
    dispatch(
      setInstitutionFields({
        institutionName: name.trim(),
        institutionType: type,
        fieldOfStudy: field.trim(),
      }),
    );
    router.push(ROUTES.ONBOARDING_USAGE as never);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Education & affiliation</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          Helps us surface relevant templates and wording for your context.
        </ThemedText>
        <AuthTextInput
          placeholder="School, university, company, or lab name"
          value={name}
          onChangeText={setName}
        />
        <AuthTextInput
          placeholder="Major, programme, or research theme (optional)"
          value={field}
          onChangeText={setField}
        />
        <ThemedText type="defaultSemiBold">Type</ThemedText>
        <View style={styles.chips}>
          {INSTITUTION_TYPE_OPTIONS.map((opt) => {
            const isOn = type === opt.value;
            return (
              <Pressable
                key={opt.value}
                onPress={() => setType(isOn ? null : opt.value)}
                style={[
                  styles.chip,
                  {
                    borderColor: isOn
                      ? themeColors.primary
                      : themeColors.border,
                    backgroundColor: isOn
                      ? themeColors.heroTint
                      : themeColors.surfaceElevated,
                  },
                ]}
              >
                <ThemedText type="defaultSemiBold">{opt.label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <View style={styles.row}>
          <Pressable
            style={[styles.secondary, { borderColor: themeColors.border }]}
            onPress={() => router.back()}
          >
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable
            style={[styles.primary, { backgroundColor: themeColors.primary }]}
            onPress={saveAndNext}
          >
            <ThemedText
              style={{ color: themeColors.buttonPrimaryText }}
              type="defaultSemiBold"
            >
              Continue
            </ThemedText>
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { padding: 24, gap: 12, paddingBottom: 40 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: { flexDirection: "row", gap: 12, marginTop: 12 },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  primary: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
});
