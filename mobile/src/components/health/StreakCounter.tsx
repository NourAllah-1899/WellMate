import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../../context/LanguageContext';

export default function StreakCounter({ streak }: any) {
  const { t } = useLanguage();
  const currentStreak = streak?.currentStreak || 0;
  const bestStreak = streak?.bestStreak || 0;

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View>
          <Text style={styles.label}>{t('health.gamification.currentStreak')}</Text>
          <View style={styles.row}>
            <Text style={styles.current}>{currentStreak}</Text>
            <Text style={styles.days}>{t('health.gamification.days')} 🔥</Text>
          </View>
        </View>
        <View style={styles.rightContent}>
          <Text style={styles.label}>{t('health.gamification.bestStreak')}</Text>
          <Text style={styles.best}>{bestStreak}</Text>
        </View>
      </View>
      <View style={styles.divider} />
      <Text style={styles.subtitle}>📋 {t('health.gamification.streakSubtitle')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 24,
    borderRadius: 20,
    backgroundColor: '#f97316', // fallback
    // We'll use a solid vibrant color instead of gradient since linear-gradient needs expo-linear-gradient
    // Let's use a rich orange-red
  },
  content: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    marginBottom: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  current: {
    fontSize: 48,
    fontWeight: '900',
    color: '#ffffff',
  },
  days: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
  },
  rightContent: {
    alignItems: 'flex-end',
  },
  best: {
    fontSize: 24,
    fontWeight: '900',
    color: '#ffffff',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginTop: 16,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.75)',
    fontWeight: '600',
    lineHeight: 16,
    flexShrink: 1,
  },
});
