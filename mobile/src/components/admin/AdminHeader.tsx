import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';

interface Props {
  title: string;
  subtitle?: string;
}

const logoLight = require('../../../assets/WellMate_light.png');
const logoDark  = require('../../../assets/WellMate_dark.png');

export default function AdminHeader({ title, subtitle }: Props) {
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;
  const navigation = useNavigation<any>();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('token');
    navigation.getParent()?.replace('Login');
  };

  return (
    <View style={[styles.header, { backgroundColor: theme.background }]}>
      <View style={styles.headerTop}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Image
            source={isDarkMode ? logoDark : logoLight}
            style={styles.logo}
            resizeMode="contain"
          />
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>ADMIN</Text>
          </View>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')}
            style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', width: 'auto', paddingHorizontal: 12 }]}
          >
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>
              {language === 'fr' ? 'EN' : 'FR'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
            <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleLogout} style={[styles.themeBtn, { backgroundColor: 'rgba(239,68,68,0.1)' }]}>
            <Feather name="log-out" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      {subtitle ? <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: { marginBottom: 10, marginTop: 30, paddingHorizontal: 20 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logo: { width: 160, height: 60 },
  themeBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  adminBadge: { backgroundColor: '#8b5cf6', paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  adminBadgeText: { color: '#fff', fontSize: 9, fontWeight: '900', letterSpacing: 1.5 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
});
