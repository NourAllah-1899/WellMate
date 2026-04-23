import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import apiClient from '../api/apiClient';
import { Feather } from '@expo/vector-icons';

export default function MealsScreen() {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);

  const fetchTodayMeals = async () => {
    try {
      const response = await apiClient.get('/meals/today');
      setMeals(response.data.meals || []);
    } catch (error) {
      console.log('Error fetching meals:', error);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const handleAddMeal = async () => {
    if (!description.trim()) {
      Alert.alert('Erreur', 'Veuillez décrire votre repas.');
      return;
    }
    setLoading(true);
    try {
      // Step 1: Estimate calories via AI
      const estimateRes = await apiClient.post('/meals/estimate', { meal_description: description });
      const calories = estimateRes.data.estimated_calories_kcal;
      
      // Step 2: Save meal
      await apiClient.post('/meals', {
        meal_description: description,
        meal_type: 'Other',
        calories: calories
      });

      setDescription('');
      Alert.alert('Succès', `${calories} kcal estimées et enregistrées !`);
      fetchTodayMeals();
    } catch (error: any) {
      console.log('Error adding meal:', error.response?.data || error.message);
      Alert.alert('Erreur', 'Impossible d\'ajouter ou estimer ce repas.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
         <Text style={styles.title}>Repas & Calories</Text>
         <Text style={styles.subtitle}>Supervisé par Intelligence Artificielle</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Ajouter un repas */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ajouter un repas</Text>
          <TextInput
            style={styles.input}
            placeholder="Que venez-vous de manger ? (ex: Salade césar)"
            placeholderTextColor="#94a3b8"
            value={description}
            onChangeText={setDescription}
            multiline
          />
          <TouchableOpacity style={styles.button} onPress={handleAddMeal} disabled={loading}>
            {loading ? <ActivityIndicator color="#0f172a" /> : <Text style={styles.buttonText}>Estimer l'apport & Sauvegarder</Text>}
          </TouchableOpacity>
        </View>

        {/* Repas d'aujourd'hui */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Repas d'aujourd'hui</Text>
          {loadingMeals ? (
             <ActivityIndicator size="small" color="#38bdf8" />
          ) : meals.length === 0 ? (
             <Text style={styles.emptyText}>Aucun repas enregistré aujourd'hui.</Text>
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={styles.mealItem}>
                <View style={styles.mealInfo}>
                  <Text style={styles.mealDescription}>{meal.meal_description}</Text>
                  <Text style={styles.mealType}>{meal.meal_type}</Text>
                </View>
                <Text style={styles.mealCalories}>{meal.calories} kcal</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0f172a' },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#38bdf8', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#94a3b8' },
  content: { padding: 20 },
  card: {
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#f8fafc', marginBottom: 15 },
  input: {
    backgroundColor: '#0f172a',
    color: '#fff',
    borderRadius: 10,
    padding: 15,
    minHeight: 80,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 15,
    textAlignVertical: 'top'
  },
  button: {
    backgroundColor: '#38bdf8',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: { color: '#0f172a', fontSize: 16, fontWeight: 'bold' },
  emptyText: { color: '#94a3b8', fontStyle: 'italic', textAlign: 'center' },
  mealItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#334155'
  },
  mealInfo: { flex: 1, paddingRight: 10 },
  mealDescription: { color: '#f8fafc', fontSize: 16, fontWeight: '500' },
  mealType: { color: '#94a3b8', fontSize: 13, marginTop: 4 },
  mealCalories: { color: '#38bdf8', fontSize: 18, fontWeight: 'bold' }
});
