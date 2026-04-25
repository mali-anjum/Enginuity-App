import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AuthTextInput } from '@/auth/molecules/auth-text-input';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { DISCOVERY_OPTIONS } from '@/onboarding/constants/onboardingLabels';
import { setGoalsFields } from '@/onboarding/state/onboardingSlice';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function OnboardingGoalsScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const draft = useAppSelector((s) => s.onboarding.profileDraft);
  const [goal, setGoal] = useState(draft.primaryGoal);
  const [discovery, setDiscovery] = useState(draft.discoverySource);
  const [customDiscovery, setCustomDiscovery] = useState('');

  const save = () => {
    const src = customDiscovery.trim() || discovery.trim();
    dispatch(setGoalsFields({ primaryGoal: goal.trim(), discoverySource: src }));
    router.push(ROUTES.ONBOARDING_REVIEW as never);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <ThemedText type="title">Goals</ThemedText>
        <ThemedText style={{ color: themeColors.subtleText }}>
          What should we optimize for first? You can update this later in settings.
        </ThemedText>
        <AuthTextInput
          placeholder="e.g. Track lab experiments and hardware for my capstone"
          value={goal}
          onChangeText={setGoal}
          multiline
        />
        <ThemedText type="defaultSemiBold">How did you hear about us?</ThemedText>
        <View style={styles.chips}>
          {DISCOVERY_OPTIONS.map((label) => {
            const isOn = discovery === label && !customDiscovery;
            return (
              <Pressable
                key={label}
                onPress={() => {
                  setCustomDiscovery('');
                  setDiscovery(isOn ? '' : label);
                }}
                style={[
                  styles.chip,
                  {
                    borderColor: isOn ? themeColors.primary : themeColors.border,
                    backgroundColor: isOn ? themeColors.heroTint : themeColors.surfaceElevated,
                  },
                ]}>
                <ThemedText type="defaultSemiBold">{label}</ThemedText>
              </Pressable>
            );
          })}
        </View>
        <AuthTextInput
          placeholder="Something else (optional)"
          value={customDiscovery}
          onChangeText={(t) => {
            setCustomDiscovery(t);
            setDiscovery('');
          }}
        />
        <View style={styles.row}>
          <Pressable
            style={[styles.secondary, { borderColor: themeColors.border }]}
            onPress={() => router.back()}>
            <ThemedText>Back</ThemedText>
          </Pressable>
          <Pressable style={[styles.primary, { backgroundColor: themeColors.primary }]} onPress={save}>
            <ThemedText style={{ color: themeColors.buttonPrimaryText }} type="defaultSemiBold">
              Review plan
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
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  row: { flexDirection: 'row', gap: 12, marginTop: 12 },
  secondary: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primary: { flex: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
});
