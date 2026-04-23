import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Image } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function RegisterScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { isDarkMode, toggleTheme } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { email, password, confirmPassword });
      if (response.data.success && response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        Alert.alert('Succès', 'Compte créé avec succès !');
        navigation.replace('Home');
      } else {
        Alert.alert('Erreur', response.data.message || 'Une erreur est survenue.');
      }
    } catch (error: any) {
      Alert.alert('Erreur d\'inscription', error.response?.data?.message || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      
      {/* Theme Toggle Button */}
      <View style={styles.topRightActions}>
        <TouchableOpacity onPress={toggleTheme} style={[styles.themeBtn, { backgroundColor: isDarkMode ? '#1e293b' : '#e2e8f0' }]}>
            <Feather name={isDarkMode ? 'moon' : 'sun'} size={20} color={isDarkMode ? '#fbbf24' : '#f59e0b'} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.content}>
        
        {/* Updated Logo Asset (Icon Only) */}
        <View style={styles.logoContainer}>
          <Image
            source={isDarkMode ? require('../../assets/Logo_dark.png') : require('../../assets/Logo_light.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Rejoignez WellMate aujourd'hui</Text>

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Adresse Email"
          placeholderTextColor={theme.muted}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Mot de passe"
          placeholderTextColor={theme.muted}
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TextInput
          style={[styles.input, { backgroundColor: theme.card, color: theme.text, borderColor: theme.border }]}
          placeholder="Confirmer le mot de passe"
          placeholderTextColor={theme.muted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={[styles.button, { backgroundColor: Colors.brand.primary }, loading && { opacity: 0.7 }]} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Login')} style={{ marginTop: 25 }}>
          <Text style={[styles.linkText, { color: theme.secondaryText }]}>Déjà un compte ? <Text style={{ color: Colors.brand.action, fontWeight: 'bold' }}>Connectez-vous</Text></Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topRightActions: { position: 'absolute', top: Platform.OS === 'ios' ? 60 : 30, right: 20, zIndex: 10 },
  themeBtn: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  content: { flex: 1, justifyContent: 'center', padding: 30 },
  logoContainer: { alignItems: 'center', marginBottom: 10 },
  logo: { width: 300, height: 180 }, 
  subtitle: { fontSize: 16, textAlign: 'center', marginBottom: 30 },
  input: { borderRadius: 12, padding: 18, marginBottom: 15, borderWidth: 1 },
  button: { borderRadius: 12, padding: 18, alignItems: 'center', marginTop: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  linkText: { textAlign: 'center', fontSize: 14 }
});
