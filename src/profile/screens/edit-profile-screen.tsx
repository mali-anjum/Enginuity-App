import { useRouter, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';

import { selectUser, type AuthDiscipline, updateProfileThunk } from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
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
    <ThemedView style={styles.screen}>
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

        <Pressable
          style={[styles.saveBtn, { backgroundColor: themeColors.primary }]}
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
          }}>
          <ThemedText lightColor={themeColors.buttonPrimaryText} darkColor={themeColors.buttonPrimaryText}>
            Save Profile
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  input: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  textarea: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minHeight: 120,
    fontSize: 15,
    textAlignVertical: 'top',
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 10, paddingVertical: 6 },
  saveBtn: { borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
