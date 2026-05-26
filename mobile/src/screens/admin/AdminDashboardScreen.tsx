import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions, Image } from 'react-native';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AdminHeader from '../../components/admin/AdminHeader';

const activityImages: Record<string, any> = {
  running: require('../../../assets/events/Running.png'),
  walking: require('../../../assets/events/Walking.png'),
  cycling: require('../../../assets/events/Cycling.png'),
  yoga: require('../../../assets/events/Yoga.png'),
  basketball: require('../../../assets/events/Basketball.png'),
  swimming: require('../../../assets/events/Swimming.png'),
  fitness: require('../../../assets/events/Fitness.png'),
  football: require('../../../assets/events/Football.png'),
  other: require('../../../assets/events/Running.png'),
};

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen() {
  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const navigation = useNavigation<any>();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [stats, setStats] = useState<any>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, usersRes, eventsRes] = await Promise.all([
          apiClient.get('/admin/stats'),
          apiClient.get('/admin/users?limit=5&sort=created_at&order=DESC'),
          apiClient.get('/admin/events?limit=5&sort=created_at&order=DESC'),
        ]);
        setStats(statsRes.data.stats);
        setRecentUsers((usersRes.data.users || []).filter((u: any) => u?.email !== 'admin@wellmate.com'));
        setRecentEvents(eventsRes.data.events);
      } catch (err) {
        console.error('Failed to fetch admin data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8b5cf6" />
        </View>
      </SafeAreaView>
    );
  }

  const statCards = [
    { label: language === 'en' ? 'Total Users' : 'Total Utilisateurs', value: stats?.totalUsers || 0, icon: '👥', color: '#8b5cf6', change: `+${stats?.newUsersThisWeek || 0}` },
    { label: language === 'en' ? 'Total Events' : 'Total Événements', value: stats?.totalEvents || 0, icon: '📅', color: '#3b82f6', change: `+${stats?.newEventsThisWeek || 0}` },
    { label: language === 'en' ? 'Total Meals' : 'Total Repas', value: stats?.totalMeals || 0, icon: '🍽️', color: '#10b981', change: '' },
    { label: language === 'en' ? 'Total Activities' : 'Total Activités', value: stats?.totalActivities || 0, icon: '🏃', color: '#f59e0b', change: '' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <AdminHeader
        title={language === 'en' ? 'Admin Dashboard' : 'Tableau de bord Admin'}
        subtitle={language === 'en' ? 'WellMate Platform Overview' : "Vue d'ensemble de la plateforme"}
      />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          {statCards.map((card, idx) => (
            <View key={idx} style={[styles.statCard, { backgroundColor: card.color }]}>
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>{card.icon}</Text>
                {!!card.change && (
                  <View style={styles.statBadge}>
                    <Text style={styles.statBadgeText}>{card.change}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.statValue}>{card.value}</Text>
              <Text style={styles.statLabel}>{card.label}</Text>
            </View>
          ))}
        </View>

        {/* Recent Users */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>👥 {language === 'en' ? 'Recent Users' : 'Derniers Utilisateurs'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminUsers')}>
              <Text style={styles.viewAllBtn}>{language === 'en' ? 'View All' : 'Voir tout'} →</Text>
            </TouchableOpacity>
          </View>
          
          {recentUsers.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.muted }]}>{language === 'en' ? 'No users found.' : 'Aucun utilisateur trouvé.'}</Text>
          ) : (
            <View style={styles.list}>
              {recentUsers.map((user) => (
                <View key={user.id} style={[styles.listItem, { borderColor: theme.border }]}>
                  <View style={styles.listItemLeft}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{user.username?.charAt(0)?.toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={[styles.itemTitle, { color: theme.text }]}>{user.username}</Text>
                      <Text style={[styles.itemSub, { color: theme.muted }]}>{user.email}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Recent Events */}
        <View style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>📅 {language === 'en' ? 'Recent Events' : 'Derniers Événements'}</Text>
            <TouchableOpacity onPress={() => navigation.navigate('AdminEvents')}>
              <Text style={styles.viewAllBtn}>{language === 'en' ? 'View All' : 'Voir tout'} →</Text>
            </TouchableOpacity>
          </View>

          {recentEvents.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.muted }]}>{language === 'en' ? 'No events found.' : 'Aucun événement trouvé.'}</Text>
          ) : (
            <View style={styles.list}>
              {recentEvents.map((evt) => (
                <View key={evt.id} style={[styles.listItem, { borderColor: theme.border }]}>
                  <View style={styles.listItemLeft}>
                    <View style={styles.eventAvatar}>
                      <Image
                        source={activityImages[evt.activity_type?.toLowerCase()] || activityImages.other}
                        style={styles.eventAvatarImg}
                      />
                    </View>
                    <View>
                      <Text style={[styles.itemTitle, { color: theme.text }]} numberOfLines={1}>{evt.title}</Text>
                      <Text style={[styles.itemSub, { color: theme.muted }]}>{new Date(evt.date).toLocaleDateString()}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  statCard: { width: (width - 50) / 2, padding: 15, borderRadius: 20, overflow: 'hidden' },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statIcon: { fontSize: 24 },
  statBadge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  statBadgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  statValue: { fontSize: 28, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 12, fontWeight: 'bold', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  sectionCard: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAllBtn: { fontSize: 12, fontWeight: 'bold', color: '#8b5cf6' },
  emptyText: { fontStyle: 'italic', fontSize: 13 },
  list: { gap: 10 },
  listItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 12, borderRadius: 16, borderWidth: 1 },
  listItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(139,92,246,0.1)', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 16, fontWeight: 'bold', color: '#8b5cf6' },
  eventAvatar: { width: 40, height: 40, borderRadius: 12, overflow: 'hidden' },
  eventAvatarImg: { width: 40, height: 40 },
  itemTitle: { fontSize: 14, fontWeight: 'bold' },
  itemSub: { fontSize: 12, marginTop: 2 },
});
