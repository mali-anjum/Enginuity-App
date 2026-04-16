import { StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';

type AuthSubtitleProps = {
  children: string;
};

export function AuthSubtitle({ children }: AuthSubtitleProps) {
  return <ThemedText style={styles.subtitle}>{children}</ThemedText>;
}

const styles = StyleSheet.create({
  subtitle: {
    fontSize: 16,
  },
});
