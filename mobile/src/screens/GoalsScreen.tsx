import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import apiClient from '../api/apiClient';

export default function GoalsScreen() {
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
      Alert.alert('Erreur', e.response?.data?.message || 'Impossible de générer la recommandation (Renseignez votre taille/poids dans Profil).');
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
      Alert.alert('Succès', 'Objectif enregistré !');
      setRecommendation(null);
      fetchActiveGoal();
    } catch (e) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'objectif.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Objectif de Poids</Text>
          <Text style={styles.subtitle}>Supervisé par l'IA Gemini</Text>
        </View>

        {loading ? (
           <ActivityIndicator size="large" color="#38bdf8" />
        ) : activeGoal ? (
           <View style={styles.card}>
             <Text style={styles.cardTitle}>🎯 Objectif Actif</Text>
             <View style={styles.goalDisplay}>
                <Text style={styles.goalDirection}>{activeGoal.direction.toUpperCase()}</Text>
                <Text style={styles.goalTarget}>{activeGoal.target_weight_kg} kg</Text>
             </View>
             <Text style={styles.summary}>{activeGoal.ai_summary || 'En chemin vers votre but !'}</Text>

             <TouchableOpacity style={[styles.button, {marginTop: 20}]} onPress={() => setActiveGoal(null)}>
                <Text style={styles.buttonText}>Définir un nouvel objectif</Text>
             </TouchableOpacity>
           </View>
        ) : recommendation ? (
           <View style={styles.card}>
             <Text style={[styles.cardTitle, {color: '#10b981'}]}>Recommandation IA</Text>
             <Text style={styles.summary}>{recommendation.explanation}</Text>
             
             <Text style={styles.label}>Poids Visé (kg)</Text>
             <TextInput style={styles.input} value={targetWeight} onChangeText={setTargetWeight} keyboardType="numeric" />
             
             <TouchableOpacity style={[styles.button, {backgroundColor: '#10b981'}]} onPress={saveGoal}>
                <Text style={styles.buttonText}>Confirmer & Sauvegarder</Text>
             </TouchableOpacity>
           </View>
        ) : (
           <View style={styles.card}>
              <Text style={styles.cardTitle}>Aucun objectif défini.</Text>
              <Text style={styles.subtitle}>Obtenez une recommandation sur-mesure pour définir votre poids idéal intelligemment.</Text>
              <TouchableOpacity style={[styles.button, {marginTop: 20}]} onPress={generateGoal}>
                 <Text style={styles.buttonText}>Calculer avec l'IA</Text>
              </TouchableOpacity>
           </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  content: { padding: 20 },
  header: { marginBottom: 30 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#f8fafc', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#94a3b8' },
  card: { backgroundColor: '#1e293b', padding: 20, borderRadius: 15, borderWidth: 1, borderColor: '#334155' },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#38bdf8', marginBottom: 15 },
  goalDisplay: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  goalDirection: { backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginRight: 15 },
  goalTarget: { fontSize: 24, color: '#f8fafc', fontWeight: 'bold' },
  summary: { color: '#cbd5e1', fontSize: 15, fontStyle: 'italic', marginBottom: 15 },
  label: { color: '#94a3b8', marginBottom: 5 },
  input: { backgroundColor: '#0f172a', color: '#fff', borderRadius: 10, padding: 15, borderWidth: 1, borderColor: '#334155', marginBottom: 15 },
  button: { backgroundColor: '#38bdf8', borderRadius: 10, padding: 15, alignItems: 'center' },
  buttonText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
});
