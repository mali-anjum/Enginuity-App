import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ScreenContainer } from '@/common/molecules/screen-container';
import { ROUTES } from '@/sharedModules/navigation/routes';

export default function ModalScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <ThemedText type="title">This is a modal</ThemedText>
      <Link href={ROUTES.HOME} dismissTo style={styles.link}>
        <ThemedText type="link">Go to home screen</ThemedText>
      </Link>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
