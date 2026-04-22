import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef } from 'react';

import {
  remapExperimentProjectIds,
  syncPendingExperimentsThunk,
} from '@/experiment/state/experimentSlice';
import { syncPendingProjectsThunk } from '@/project/state/projectSlice';
import { processLocalSyncQueueThunk } from '@/settings/state/settingsSlice';
import { useAppDispatch } from '@/sharedModules/state/hooks';

export function OfflineSyncReconciler() {
  const dispatch = useAppDispatch();
  const wasOfflineRef = useRef<boolean | null>(null);

  useEffect(() => {
    const runSync = async () => {
      const projectAction = await dispatch(syncPendingProjectsThunk());
      if (syncPendingProjectsThunk.fulfilled.match(projectAction)) {
        const idMap = projectAction.payload.idMap;
        if (Object.keys(idMap).length > 0) {
          dispatch(remapExperimentProjectIds(idMap));
        }
      }
      await dispatch(syncPendingExperimentsThunk());
      await dispatch(processLocalSyncQueueThunk());
    };

    const unsub = NetInfo.addEventListener((state) => {
      const isOffline = !(state.isConnected ?? true) || !(state.isInternetReachable ?? true);
      const wasOffline = wasOfflineRef.current;
      wasOfflineRef.current = isOffline;

      if (!isOffline && wasOffline === true) {
        void runSync();
      }
    });

    return () => unsub();
  }, [dispatch]);

  return null;
}
