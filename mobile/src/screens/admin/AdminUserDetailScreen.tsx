import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';

export default function AdminUserDetailScreen({ route, navigation }: any) {
  const { userId } = route.params;
  const { isDarkMode } = useTheme();
  const { language } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get(`/admin/users/${userId}`)
      .then(res => setData(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [userId]);

  const handleDelete = () => {
    const username = data?.user?.username || '';
    Alert.alert(
      language === 'en' ? 'Delete User' : "Supprimer l'utilisateur",
      language === 'en'
        ? `Are you sure you want to delete "${username}"?`
        : `Êtes-vous sûr de vouloir supprimer "${username}" ?`,
      [
        { text: language === 'en' ? 'Cancel' : 'Annuler', style: 'cancel' },
        {
          text: language === 'en' ? 'Delete' : 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/admin/users/${userId}`);
              navigation.goBack();
            } catch {
              Alert.alert('Error', 'Failed to delete user.');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color="#8b5cf6" style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  if (!data?.user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={{ color: theme.muted, textAlign: 'center', marginTop: 80 }}>
          {language === 'en' ? 'User not found.' : 'Utilisateur introuvable.'}
        </Text>
      </SafeAreaView>
    );
  }

  const { user, stats } = data;

  const infoRows = [
    { label: language === 'en' ? 'Full Name' : 'Nom complet', value: user.full_name || '—' },
    { label: 'Email', value: user.email },
    { label: language === 'en' ? 'Age' : 'Âge', value: user.age ? `${user.age} ans` : '—' },
    { label: language === 'en' ? 'Height' : 'Taille', value: user.height_cm ? `${user.height_cm} cm` : '—' },
    { label: language === 'en' ? 'Weight' : 'Poids', value: user.weight_kg ? `${user.weight_kg} kg` : '—' },
    { label: 'BMI', value: user.bmi ? String(user.bmi) : '—' },
    { label: language === 'en' ? 'Joined' : 'Inscrit le', value: new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : 'fr-FR') },
  ];

  const statCards = [
    { icon: '🍽️', label: language === 'en' ? 'Meals' : 'Repas', value: stats?.totalMeals ?? 0, color: '#10b981' },
    { icon: '🏃', label: language === 'en' ? 'Activities' : 'Activités', value: stats?.totalActivities ?? 0, color: '#f59e0b' },
    { icon: '📅', label: language === 'en' ? 'Events' : 'Événements', value: stats?.totalEvents ?? 0, color: '#3b82f6' },
    { icon: '🚬', label: language === 'en' ? 'Cigarettes' : 'Cigarettes', value: stats?.totalCigarettes ?? 0, color: '#ef4444' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* Avatar + Name */}
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user.username?.charAt(0)?.toUpperCase()}</Text>
          </View>
          <Text style={[styles.username, { color: theme.text }]}>{user.username}</Text>
          <Text style={[styles.emailLabel, { color: theme.muted }]}>{user.email}</Text>
        </View>

        {/* Info Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>
            {language === 'en' ? '👤 Profile Info' : '👤 Infos Profil'}
          </Text>
          {infoRows.map((row, i) => (
            <View key={i} style={[styles.infoRow, { borderBottomColor: theme.border, borderBottomWidth: i < infoRows.length - 1 ? 1 : 0 }]}>
              <Text style={[styles.infoLabel, { color: theme.muted }]}>{row.label}</Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>{row.value}</Text>
            </View>
          ))}
        </View>

        {/* Stats Grid */}
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          {language === 'en' ? '📊 Activity Stats' : '📊 Statistiques'}
        </Text>
        <View style={styles.statsGrid}>
          {statCards.map((s, i) => (
            <View key={i} style={[styles.statCard, { backgroundColor: s.color }]}>
              <Text style={styles.statIcon}>{s.icon}</Text>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* Delete Button */}
        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
          <Feather name="trash-2" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.deleteBtnText}>
            {language === 'en' ? 'Delete User' : "Supprimer l'utilisateur"}
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  profileHeader: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: 'rgba(139,92,246,0.15)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#8b5cf6' },
  username: { fontSize: 22, fontWeight: '900', marginBottom: 4 },
  emailLabel: { fontSize: 13 },
  card: { borderRadius: 20, borderWidth: 1, padding: 16, marginBottom: 20 },
  cardTitle: { fontSize: 16, fontWeight: '800', marginBottom: 14 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 11 },
  infoLabel: { fontSize: 13, fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: '700' },
  sectionTitle: { fontSize: 16, fontWeight: '800', marginBottom: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  statCard: { flex: 1, minWidth: '45%', padding: 14, borderRadius: 16, alignItems: 'center' },
  statIcon: { fontSize: 24, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '900', color: '#fff' },
  statLabel: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 2 },
  deleteBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#ef4444', padding: 16, borderRadius: 14,
  },
  deleteBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
});
