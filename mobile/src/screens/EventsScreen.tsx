import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';

export default function EventsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Événements</Text>
        <Text style={styles.subtitle}>En cours de développement...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20, flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#f8fafc', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#94a3b8' },
});
