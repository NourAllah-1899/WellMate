import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/me');
      setUser(response.data.user);
    } catch (error) {
      console.log('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.replace('Login');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.brand.action} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
       <View style={styles.header}>
         <Text style={[styles.title, { color: theme.heading }]}>Mon Profil</Text>
         <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Gérez vos données personnelles</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>Nom complet:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.full_name || 'Non renseigné'}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>Email:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.email}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>Poids:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.weight_kg ? `${user.weight_kg} kg` : '--'}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>Taille:</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.height_cm ? `${user.height_cm} cm` : '--'}</Text>
            </View>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: isDarkMode ? '#2d3748' : '#edf2f7' }]}>
                <Text style={[styles.editButtonText, { color: theme.text }]}>Modifier le profil (Web uniquement)</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: Colors.error }]} 
          onPress={handleLogout}
        >
          <Text style={[styles.logoutText, { color: Colors.error }]}>Se déconnecter</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  content: { padding: 20 },
  card: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  label: { fontSize: 16, fontWeight: '500' },
  value: { fontSize: 16, fontWeight: '700' },
  editButton: { marginTop: 25, padding: 14, borderRadius: 12, alignItems: 'center' },
  editButtonText: { fontSize: 14, fontWeight: '600' },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  logoutText: { fontWeight: 'bold', fontSize: 16 }
});
