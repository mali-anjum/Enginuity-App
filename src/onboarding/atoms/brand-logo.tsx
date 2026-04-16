import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function BrandLogo() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enginuity</Text>
      <Text style={styles.subtitle}>Engineer your career with clarity</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 40,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#475569',
  },
});
