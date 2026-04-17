import { Link } from 'expo-router';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/common/atoms/themed-text';
import { ThemedView } from '@/common/atoms/themed-view';
import { Colors } from '@/common/constants/theme';
import ParallaxScrollView from '@/common/organisms/parallax-scroll-view';
import { useColorScheme } from '@/common/hooks/use-color-scheme';

import { HomeIntroStack } from '../organisms/home-intro-stack';

export default function HomeScreen() {
  const colorScheme = useColorScheme() ?? 'light';

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: Colors.light.accentSoft,
        dark: Colors.dark.headerBackground,
      }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={[styles.reactLogo, { opacity: colorScheme === 'dark' ? 0.85 : 1 }]}
        />
      }>
      <HomeIntroStack />
      <ThemedView style={styles.stepContainer}>
        <Link href="/modal">
          <Link.Trigger>
            <ThemedText type="subtitle">Step 2: Explore</ThemedText>
          </Link.Trigger>
          <Link.Preview />
          <Link.Menu>
            <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
            <Link.MenuAction
              title="Share"
              icon="square.and.arrow.up"
              onPress={() => alert('Share pressed')}
            />
            <Link.Menu title="More" icon="ellipsis">
              <Link.MenuAction
                title="Delete"
                icon="trash"
                destructive
                onPress={() => alert('Delete pressed')}
              />
            </Link.Menu>
          </Link.Menu>
        </Link>

        <ThemedText>
          {`Tap the Explore tab to learn more about what's included in this starter app.`}
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },
});
