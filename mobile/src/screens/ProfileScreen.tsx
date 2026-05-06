import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function ProfileScreen({ navigation }: Props) {
  const { isDarkMode } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchProfile);
    return unsubscribe;
  }, [navigation]);

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
         <Text style={[styles.title, { color: theme.heading }]}>{t('profile.title')}</Text>
         <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('profile.subtitle')}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>{t('profile.fullName')}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.full_name || '—'}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>{t('profile.email')}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.email}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>{t('profile.weight')}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.weight_kg ? `${user.weight_kg} kg` : '--'}</Text>
            </View>
            <View style={[styles.row, { borderBottomColor: theme.border }]}>
                <Text style={[styles.label, { color: theme.muted }]}>{t('profile.height')}</Text>
                <Text style={[styles.value, { color: theme.text }]}>{user?.height_cm ? `${user.height_cm} cm` : '--'}</Text>
            </View>
            
            {/* Language Switcher in Profile */}
            <View style={[styles.row, { borderBottomColor: 'transparent', marginTop: 10 }]}>
                <Text style={[styles.label, { color: theme.muted }]}>{t('common.language')}</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity 
                    onPress={() => setLanguage('fr')} 
                    style={[styles.langBtn, language === 'fr' && { backgroundColor: Colors.brand.primary }]}
                  >
                    <Text style={[styles.langBtnText, { color: language === 'fr' ? '#fff' : theme.text }]}>FR</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setLanguage('en')} 
                    style={[styles.langBtn, language === 'en' && { backgroundColor: Colors.brand.primary }]}
                  >
                    <Text style={[styles.langBtnText, { color: language === 'en' ? '#fff' : theme.text }]}>EN</Text>
                  </TouchableOpacity>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.editButton, { backgroundColor: Colors.brand.primary }]}
                onPress={() => navigation.navigate('EditProfile')}
                activeOpacity={0.85}
            >
                <Feather name="edit-2" size={15} color="#fff" style={{ marginRight: 8 }} />
                <Text style={[styles.editButtonText, { color: '#fff' }]}>{t('profile.edit')}</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.logoutButton, { borderColor: Colors.error }]} 
          onPress={handleLogout}
        >
          <Feather name="log-out" size={18} color={Colors.error} style={{ marginRight: 8 }} />
          <Text style={[styles.logoutText, { color: Colors.error }]}>{t('profile.logout')}</Text>
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
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, alignItems: 'center' },
  label: { fontSize: 14, fontWeight: '500' },
  value: { fontSize: 15, fontWeight: '700' },
  langBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, borderColor: Colors.brand.primary },
  langBtnText: { fontWeight: 'bold', fontSize: 12 },
  editButton: { marginTop: 25, padding: 14, borderRadius: 12, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  editButtonText: { fontSize: 13, fontWeight: '600' },
  logoutButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  logoutText: { fontWeight: 'bold', fontSize: 16 }
});
