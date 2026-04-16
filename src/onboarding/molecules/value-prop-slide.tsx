import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

type ValuePropSlideProps = {
  title: string;
  description: string;
  emoji: string;
};

export function ValuePropSlide({ title, description, emoji }: ValuePropSlideProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 24,
    gap: 12,
  },
  emoji: {
    fontSize: 36,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#334155',
  },
});
