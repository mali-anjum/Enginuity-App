import type { AuthDiscipline, AuthUser } from '@/auth/state/authSlice';
import { withSupabaseClient } from '@/sharedModules/services/supabase/supabaseClient';

const AVATAR_BUCKET = 'avatars';

type ProfileRow = {
  full_name: string | null;
  discipline: AuthDiscipline | null;
  avatar_url: string | null;
  bio: string | null;
  institution: string | null;
  storage_used_mb: number | null;
};

type PersistedProfile = Pick<
  AuthUser,
  'name' | 'discipline' | 'avatarUrl' | 'bio' | 'institution' | 'storageUsedMb'
>;

function mapProfileToUserProfile(profile: ProfileRow | null, fallbackName: string): PersistedProfile {
  return {
    name: profile?.full_name?.trim() || fallbackName,
    discipline: profile?.discipline ?? null,
    avatarUrl: profile?.avatar_url ?? null,
    bio: profile?.bio ?? '',
    institution: profile?.institution ?? '',
    storageUsedMb: profile?.storage_used_mb ?? 0,
  };
}

export async function fetchProfileByUserId(userId: string, fallbackName: string) {
  const { data, error } = await withSupabaseClient((client) =>
    client
      .from('profiles')
      .select('full_name, discipline, avatar_url, bio, institution, storage_used_mb')
      .eq('user_id', userId)
      .maybeSingle(),
  );

  if (error) {
    throw new Error(error.message);
  }

  return mapProfileToUserProfile((data as ProfileRow | null) ?? null, fallbackName);
}

export async function saveProfileByUserId(
  userId: string,
  payload: { name: string; discipline: AuthDiscipline | null; bio: string; institution: string },
) {
  const { error } = await withSupabaseClient((client) =>
    client
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          full_name: payload.name,
          discipline: payload.discipline,
          bio: payload.bio,
          institution: payload.institution || null,
        },
        { onConflict: 'user_id' },
      ),
  );

  if (error) {
    throw new Error(error.message);
  }
}

export async function uploadAvatarAndPersist(userId: string, fileUri: string) {
  const response = await fetch(fileUri);
  const fileBlob = await response.blob();
  const path = `${userId}/${Date.now()}-avatar.jpg`;
  const { error: uploadError } = await withSupabaseClient((client) =>
    client.storage.from(AVATAR_BUCKET).upload(path, fileBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    }),
  );

  if (uploadError) {
    throw new Error(uploadError.message);
  }

  const { data: publicData } = await withSupabaseClient((client) =>
    client.storage.from(AVATAR_BUCKET).getPublicUrl(path),
  );
  const avatarUrl = publicData.publicUrl;

  const { error: profileError } = await withSupabaseClient((client) =>
    client
      .from('profiles')
      .upsert(
        {
          user_id: userId,
          avatar_url: avatarUrl,
        },
        { onConflict: 'user_id' },
      ),
  );

  if (profileError) {
    throw new Error(profileError.message);
  }

  return avatarUrl;
}
