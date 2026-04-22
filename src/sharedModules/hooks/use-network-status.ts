import NetInfo from '@react-native-community/netinfo';
import { useEffect, useRef, useState } from 'react';

type NetworkStatus = {
  isOffline: boolean;
  showSynced: boolean;
};

function isEffectivelyOffline(state: { isConnected: boolean | null; isInternetReachable: boolean | null }) {
  const connected = state.isConnected ?? true;
  const internetReachable = state.isInternetReachable ?? true;
  return !connected || !internetReachable;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOffline, setIsOffline] = useState(false);
  const [showSynced, setShowSynced] = useState(false);
  const previousOfflineRef = useRef<boolean | null>(null);
  const hideSyncedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const applyState = (nextOffline: boolean) => {
      const previous = previousOfflineRef.current;
      previousOfflineRef.current = nextOffline;
      setIsOffline(nextOffline);

      if (nextOffline) {
        if (hideSyncedTimer.current) {
          clearTimeout(hideSyncedTimer.current);
          hideSyncedTimer.current = null;
        }
        setShowSynced(false);
        return;
      }

      if (previous === true) {
        setShowSynced(true);
        if (hideSyncedTimer.current) clearTimeout(hideSyncedTimer.current);
        hideSyncedTimer.current = setTimeout(() => {
          setShowSynced(false);
          hideSyncedTimer.current = null;
        }, 2000);
      }
    };

    void NetInfo.fetch().then((state) => {
      applyState(
        isEffectivelyOffline({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        }),
      );
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      applyState(
        isEffectivelyOffline({
          isConnected: state.isConnected,
          isInternetReachable: state.isInternetReachable,
        }),
      );
    });

    return () => {
      unsubscribe();
      if (hideSyncedTimer.current) clearTimeout(hideSyncedTimer.current);
    };
  }, []);

  return { isOffline, showSynced };
}
