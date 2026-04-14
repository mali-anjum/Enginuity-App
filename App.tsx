import { ExpoRoot } from 'expo-router';

const context = require.context('./src/app');

export default function App() {
  return <ExpoRoot context={context} />;
}
