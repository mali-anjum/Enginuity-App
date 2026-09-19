import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { selectUser, type AuthDiscipline, updateProfileThunk } from '@/auth/state/authSlice';
import { AppButton } from '@/common/atoms/app-button';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors, Radii, Spacing } from '@/common/constants/theme';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/store/hooks';

const DISCIPLINES: AuthDiscipline[] = [
  'electrical',
  'mechanical',
  'software',
  'civil',
  'other',
];

function disciplineLabel(value: AuthDiscipline): string {
  const labels: Record<AuthDiscipline, string> = {
    electrical: 'Electronics',
    mechanical: 'Robotics',
    software: 'CS',
    civil: 'Physics',
    chemical: 'Chemical',
    other: 'Other',
  };
  return labels[value];
}

export default function EditProfileScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);

  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState<AuthDiscipline | null>(null);
  const [bio, setBio] = useState('');
  const [institution, setInstitution] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
    setDiscipline(user?.discipline ?? null);
    setBio(user?.bio ?? '');
    setInstitution(user?.institution ?? '');
  }, [user]);

  return (
    <ScreenContainer style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Edit Profile</ThemedText>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full name"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
        <TextInput
          value={institution}
          onChangeText={setInstitution}
          placeholder="Institution"
          placeholderTextColor={themeColors.mutedText}
          style={[styles.input, { borderColor: themeColors.border, color: themeColors.text }]}
        />
        <TextInput
          value={bio}
          onChangeText={setBio}
          placeholder="Bio"
          multiline
          placeholderTextColor={themeColors.mutedText}
          style={[styles.textarea, { borderColor: themeColors.border, color: themeColors.text }]}
        />

        <ThemedText type="defaultSemiBold">Discipline</ThemedText>
        <ThemedView style={styles.chips}>
          {DISCIPLINES.map((option) => {
            const active = discipline === option;
            return (
              <Pressable
                key={option}
                style={[
                  styles.chip,
                  {
                    borderColor: active ? themeColors.primary : themeColors.border,
                    backgroundColor: active ? themeColors.heroTint : themeColors.surfaceElevated,
                  },
                ]}
                onPress={() => setDiscipline(option)}>
                <ThemedText>{disciplineLabel(option)}</ThemedText>
              </Pressable>
            );
          })}
        </ThemedView>

        <AppButton
          label="Save Profile"
          onPress={() => {
            if (!name.trim()) return;
            void dispatch(
              updateProfileThunk({
                name: name.trim(),
                discipline,
                bio: bio.trim(),
                institution: institution.trim(),
              }),
            );
            router.replace(ROUTES.PROFILE_HOME as Href);
          }}
        />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: Spacing.lg, gap: Spacing.md, paddingBottom: Spacing.xxxl + Spacing.sm },
  input: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: 15,
  },
  textarea: {
    borderWidth: 1,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 120,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  chip: { borderWidth: 1, borderRadius: Radii.full, paddingHorizontal: Spacing.sm + 2, paddingVertical: Spacing.xs + 2 },
});
