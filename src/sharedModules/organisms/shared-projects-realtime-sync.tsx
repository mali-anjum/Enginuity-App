import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { fetchExperimentsThunk } from '@/experiment/state/experimentSlice';
import { fetchNotesThunk } from '@/notes/state/notesSlice';
import { Colors } from '@/common/constants/theme';
import { useColorScheme } from '@/common/hooks/use-color-scheme';
import { ThemedText } from '@/common/atoms/themed-text';
import { getSupabaseClientOrNull } from '@/sharedModules/services/supabase/supabaseClient';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { unwrapSupabaseClient } from '@/sharedModules/services/supabase/supabaseUntypedClient';

export function SharedProjectsRealtimeSync() {
  const dispatch = useAppDispatch();
  const userId = useAppSelector((state) => state.auth.user?.id ?? null);
  const sharedProjectIds = useAppSelector((state) =>
    state.project.projects.filter((project) => project.sharedWithMe).map((project) => project.id),
  );
  const colorScheme = useColorScheme() ?? 'light';
  const themeColors = Colors[colorScheme];
  const [bannerText, setBannerText] = useState<string | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const authorNameCacheRef = useRef(new Map<string, string>());
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showBanner = useCallback((text: string) => {
    setBannerText(text);
    opacity.stopAnimation();
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    Animated.timing(opacity, {
      toValue: 1,
      duration: 180,
      useNativeDriver: true,
    }).start();
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 260,
        useNativeDriver: true,
      }).start(() => setBannerText(null));
    }, 3000);
  }, [opacity]);

  useEffect(() => {
    const client = getSupabaseClientOrNull();
    if (!client || !userId) return;
    const sb = unwrapSupabaseClient(client);
    const sharedIdSet = new Set(sharedProjectIds);

    const channel = client
      .channel(`shared-projects-feed-${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'experiments' },
        async (payload) => {
          const inserted = payload.new as { project_id?: string; owner_id?: string } | null;
          const projectId = inserted?.project_id ?? null;
          const ownerId = inserted?.owner_id ?? null;
          if (!projectId || !sharedIdSet.has(projectId) || !ownerId || ownerId === userId) {
            return;
          }

          void dispatch(fetchExperimentsThunk());
          void dispatch(fetchNotesThunk());

          let authorName = authorNameCacheRef.current.get(ownerId);
          if (!authorName) {
            const { data } = await sb.from('profiles').select('full_name').eq('user_id', ownerId).maybeSingle();
            authorName = (data as { full_name?: string } | null)?.full_name?.trim() || 'A teammate';
            authorNameCacheRef.current.set(ownerId, authorName);
          }
          showBanner(`New experiment added by ${authorName}`);
        },
      )
      .subscribe();

    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      void client.removeChannel(channel);
    };
  }, [dispatch, sharedProjectIds, showBanner, userId]);

  if (!bannerText) return null;

  return (
    <Animated.View style={[styles.banner, { opacity, backgroundColor: themeColors.accentSoft, borderColor: themeColors.accentBorder }]}>
      <View style={styles.inner}>
        <ThemedText style={{ color: themeColors.subtleText }}>{bannerText}</ThemedText>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute',
    top: 44,
    left: 12,
    right: 12,
    borderWidth: 1,
    borderRadius: 12,
    zIndex: 125,
  },
  inner: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
