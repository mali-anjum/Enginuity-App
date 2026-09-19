import React from 'react';
import { View } from 'react-native';

// react-native-webview needs a native module that isn't present under Jest;
// screens only need something renderable in its place for smoke tests.
export function WebView(props: Record<string, unknown>) {
  return <View testID="mock-webview" {...props} />;
}

export default WebView;
