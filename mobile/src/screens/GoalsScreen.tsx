import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';

export default function GoalsScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeGoal, setActiveGoal] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // States for generation
  const [direction, setDirection] = useState('lose');
  const [targetWeight, setTargetWeight] = useState('');
  const [recommendation, setRecommendation] = useState<any>(null);

  useEffect(() => {
    fetchActiveGoal();
  }, []);

  const fetchActiveGoal = async () => {
    try {
      const res = await apiClient.get('/goals/active');
      if (res.data.goal) setActiveGoal(res.data.goal);
    } catch (e) {
      console.log('Error fetching goal:', e);
    } finally {
      setLoading(false);
    }
  };

  const generateGoal = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/goals/recommendation');
      setRecommendation(res.data.recommendation);
      setDirection(res.data.recommendation.direction);
      setTargetWeight(res.data.recommendation.suggestedTargetWeightKg.toString());
    } catch (e: any) {
      Alert.alert(t('common.error'), e.response?.data?.message || 'Impossible de générer la recommandation (Renseignez votre taille/poids dans Profil).');
    } finally {
      setLoading(false);
    }
  };

  const saveGoal = async () => {
    setLoading(true);
    try {
      await apiClient.post('/goals', {
        direction: direction,
        targetWeightKg: parseFloat(targetWeight),
        aiSummary: recommendation?.explanation || ''
      });
      Alert.alert(t('common.success'), t('common.success'));
      setRecommendation(null);
      fetchActiveGoal();
    } catch (e) {
      Alert.alert(t('common.error'), 'Impossible d\'enregistrer l\'objectif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t('goals.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('goals.subtitle')}</Text>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color={Colors.brand.action} style={{ marginTop: 50 }} />
        ) : activeGoal ? (
           <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <Text style={[styles.cardTitle, { color: Colors.brand.primary }]}>🎯 {t('goals.activeGoal')}</Text>
             <View style={styles.goalDisplay}>
                <Text style={styles.goalDirection}>{activeGoal.direction.toUpperCase()}</Text>
                <Text style={[styles.goalTarget, { color: theme.text }]}>{activeGoal.target_weight_kg} kg</Text>
             </View>
             <Text style={[styles.summary, { color: theme.secondaryText }]}>{activeGoal.ai_summary || '...'}</Text>

             <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.primary, marginTop: 20 }]} onPress={() => setActiveGoal(null)}>
                <Text style={styles.buttonText}>{t('goals.newGoal')}</Text>
             </TouchableOpacity>
           </View>
        ) : recommendation ? (
           <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
             <Text style={[styles.cardTitle, { color: Colors.success }]}>{t('goals.recommendation')}</Text>
             <Text style={[styles.summary, { color: theme.text }]}>{recommendation.explanation}</Text>
             
             <View style={{ marginTop: 20 }}>
               <Text style={[styles.label, { color: theme.muted }]}>{t('goals.targetWeight')}</Text>
               <TextInput 
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
                value={targetWeight} 
                onChangeText={setTargetWeight} 
                keyboardType="numeric" 
              />
             </View>
             
             <TouchableOpacity style={[styles.button, { backgroundColor: Colors.success }]} onPress={saveGoal}>
                <Text style={styles.buttonText}>{t('goals.confirm')}</Text>
             </TouchableOpacity>
           </View>
        ) : (
           <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: Colors.brand.action }]}>{t('goals.noGoal')}</Text>
              <Text style={[styles.subtitle, { color: theme.secondaryText, marginBottom: 20 }]}>{t('goals.calculate')}</Text>
              <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.action }]} onPress={generateGoal}>
                 <Text style={styles.buttonText}>{t('goals.calculate')}</Text>
              </TouchableOpacity>
           </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  goalDisplay: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  goalDirection: { backgroundColor: Colors.brand.primary, color: '#fff', fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 15 },
  goalTarget: { fontSize: 24, fontWeight: 'bold' },
  summary: { fontSize: 15, fontStyle: 'italic', marginBottom: 15, lineHeight: 22 },
  label: { marginBottom: 8, fontWeight: '600' },
  input: { borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 15 },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
