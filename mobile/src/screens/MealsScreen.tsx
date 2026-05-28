import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image } from 'react-native';
import apiClient from '../api/apiClient';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import MealPlanGenerator from '../components/meals/MealPlanGenerator';

export default function MealsScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMeals, setLoadingMeals] = useState(true);
  const [meals, setMeals] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);

  // AI Estimate state
  const [estimate, setEstimate] = useState<any>(null);

  const [historyMeals, setHistoryMeals] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'log' | 'plan'>('log');
  const [editingMealId, setEditingMealId] = useState<number | null>(null);

  const fetchTodayMeals = async () => {
    try {
      const response = await apiClient.get('/meals/today');
      setMeals(response.data.meals || []);
      setTotalCalories(response.data.total_calories || 0);

      // Also fetch history
      const historyRes = await apiClient.get('/meals/history');
      const todayIds = new Set((response.data.meals || []).map((m: any) => m.id));
      const historyFiltered = (historyRes.data.meals || []).filter((m: any) => !todayIds.has(m.id));
      setHistoryMeals(historyFiltered);
    } catch (error) {
      console.log('Error fetching meals:', error);
    } finally {
      setLoadingMeals(false);
    }
  };

  useEffect(() => {
    fetchTodayMeals();
  }, []);

  const handleEstimate = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('meals.placeholder'));
      return;
    }
    setLoading(true);
    setEstimate(null);
    try {
      const response = await apiClient.post('/meals/estimate', { description });
      setEstimate(response.data.estimate);
    } catch (error: any) {
      console.log('Error estimating meal:', error.response?.data || error.message);
      Alert.alert(t('common.error'), 'Impossible d\'estimer ce repas.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveMeal = async () => {
    if (!description.trim()) {
      Alert.alert(t('common.error'), t('meals.placeholder'));
      return;
    }

    setLoading(true);
    try {
      const payload: any = {
        description: description,
        estimatedCalories: estimate ? estimate.totalCalories : null,
        eatenAt: new Date().toISOString()
      };

      if (editingMealId) {
        await apiClient.put(`/meals/${editingMealId}`, payload);
        setEditingMealId(null);
      } else {
        await apiClient.post('/meals', payload);
      }

      setDescription('');
      setEstimate(null);
      Alert.alert(t('meals.saveSuccess'), '');
      fetchTodayMeals();
    } catch (error: any) {
      console.log('Error adding meal:', error.response?.data || error.message);
      Alert.alert(t('common.error'), 'Impossible d\'ajouter ce repas.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMeal = (meal: any) => {
    setEditingMealId(meal.id);
    setDescription(meal.description);
    setEstimate(null);
  };

  const handleCancelEdit = () => {
    setEditingMealId(null);
    setDescription('');
    setEstimate(null);
  };

  const handleDeleteMeal = (id: number) => {
    Alert.alert(
      t('common.confirm') || 'Confirmer',
      t('meals.confirmDelete') || 'Voulez-vous vraiment supprimer ce repas ?',
      [
        { text: t('common.cancel') || 'Annuler', style: 'cancel' },
        {
          text: t('common.delete') || 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/meals/${id}`);
              fetchTodayMeals();
            } catch (error: any) {
              Alert.alert(t('common.error'), 'Impossible de supprimer ce repas.');
            }
          }
        }
      ]
    );
  };

  const renderBreakdown = (breakdownJson: any) => {
    if (!breakdownJson) return null;
    let data = breakdownJson;
    if (typeof breakdownJson === 'string') {
      try {
        data = JSON.parse(breakdownJson);
      } catch (e) {
        return null;
      }
    }

    if (!data.items || !Array.isArray(data.items)) return null;

    return (
      <View style={styles.breakdownContainer}>
        {data.items.map((item: any, index: number) => (
          <View key={index} style={styles.breakdownItem}>
            <Text style={[styles.breakdownName, { color: theme.text }]}>{item.name}</Text>
            <Text style={[styles.breakdownDetail, { color: theme.muted }]}>{item.quantity} • {item.calories} kcal</Text>
          </View>
        ))}
        {data.assumptions && (
          <Text style={[styles.assumptions, { color: theme.muted }]}>Note: {data.assumptions}</Text>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors.brand.accent }]}>{t('meals.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('meals.subtitle')}</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'log' ? { backgroundColor: Colors.brand.accent, borderColor: Colors.brand.accent } : { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => setActiveTab('log')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'log' ? '#fff' : theme.text }]}>🍽️ {t('meals.title')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'plan' ? { backgroundColor: Colors.brand.accent, borderColor: Colors.brand.accent } : { backgroundColor: theme.background, borderColor: theme.border }]}
          onPress={() => setActiveTab('plan')}
        >
          <Text style={[styles.tabText, { color: activeTab === 'plan' ? '#fff' : theme.text }]}>🤖 Plan IA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'plan' ? (
          <MealPlanGenerator />
        ) : (
          <>
            {/* Ajouter un repas */}
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>{editingMealId ? '✏️ Modifier le repas' : '🍽️ ' + t('meals.addMeal')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder={t('meals.placeholder')}
            placeholderTextColor={theme.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          {/* AI Estimate View */}
          {estimate && (
            <View style={[styles.estimateBox, { backgroundColor: theme.background, borderColor: Colors.brand.accent }]}>
              <Text style={[styles.estimateTitle, { color: Colors.brand.accent }]}>{t('meals.estimatedCalories')}</Text>
              <Text style={[styles.estimateValue, { color: theme.text }]}>{estimate.totalCalories} kcal</Text>
              {(estimate.protein_g || estimate.carbs_g || estimate.fat_g) ? (
                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {[
                    { label: t('meals.protein'), value: estimate.protein_g || 0, tint: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', text: '#3b82f6' },
                    { label: t('meals.carbs'), value: estimate.carbs_g || 0, tint: isDarkMode ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)', text: '#d97706' },
                    { label: t('meals.fat'), value: estimate.fat_g || 0, tint: isDarkMode ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.08)', text: '#db2777' },
                  ].map((m, i) => (
                    <View key={i} style={{ flex: 1, padding: 8, borderRadius: 10, alignItems: 'center', backgroundColor: m.tint }}>
                      <Text style={{ fontSize: 14, fontWeight: '900', color: m.text }}>{m.value}g</Text>
                      <Text style={{ fontSize: 9, fontWeight: 'bold', color: m.text, opacity: 0.7 }}>{m.label}</Text>
                    </View>
                  ))}
                </View>
              ) : null}
              {renderBreakdown(estimate)}
            </View>
          )}

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)', borderWidth: 1, borderColor: Colors.brand.accent }]}
              onPress={handleEstimate}
              disabled={loading}
            >
              <Text style={[styles.actionButtonText, { color: Colors.brand.accent }]}>⚡ {t('meals.estimate')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: Colors.brand.accent }]}
              onPress={handleSaveMeal}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.actionButtonText}>{editingMealId ? '💾 ' + (t('meals.update') || 'Mettre à jour') : '💾 ' + t('meals.save')}</Text>}
            </TouchableOpacity>
          </View>
          {editingMealId && (
            <TouchableOpacity onPress={handleCancelEdit} style={{ marginTop: 10, alignSelf: 'center' }}>
              <Text style={{ color: theme.muted, fontWeight: 'bold' }}>❌ {t('common.cancel') || 'Annuler'}</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Aujourd'hui Summary */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={[styles.summaryTitle, { color: theme.text }]}>{t('meals.today')}</Text>
            <View style={[styles.badge, { backgroundColor: Colors.brand.accent }]}>
              <Text style={styles.badgeText}>{totalCalories} kcal</Text>
            </View>
          </View>
        </View>

        {/* Repas d'aujourd'hui */}
        <View style={{ gap: 15 }}>
          {loadingMeals ? (
            <ActivityIndicator size="large" color={Colors.brand.accent} style={{ marginTop: 20 }} />
          ) : meals.length === 0 ? (
            <Text style={[styles.emptyText, { color: theme.muted }]}>{t('meals.noMeals')}</Text>
          ) : (
            meals.map((meal) => (
              <View key={meal.id} style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.border, borderLeftWidth: 3, borderLeftColor: Colors.brand.accent }]}>
                <View style={styles.mealHeader}>
                  <View style={styles.mealInfo}>
                    <Text style={[styles.mealDescription, { color: theme.text }]}>{meal.description}</Text>
                    <Text style={[styles.mealDate, { color: theme.muted }]}>
                      {new Date(meal.eaten_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <View style={[styles.calBadge, { backgroundColor: isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)' }]}>
                      <Text style={[styles.mealCalories, { color: Colors.brand.accent }]}>{meal.estimated_calories} kcal</Text>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 6, marginTop: 8 }}>
                      <TouchableOpacity onPress={() => handleEditMeal(meal)} style={[styles.textBtn, { backgroundColor: theme.background, borderColor: theme.border }]}>
                        <Text style={{ color: Colors.brand.accent, fontWeight: 'bold', fontSize: 12 }}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteMeal(meal.id)} style={[styles.textBtn, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.06)', borderColor: isDarkMode ? 'rgba(239,68,68,0.25)' : 'rgba(239,68,68,0.2)' }]}>
                        <Text style={{ color: '#ef4444', fontWeight: 'bold', fontSize: 12 }}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {meal.breakdown_json && (
                  <View style={{ marginTop: 10, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 10 }}>
                    <Text style={[styles.breakdownLabel, { color: theme.muted }]}>{t('meals.breakdown')}</Text>
                    {renderBreakdown(meal.breakdown_json)}
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Historique */}
        {historyMeals.length > 0 && (
          <View style={{ marginTop: 25 }}>
            <Text style={[styles.summaryTitle, { color: theme.text, marginBottom: 15 }]}>{t('meals.history')}</Text>
            <View style={{ gap: 15 }}>
              {historyMeals.map((meal) => (
                <View key={meal.id} style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.border, opacity: 0.85, borderLeftWidth: 3, borderLeftColor: Colors.brand.accent }]}>
                  <View style={styles.mealHeader}>
                    <View style={styles.mealInfo}>
                      <Text style={[styles.mealDescription, { color: theme.text }]}>{meal.description}</Text>
                      <Text style={[styles.mealDate, { color: theme.muted }]}>
                        {new Date(meal.eaten_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <View style={[styles.calBadge, { backgroundColor: isDarkMode ? 'rgba(124,58,237,0.1)' : 'rgba(124,58,237,0.06)' }]}>
                        <Text style={[styles.mealCalories, { color: Colors.brand.accent }]}>{meal.estimated_calories} kcal</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 5 },
  subtitle: { fontSize: 16 },
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, gap: 10, marginBottom: 5 },
  tabButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 14 },
  content: { padding: 16 },
  card: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  input: {
    borderRadius: 12,
    padding: 15,
    minHeight: 100,
    borderWidth: 1,
    marginBottom: 15,
    textAlignVertical: 'top',
    fontSize: 16
  },
  buttonRow: { flexDirection: 'row', gap: 12 },
  actionButton: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center'
  },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },

  estimateBox: {
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 15,
  },
  estimateTitle: { fontSize: 12, fontWeight: '900', textTransform: 'uppercase', marginBottom: 5 },
  estimateValue: { fontSize: 24, fontWeight: '900', marginBottom: 10 },

  summaryCard: { marginBottom: 15, paddingHorizontal: 5 },
  summaryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  summaryTitle: { fontSize: 22, fontWeight: 'bold' },
  badge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  badgeText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },

  mealCard: { padding: 18, borderRadius: 16, borderWidth: 1 },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  mealInfo: { flex: 1, paddingRight: 10 },
  mealDescription: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  mealDate: { fontSize: 12 },
  mealCalories: { fontSize: 18, fontWeight: 'bold' },

  breakdownContainer: { marginTop: 8 },
  breakdownItem: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  breakdownName: { fontSize: 13, fontWeight: '600' },
  breakdownDetail: { fontSize: 12 },
  breakdownLabel: { fontSize: 10, fontWeight: '900', marginTop: 10, marginBottom: 5 },
  assumptions: { fontSize: 11, fontStyle: 'italic', marginTop: 8 },

  emptyText: { fontStyle: 'italic', textAlign: 'center', marginTop: 20 },
  calBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  iconBtn: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  textBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
});
