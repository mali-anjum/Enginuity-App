import * as ImagePicker from 'expo-image-picker';
import { useRouter, type Href } from 'expo-router';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { selectUser, uploadAvatarThunk } from '@/auth/state/authSlice';
import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ROUTES } from '@/sharedModules/navigation/routes';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';

export default function AvatarPickerScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);

  const handlePick = async (source: 'camera' | 'gallery') => {
    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
          });

    if (result.canceled || !result.assets[0]?.uri) {
      return;
    }

    await dispatch(uploadAvatarThunk({ localUri: result.assets[0].uri }));
    router.replace(ROUTES.profileHome as Href);
  };

  return (
    <ThemedView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedText type="title">Avatar Picker</ThemedText>
        <View style={[styles.previewCard, { borderColor: themeColors.border }]}>
          {user?.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: themeColors.heroTint }]} />
          )}
          <ThemedText style={{ color: themeColors.mutedText }}>
            Pick from camera or gallery, then upload to Supabase Storage.
          </ThemedText>
        </View>

        <Pressable
          style={[styles.actionBtn, { borderColor: themeColors.border }]}
          onPress={() => void handlePick('camera')}>
          <ThemedText>Use Camera</ThemedText>
        </Pressable>
        <Pressable
          style={[styles.actionBtn, { borderColor: themeColors.border }]}
          onPress={() => void handlePick('gallery')}>
          <ThemedText>Choose from Gallery</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  content: { padding: 16, gap: 12, paddingBottom: 40 },
  previewCard: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60 },
  actionBtn: { borderWidth: 1, borderRadius: 10, paddingVertical: 11, alignItems: 'center' },
});
