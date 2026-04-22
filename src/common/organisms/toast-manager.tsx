import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { dispatchRetryOperation } from '@/sharedModules/state/retryRegistry';
import { useAppDispatch, useAppSelector } from '@/sharedModules/state/hooks';
import { removeToast, selectToasts, type Toast } from '@/ui/state/uiSlice';

const TOAST_DURATION_MS = 3000;
const SWIPE_DISMISS_THRESHOLD = 70;

function toastColor(variant: Toast['variant']) {
  switch (variant) {
    case 'success':
      return '#16A34A';
    case 'warning':
      return '#D97706';
    case 'error':
      return '#DC2626';
    case 'info':
    default:
      return '#2563EB';
  }
}

function ToastCard({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch();
  const translateX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(removeToast(toast.id));
    }, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [dispatch, toast.id]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy),
        onPanResponderMove: (_, gesture) => {
          translateX.setValue(gesture.dx);
        },
        onPanResponderRelease: (_, gesture) => {
          if (Math.abs(gesture.dx) > SWIPE_DISMISS_THRESHOLD) {
            dispatch(removeToast(toast.id));
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            speed: 20,
            bounciness: 8,
          }).start();
        },
      }),
    [dispatch, toast.id, translateX],
  );

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        styles.toastWrap,
        {
          transform: [{ translateX }],
        },
      ]}>
      <Pressable
        style={[
          styles.toast,
          {
            backgroundColor: toastColor(toast.variant),
          },
        ]}
        onPress={() => dispatch(removeToast(toast.id))}>
        <ThemedText lightColor="#FFFFFF" darkColor="#FFFFFF" style={styles.toastText}>
          {toast.message}
        </ThemedText>
        {toast.retry ? (
          <Pressable
            style={styles.retryButton}
            onPress={() => {
              dispatchRetryOperation(dispatch, toast.retry);
              dispatch(removeToast(toast.id));
            }}>
            <ThemedText lightColor="#FFFFFF" darkColor="#FFFFFF" style={styles.retryText}>
              Retry
            </ThemedText>
          </Pressable>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

export function ToastManager() {
  const toasts = useAppSelector(selectToasts);
  if (toasts.length === 0) return null;

  return (
    <View pointerEvents="box-none" style={styles.container}>
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 24,
    zIndex: 300,
    gap: 8,
  },
  toastWrap: {
    width: '100%',
  },
  toast: {
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  toastText: {
    fontWeight: '600',
  },
  retryButton: {
    alignSelf: 'flex-start',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  retryText: {
    fontWeight: '700',
  },
});
