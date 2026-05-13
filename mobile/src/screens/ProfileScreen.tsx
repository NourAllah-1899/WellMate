import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Image } from 'react-native';
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
  const { isDarkMode, toggleTheme } = useTheme();
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
         <View style={styles.headerTop}>
            <View style={styles.logoContainer}>
              <Image
                source={isDarkMode ? require('../../assets/WellMate_dark.png') : require('../../assets/WellMate_light.png')}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <TouchableOpacity 
                onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')} 
                style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', width: 'auto', paddingHorizontal: 10 }]}
              >
                <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>{language === 'fr' ? 'EN' : 'FR'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
                <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
              </TouchableOpacity>
            </View>
          </View>
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
  header: { marginBottom: 30, marginTop: 30, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoContainer: {},
  logo: { width: 160, height: 60 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
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
