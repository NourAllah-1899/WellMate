import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

type Props = {
  navigation: NativeStackNavigationProp<any>;
};

export default function EditProfileScreen({ navigation }: Props) {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await apiClient.get('/auth/me');
      const u = res.data.user;
      setFullName(u.full_name || '');
      setAge(u.age != null ? String(u.age) : '');
      setHeightCm(u.height_cm != null ? String(u.height_cm) : '');
      setWeightKg(u.weight_kg != null ? String(u.weight_kg) : '');
    } catch (e) {
      console.log('Error loading profile:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert(t('common.error'), t('editProfile.nameRequired'));
      return;
    }

    const payload: any = { full_name: fullName.trim() };
    if (age) payload.age = Number(age);
    if (heightCm) payload.height_cm = Number(heightCm);
    if (weightKg) payload.weight_kg = Number(weightKg);

    setSaving(true);
    try {
      await apiClient.put('/auth/profile', payload);
      Alert.alert(t('common.success'), t('editProfile.savedSuccess'), [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (e: any) {
      const msg =
        e?.response?.data?.errors?.[0]?.msg ||
        e?.response?.data?.message ||
        t('common.error');
      Alert.alert(t('common.error'), msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.brand.action} style={{ marginTop: 50 }} />
      </SafeAreaView>
    );
  }

  const inputStyle = [
    styles.input,
    {
      backgroundColor: isDarkMode ? '#1a2332' : '#f7fafc',
      color: theme.text,
      borderColor: theme.border,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.heading }]}>{t('editProfile.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
              {t('editProfile.subtitle')}
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>

            {/* Full Name */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Feather name="user" size={14} color={theme.muted} style={styles.labelIcon} />
                <Text style={[styles.label, { color: theme.muted }]}>{t('editProfile.fullName')}</Text>
              </View>
              <TextInput
                style={inputStyle}
                value={fullName}
                onChangeText={setFullName}
                placeholder={t('editProfile.fullNamePlaceholder')}
                placeholderTextColor={theme.muted}
                autoCapitalize="words"
              />
            </View>

            {/* Age */}
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Feather name="calendar" size={14} color={theme.muted} style={styles.labelIcon} />
                <Text style={[styles.label, { color: theme.muted }]}>{t('editProfile.age')}</Text>
              </View>
              <TextInput
                style={inputStyle}
                value={age}
                onChangeText={setAge}
                placeholder={t('editProfile.agePlaceholder')}
                placeholderTextColor={theme.muted}
                keyboardType="numeric"
              />
            </View>

            {/* Height & Weight side by side */}
            <View style={styles.row2}>
              <View style={[styles.fieldGroup, { flex: 1, marginRight: 8 }]}>
                <View style={styles.labelRow}>
                  <Feather name="trending-up" size={14} color={theme.muted} style={styles.labelIcon} />
                  <Text style={[styles.label, { color: theme.muted }]}>{t('editProfile.height')}</Text>
                </View>
                <TextInput
                  style={inputStyle}
                  value={heightCm}
                  onChangeText={setHeightCm}
                  placeholder="cm"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                />
              </View>

              <View style={[styles.fieldGroup, { flex: 1, marginLeft: 8 }]}>
                <View style={styles.labelRow}>
                  <Feather name="activity" size={14} color={theme.muted} style={styles.labelIcon} />
                  <Text style={[styles.label, { color: theme.muted }]}>{t('editProfile.weight')}</Text>
                </View>
                <TextInput
                  style={inputStyle}
                  value={weightKg}
                  onChangeText={setWeightKg}
                  placeholder="kg"
                  placeholderTextColor={theme.muted}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
          >
            {saving ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <>
                <Feather name="check-circle" size={18} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: theme.border }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.75}
          >
            <Text style={[styles.cancelText, { color: theme.muted }]}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24 },
  title: { fontSize: 26, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14 },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    marginBottom: 20,
    gap: 4,
  },
  fieldGroup: { marginBottom: 16 },
  labelRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  labelIcon: { marginRight: 6 },
  label: { fontSize: 13, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '500',
  },
  row2: { flexDirection: 'row' },
  saveButton: {
    backgroundColor: Colors.brand.primary,
    borderRadius: 14,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: Colors.brand.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelText: { fontWeight: '600', fontSize: 15 },
});
