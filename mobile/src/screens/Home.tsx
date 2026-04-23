import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function HomeScreen({ navigation }: Props) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await apiClient.get('/dashboard');
        setData(response.data.dashboard);
      } catch (error) {
        console.log('Error fetching dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.brand.action} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  const user = data?.user;
  const today = data?.today;
  const goal = data?.goal;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* Updated Header with Logo Image & Toggle */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image
                source={isDarkMode ? require('../../assets/WellMate_dark.png') : require('../../assets/WellMate_light.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
              <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.title, { color: theme.heading }]}>Welcome, {user?.full_name || user?.username || 'User'}! 👋</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Your personal health dashboard</Text>
        </View>

        {/* Profile Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: Colors.brand.primary }]}>💪 Profile Santé</Text>
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { color: theme.muted }]}>Âge</Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>{user?.age || '—'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { color: theme.muted }]}>Taille</Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>{user?.height_cm ? `${user.height_cm} cm` : '—'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { color: theme.muted }]}>Poids</Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>{user?.weight_kg ? `${user.weight_kg} kg` : '—'}</Text>
            </View>
            <View style={styles.gridItem}>
              <Text style={[styles.gridLabel, { color: theme.muted }]}>IMC</Text>
              <Text style={[styles.gridValue, { color: theme.text }]}>{user?.bmi || '—'}</Text>
            </View>
          </View>
        </View>

        {/* Goal Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: Colors.brand.action }]}>🎯 Objectif Poids</Text>
          {goal ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 15 }}>
              <View style={{ backgroundColor: Colors.brand.primary, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6, marginRight: 12 }}>
                <Text style={{ color: '#fff', fontWeight: '900', fontSize: 12 }}>{goal.direction.toUpperCase()}</Text>
              </View>
              <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 24 }}>{goal.target_weight_kg} kg</Text>
            </View>
          ) : (
            <Text style={{ color: theme.muted, marginBottom: 15 }}>Aucun objectif défini.</Text>
          )}
          <TouchableOpacity
            style={[styles.inlineButton, { backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7' }]}
            onPress={() => navigation.navigate('Goals')}
          >
            <Text style={[styles.inlineButtonText, { color: theme.text }]}>{goal ? 'Modifier l\'objectif' : 'Définir un objectif'}</Text>
          </TouchableOpacity>
        </View>

        {/* Calories Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: Colors.brand.accent }]}>🍽️ Calories Aujourd'hui</Text>
          <View style={{ alignItems: 'center', marginVertical: 10 }}>
            <Text style={[styles.bigValue, { color: theme.text }]}>{today?.total_calories || 0}</Text>
            <Text style={[styles.gridLabel, { color: theme.muted }]}>kcal consommées</Text>
          </View>
          <TouchableOpacity
            style={[styles.inlineButton, { backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7' }]}
            onPress={() => navigation.navigate('Meals')}
          >
            <Text style={[styles.inlineButtonText, { color: theme.text }]}>Gestion des Repas</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={[styles.card, { backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 0 }]}>
          <Text style={[styles.cardTitle, { color: Colors.brand.highlight }]}>⚡ Actions Rapides</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.quickButton, { backgroundColor: Colors.brand.primary }]} onPress={() => navigation.navigate('Meals')}>
              <Feather name="plus" size={18} color="#fff" />
              <Text style={styles.quickText}>Repas</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.quickButton, { backgroundColor: Colors.brand.action }]} onPress={() => navigation.navigate('Health', { screen: 'Health' })}>
              <Feather name="heart" size={18} color="#fff" />
              <Text style={styles.quickText}>Santé</Text>
            </TouchableOpacity>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 30, marginTop: 10 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoContainer: {},
  logo: { width: 160, height: 60 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20, letterSpacing: 0.5, textTransform: 'uppercase' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridItem: { width: '45%', marginBottom: 15 },
  gridLabel: { fontSize: 13, marginBottom: 5, fontWeight: '600' },
  gridValue: { fontSize: 18, fontWeight: 'bold' },
  bigValue: { fontSize: 48, fontWeight: '900' },
  inlineButton: { marginTop: 10, padding: 14, borderRadius: 12, alignItems: 'center' },
  inlineButtonText: { fontWeight: 'bold', fontSize: 14 },
  quickButton: { flex: 1, padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  quickText: { color: '#fff', fontWeight: 'bold', fontSize: 14 }
});
