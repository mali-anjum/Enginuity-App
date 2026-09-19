import { StyleSheet } from 'react-native';

import { ScreenContainer } from '@/common/molecules/screen-container';

import { LoginPanel } from '../organisms/login-panel';

export default function LoginEmailScreen() {
  return (
    <ScreenContainer style={styles.container}>
      <LoginPanel />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
  },
});
