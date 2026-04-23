import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { Colors } from '../constants/Colors';

export default function PhysicalActivityScreen() {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  // Activity Logging State
  const [activityType, setActivityType] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('Medium');
  const [calories, setCalories] = useState('');
  const [loadingActivity, setLoadingActivity] = useState(false);

  // AI Program State
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [loadingProgram, setLoadingProgram] = useState(true);

  // AI Generation Form
  const [objective, setObjective] = useState('');
  const [level, setLevel] = useState('Beginner');
  const [sessions, setSessions] = useState('3');

  useEffect(() => {
    fetchActiveProgram();
  }, []);

  const fetchActiveProgram = async () => {
    try {
      const response = await apiClient.get('/program/active');
      if (response.data.program) {
        setActiveProgram(response.data.program);
      }
    } catch (error: any) {
      if (error.response?.status !== 404) {
        console.log('Error fetching program:', error);
      }
    } finally {
      setLoadingProgram(false);
    }
  };

  const handleLogActivity = async () => {
    if (!activityType || !duration) {
      Alert.alert('Erreur', 'Veuillez saisir le type et la durée.');
      return;
    }
    setLoadingActivity(true);
    try {
      await apiClient.post('/activity', {
        activity_type: activityType,
        duration_minutes: parseInt(duration),
        intensity: intensity,
        calories_burned: calories ? parseInt(calories) : null
      });
      Alert.alert('Succès', 'Activité enregistrée avec succès !');
      setActivityType('');
      setDuration('');
      setCalories('');
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible d\'enregistrer l\'activité.');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleGenerateProgram = async () => {
    setLoadingProgram(true);
    try {
      const response = await apiClient.post('/program/generate', {
        objective: objective || 'General fitness',
        level: level,
        sessionsPerWeek: parseInt(sessions) || 3
      });
      setGeneratedProgram(response.data.program);
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de générer le programme (Erreur OpenAI).');
    } finally {
      setLoadingProgram(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedProgram) return;
    setLoadingProgram(true);
    try {
      await apiClient.post('/program/save', { program: generatedProgram });
      Alert.alert('Succès', 'Voutre nouveau programme est actif !');
      setGeneratedProgram(null);
      fetchActiveProgram();
    } catch (error: any) {
      Alert.alert('Erreur', 'Impossible de sauvegarder.');
    } finally {
      setLoadingProgram(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors.brand.primary }]}>Activité & Sport</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>Suivi physique et Programmes IA</Text>
        </View>

        {/* Section 1: Ajouter une activité */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🏃 Ajouter une activité</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
            placeholder="Type (ex: Running, Yoga)" 
            placeholderTextColor={theme.muted} 
            value={activityType} 
            onChangeText={setActivityType} 
          />
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <TextInput 
              style={[styles.input, {width: '48%', backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
              placeholder="Durée (min)" 
              keyboardType="numeric" 
              placeholderTextColor={theme.muted} 
              value={duration} 
              onChangeText={setDuration} 
            />
            <TextInput 
              style={[styles.input, {width: '48%', backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
              placeholder="Calories (opt.)" 
              keyboardType="numeric" 
              placeholderTextColor={theme.muted} 
              value={calories} 
              onChangeText={setCalories} 
            />
          </View>
          
          <View style={styles.chipContainer}>
            {['Low', 'Medium', 'High'].map(int => (
              <TouchableOpacity key={int} style={[styles.chip, { borderColor: theme.border }, intensity === int && { backgroundColor: Colors.brand.primary, borderColor: Colors.brand.primary }]} onPress={() => setIntensity(int)}>
                <Text style={[styles.chipText, { color: theme.secondaryText }, intensity === int && styles.chipTextActive]}>{int}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.primary }]} onPress={handleLogActivity} disabled={loadingActivity}>
            {loadingActivity ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>

        {/* Section 2: Programme IA */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🤖 Programme Sportif IA</Text>
          
          {loadingProgram ? (
            <ActivityIndicator size="large" color={Colors.brand.action} style={{marginVertical: 20}} />
          ) : activeProgram ? (
            <View>
              <Text style={[styles.programTitle, { color: Colors.brand.action }]}>{activeProgram.program_name}</Text>
              <Text style={[styles.programSub, { color: theme.secondaryText }]}>Niveau: {activeProgram.difficulty_level}</Text>
              <Text style={[styles.programSub, { color: theme.secondaryText }]}>Objectif: {activeProgram.target_objective}</Text>
              
              <View style={styles.exercisesContainer}>
                {activeProgram.exercises.map((dayObj: any, index: number) => (
                  <View key={index} style={[styles.dayCard, { backgroundColor: theme.background }]}>
                    <Text style={[styles.dayText, { color: Colors.brand.primary }]}>{dayObj.day}</Text>
                    {dayObj.activities.map((act: string, i: number) => (
                      <Text key={i} style={[styles.actText, { color: theme.text }]}>• {act}</Text>
                    ))}
                  </View>
                ))}
              </View>
            </View>
          ) : generatedProgram ? (
             <View>
               <Text style={[styles.programTitle, {color: Colors.success}]}>Plan Prévisualisé !</Text>
               <Text style={[styles.programSub, { color: theme.text }]}>{generatedProgram.program_name}</Text>
               <TouchableOpacity style={[styles.button, {backgroundColor: Colors.success, marginTop: 15}]} onPress={handleSaveProgram}>
                 <Text style={styles.buttonText}>Sauvegarder ce programme</Text>
               </TouchableOpacity>
               <TouchableOpacity style={[styles.button, {backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.error, marginTop: 10}]} onPress={() => setGeneratedProgram(null)}>
                 <Text style={{color: Colors.error, fontWeight: 'bold'}}>Annuler</Text>
               </TouchableOpacity>
             </View>
          ) : (
            <View>
              <Text style={[styles.label, { color: theme.muted }]}>Générer un plan avec WellMate IA</Text>
              <TextInput 
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
                placeholder="Votre objectif (ex: Prise de muscle)" 
                placeholderTextColor={theme.muted} 
                value={objective} 
                onChangeText={setObjective} 
              />
              
              <View style={styles.chipContainer}>
                {['Beginner', 'Intermediate', 'Advanced'].map(l => (
                  <TouchableOpacity key={l} style={[styles.chip, { borderColor: theme.border }, level === l && { backgroundColor: Colors.brand.action, borderColor: Colors.brand.action }]} onPress={() => setLevel(l)}>
                    <Text style={[styles.chipText, { color: theme.secondaryText }, level === l && styles.chipTextActive]}>{l}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput 
                style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} 
                placeholder="Séances par semaine (ex: 3)" 
                keyboardType="numeric" 
                placeholderTextColor={theme.muted} 
                value={sessions} 
                onChangeText={setSessions} 
              />

              <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.action, marginTop: 10 }]} onPress={handleGenerateProgram}>
                 <Text style={styles.buttonText}>Générer (OpenAI)</Text>
              </TouchableOpacity>
            </View>
          )}

        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  content: { padding: 20 },
  card: { padding: 24, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: { borderRadius: 12, padding: 15, borderWidth: 1, marginBottom: 15 },
  chipContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 15 },
  chip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 25, borderWidth: 1 },
  chipText: { fontWeight: '600' },
  chipTextActive: { color: '#fff', fontWeight: 'bold' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  label: { marginBottom: 10, fontWeight: '600' },
  programTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  programSub: { fontSize: 14, marginBottom: 4 },
  exercisesContainer: { marginTop: 15 },
  dayCard: { padding: 18, borderRadius: 15, marginBottom: 12 },
  dayText: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  actText: { fontSize: 14, marginLeft: 10, marginBottom: 5, lineHeight: 20 }
});
