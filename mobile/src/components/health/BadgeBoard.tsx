import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';

export default function BadgeBoard({ badges }: any) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  if (!badges || badges.length === 0) {
    return (
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.emptyText, { color: theme.muted }]}>{t('health.gamification.noBadges')}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.title, { color: theme.text }]}>🏆 {t('health.gamification.trophiesBoard')}</Text>

      <View style={styles.grid}>
        {badges.map((badge: any) => (
          <View
            key={badge.id}
            style={[
              styles.badgeContainer,
              {
                backgroundColor: badge.earned ? (isDarkMode ? '#312e81' : '#e0e7ff') : (isDarkMode ? '#1e293b' : '#f8fafc'),
                borderColor: badge.earned ? (isDarkMode ? '#4338ca' : '#c7d2fe') : theme.border,
                opacity: badge.earned ? 1 : 0.6,
              }
            ]}
          >
            <Text style={[styles.icon, badge.earned ? {} : { opacity: 0.5 }]}>
              {badge.icon || '🏅'}
            </Text>

            <Text style={[styles.badgeTitle, { color: badge.earned ? theme.text : theme.muted }]} numberOfLines={2}>
              {t(`health.gamification.badges.${badge.code}.title`) || badge.title}
            </Text>

            <Text style={[styles.badgeDesc, { color: theme.secondaryText }]} numberOfLines={2}>
              {t(`health.gamification.badges.${badge.code}.description`) || badge.description}
            </Text>

            {badge.earned && badge.earned_at && (
              <View style={styles.earnedBadge}>
                <Text style={styles.earnedText}>
                  {t('health.gamification.earnedOn')} {new Date(badge.earned_at).toLocaleDateString()}
                </Text>
              </View>
            )}

            {!badge.earned && (
              <View style={styles.lockIcon}>
                <Text style={{ fontSize: 10 }}>🔒</Text>
              </View>
            )}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    width: '48%',
    padding: 15,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 12,
  },
  icon: {
    fontSize: 38,
    marginBottom: 10,
    textAlign: 'center',
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  badgeDesc: {
    fontSize: 11,
    textAlign: 'center',
    marginBottom: 10,
    lineHeight: 15,
  },
  earnedBadge: {
    backgroundColor: 'rgba(99, 102, 241, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 6,
  },
  earnedText: {
    color: '#6366f1',
    fontSize: 9,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  lockIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    opacity: 0.5,
  },
});
