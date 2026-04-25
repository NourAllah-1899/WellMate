import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('common.error'), 'Veuillez saisir votre email et mot de passe.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        navigation.replace('Home');
      } else {
        Alert.alert(t('common.error'), response.data.message || 'Identifiants invalides.');
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.response?.data?.message || 'Impossible de se connecter.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Theme & Language Toggles */}
      <View style={styles.topRightActions}>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity 
            onPress={() => setLanguage(language === 'fr' ? 'en' : 'fr')} 
            style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0', width: 'auto', paddingHorizontal: 12 }]}
          >
            <Text style={{ color: theme.text, fontWeight: 'bold', fontSize: 12 }}>{language === 'fr' ? 'EN' : 'FR'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
              <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        <View style={styles.logoContainer}>
          <Image
            source={isDarkMode ? require('../../assets/Logo_dark.png') : require('../../assets/Logo_light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('common.login')}</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Email"
          placeholderTextColor={theme.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder={language === 'fr' ? 'Mot de passe' : 'Password'}
          placeholderTextColor={theme.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.action }]} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? t('common.loading') : t('common.login')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Register')} style={{ marginTop: 25 }}>
          <Text style={[styles.linkText, { color: theme.secondaryText }]}>
            {language === 'fr' ? "Pas de compte ?" : "Don't have an account?"} <Text style={{ color: Colors.brand.primary, fontWeight: 'bold' }}>{t('common.register')}</Text>
          </Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRightActions: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 20, right: 20, zIndex: 10 },
  themeBtn: { height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 20 },
  logo: { width: 300, height: 180 }, 
  subtitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 40 },
  input: { borderRadius: 12, padding: 18, marginBottom: 15, borderWidth: 1 },
  button: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { textAlign: 'center', fontSize: 14 }
});
