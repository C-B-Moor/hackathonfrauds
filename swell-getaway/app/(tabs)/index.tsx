import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function HomeTab() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Swell Demo Home</Text>
      <Text style={styles.subtitle}>
        Use the Getaway tab below to open the new feature.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F6F3EE',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#123B5D',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#47657F',
    textAlign: 'center',
  },
});
