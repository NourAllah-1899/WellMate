import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, ScrollView, Alert } from 'react-native';
import apiClient from '../../api/apiClient';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';
import { Colors } from '../../constants/Colors';
import { Feather } from '@expo/vector-icons';

const ALLERGY_OPTIONS = [
  { id: 'gluten', label: '🌾 Gluten', labelEn: '🌾 Gluten', labelAr: '🌾 جلوتين' },
  { id: 'lactose', label: '🥛 Lactose', labelEn: '🥛 Lactose', labelAr: '🥛 لاكتوز' },
  { id: 'nuts', label: '🥜 Noix', labelEn: '🥜 Nuts', labelAr: '🥜 مكسرات' },
  { id: 'eggs', label: '🥚 Œufs', labelEn: '🥚 Eggs', labelAr: '🥚 بيض' },
  { id: 'seafood', label: '🦐 Fruits de mer', labelEn: '🦐 Seafood', labelAr: '🦐 مأكولات بحرية' },
  { id: 'soy', label: '🫘 Soja', labelEn: '🫘 Soy', labelAr: '🫘 صويا' },
  { id: 'vegetarian', label: '🥬 Végétarien', labelEn: '🥬 Vegetarian', labelAr: '🥬 نباتي' },
  { id: 'vegan', label: '🌱 Végan', labelEn: '🌱 Vegan', labelAr: '🌱 نباتي صرف' },
];

const GOAL_OPTIONS = [
  { value: 'loss', label: '🔥 Perte de poids', labelEn: '🔥 Weight Loss', labelAr: '🔥 فقدان الوزن' },
  { value: 'gain', label: '💪 Prise de masse', labelEn: '💪 Muscle Gain', labelAr: '💪 زيادة الكتلة' },
  { value: 'maintenance', label: '⚖️ Maintien', labelEn: '⚖️ Maintenance', labelAr: '⚖️ الحفاظ' },
];

const MEAL_TYPE_ICONS: any = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_TYPE_COLORS: any = {
  breakfast: ['#fbbf24', '#f97316'],
  lunch: ['#60a5fa', '#06b6d4'],
  dinner: ['#818cf8', '#a855f7'],
  snack: ['#34d399', '#22c55e'],
};

export default function MealPlanGenerator() {
  const { isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [goal, setGoal] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [savingMealIndex, setSavingMealIndex] = useState<number | null>(null);
  const [savedMealIndices, setSavedMealIndices] = useState<Set<number>>(new Set());
  const [isPinned, setIsPinned] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [saveAllLoading, setSaveAllLoading] = useState(false);

  const toggleAllergy = (id: string) => {
    setSelectedAllergies(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const addIngredient = () => {
    const trimmed = ingredientInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
      setIngredientInput('');
    }
  };

  const removeIngredient = (ing: string) => {
    setIngredients(prev => prev.filter(i => i !== ing));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setPlan(null);
    setIsPinned(false);
    try {
      const res = await apiClient.post('/meals/generate-plan', {
        goal: goal || undefined,
        allergies: selectedAllergies,
        ingredients,
        language,
      });
      setPlan(res.data.plan);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur lors de la génération du plan.');
    } finally {
      setLoading(false);
    }
  };

  const handlePinPlan = async () => {
    if (!plan) return;
    setPinning(true);
    try {
      if (isPinned) {
        await apiClient.delete('/meals/plan/today');
        setIsPinned(false);
        Alert.alert(
          language === 'en' ? 'Unpinned' : language === 'ar' ? 'تم إلغاء التثبيت' : 'Désépinglé',
          language === 'en' ? 'Your meal plan is no longer pinned.' : language === 'ar' ? 'لم يعد خطة وجباتك مثبتًا.' : 'Votre plan repas n\'est plus épinglé.'
        );
      } else {
        await apiClient.post('/meals/save-plan', { plan });
        setIsPinned(true);
        Alert.alert(
          language === 'en' ? 'Pinned!' : language === 'ar' ? 'تم التثبيت!' : 'Épinglé !',
          language === 'en' ? 'Your meal plan is pinned for today.' : language === 'ar' ? 'تم تثبيت خطة وجباتك لهذا اليوم.' : 'Votre plan repas est épinglé pour aujourd\'hui.'
        );
      }
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || `Failed to ${isPinned ? 'unpin' : 'pin'} meal plan.`);
    } finally {
      setPinning(false);
    }
  };

  useEffect(() => {
    const checkTodayPlan = async () => {
      try {
        const res = await apiClient.get('/meals/plan/today');
        if (res.data?.plan) {
          setPlan(res.data.plan);
          setIsPinned(true);
        }
      } catch (err) {
        // silently ignore
      }
    };
    checkTodayPlan();
  }, []);

  const handleSaveMealFromPlan = async (meal: any, index: number) => {
    setSavingMealIndex(index);
    try {
      const description = `${meal.name} (${meal.mealType}) — ${meal.description || ''}`.trim();
      await apiClient.post('/meals', {
        description,
        estimatedCalories: meal.calories,
        eatenAt: new Date().toISOString(),
      });
      setSavedMealIndices(prev => {
        const next = new Set(prev);
        next.add(index);
        return next;
      });
      Alert.alert(
        language === 'en' ? 'Saved!' : language === 'ar' ? 'تم الحفظ!' : 'Enregistré !',
        language === 'en' ? 'Meal added to your log.' : language === 'ar' ? 'تمت إضافة الوجبة إلى سجلّك.' : 'Repas ajouté à votre journal.'
      );
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save meal.');
    } finally {
      setSavingMealIndex(null);
    }
  };

  const handleSaveAllToLog = async () => {
    if (!plan?.meals?.length) return;
    setSaveAllLoading(true);
    const newSaved = new Set(savedMealIndices);
    let failed = 0;
    for (let i = 0; i < plan.meals.length; i++) {
      if (newSaved.has(i)) continue;
      const meal = plan.meals[i];
      try {
        const description = `${meal.name} (${meal.mealType}) — ${meal.description || ''}`.trim();
        await apiClient.post('/meals', {
          description,
          estimatedCalories: meal.calories,
          eatenAt: new Date().toISOString(),
        });
        newSaved.add(i);
      } catch (err) {
        failed++;
      }
    }
    setSavedMealIndices(newSaved);
    setSaveAllLoading(false);
    const allSaved = plan.meals.every((_: any, i: number) => newSaved.has(i));
    if (allSaved && failed === 0) {
      Alert.alert(
        language === 'en' ? 'All Saved!' : language === 'ar' ? 'تم الحفظ الكل!' : 'Tout enregistré !',
        language === 'en' ? 'All meals added to your log.' : language === 'ar' ? 'تمت إضافة جميع الوجبات إلى سجلّك.' : 'Tous les repas ont été ajoutés à votre journal.'
      );
    } else if (failed > 0) {
      Alert.alert('Error', `${failed} meal(s) failed to save.`);
    }
  };

  const getLabel = (item: any) => {
    if (language === 'en') return item.labelEn || item.label;
    if (language === 'ar') return item.labelAr || item.label;
    return item.label;
  };

  return (
    <View style={styles.container}>
      {/* Generator Form */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Text style={[styles.cardTitle, { color: theme.text }]}>
          🤖 {language === 'en' ? 'AI Meal Plan Generator' : language === 'ar' ? 'مولد خطة الوجبات بالذكاء الاصطناعي' : 'Générateur de Plan Repas IA'}
        </Text>

        {/* Goal */}
        <Text style={[styles.sectionTitle, { color: theme.muted }]}>
          {language === 'en' ? 'YOUR GOAL' : language === 'ar' ? 'هدفك' : 'VOTRE OBJECTIF'}
        </Text>
        <View style={styles.gridContainer}>
          {GOAL_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setGoal(opt.value)}
              style={[
                styles.gridButton,
                {
                  backgroundColor: goal === opt.value ? Colors.brand.primary : 'transparent',
                  borderColor: goal === opt.value ? Colors.brand.primary : theme.border,
                }
              ]}
            >
              <Text style={[styles.gridButtonText, { color: goal === opt.value ? '#fff' : theme.text }]}>
                {getLabel(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Allergies */}
        <Text style={[styles.sectionTitle, { color: theme.muted, marginTop: 20 }]}>
          {language === 'en' ? 'ALLERGIES & RESTRICTIONS' : language === 'ar' ? 'الحساسية والقيود' : 'ALLERGIES & RESTRICTIONS'}
        </Text>
        <View style={styles.wrapContainer}>
          {ALLERGY_OPTIONS.map(opt => (
            <TouchableOpacity
              key={opt.id}
              onPress={() => toggleAllergy(opt.id)}
              style={[
                styles.chipButton,
                {
                  backgroundColor: selectedAllergies.includes(opt.id) ? '#ef4444' : 'transparent',
                  borderColor: selectedAllergies.includes(opt.id) ? '#ef4444' : theme.border,
                }
              ]}
            >
              <Text style={[styles.chipButtonText, { color: selectedAllergies.includes(opt.id) ? '#fff' : theme.text }]}>
                {getLabel(opt)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Ingredients */}
        <Text style={[styles.sectionTitle, { color: theme.muted, marginTop: 20 }]}>
          {language === 'en' ? 'AVAILABLE INGREDIENTS (OPTIONAL)' : language === 'ar' ? 'المكونات المتاحة (اختياري)' : 'INGRÉDIENTS DISPONIBLES (OPTIONNEL)'}
        </Text>
        <View style={styles.inputRow}>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border, flex: 1 }]}
            value={ingredientInput}
            onChangeText={setIngredientInput}
            placeholder={language === 'en' ? 'e.g. chicken, rice...' : language === 'ar' ? 'مثلاً: دجاج، أرز...' : 'ex: poulet, riz...'}
            placeholderTextColor={theme.muted}
            onSubmitEditing={addIngredient}
          />
          <TouchableOpacity
            onPress={addIngredient}
            disabled={!ingredientInput.trim()}
            style={[styles.addButton, { backgroundColor: ingredientInput.trim() ? '#10b981' : theme.border }]}
          >
            <Feather name="plus" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        {ingredients.length > 0 && (
          <View style={[styles.wrapContainer, { marginTop: 10 }]}>
            {ingredients.map((ing, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => removeIngredient(ing)}
                style={[styles.chipButton, { backgroundColor: isDarkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)', borderColor: Colors.brand.primary }]}
              >
                <Text style={{ color: Colors.brand.primary, fontWeight: 'bold' }}>🥘 {ing} <Feather name="x" size={12} /></Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Generate Button */}
        <TouchableOpacity
          onPress={handleGenerate}
          disabled={loading}
          style={[styles.generateButton, { backgroundColor: Colors.brand.primary, marginTop: 25 }]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.generateButtonText}>
              ✨ {language === 'en' ? 'Generate My Meal Plan' : language === 'ar' ? 'إنشاء خطة وجباتي' : 'Générer Mon Plan Repas'}
            </Text>
          )}
        </TouchableOpacity>

        {error ? (
          <View style={[styles.errorBox, { backgroundColor: isDarkMode ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.05)', borderColor: isDarkMode ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.15)' }]}>
            <Text style={[styles.errorText, { color: '#ef4444' }]}>⚠️ {error}</Text>
          </View>
        ) : null}
      </View>

      {/* Generated Plan */}
      {plan && (
        <View style={styles.planContainer}>
          {/* Plan Header */}
          <View style={[styles.planHeaderCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.planTitle, { color: theme.text }]}>{plan.planTitle || 'Plan du Jour'}</Text>
                <Text style={[styles.planSubtitle, { color: theme.secondaryText }]}>
                  {language === 'en' ? 'Personalized by AI' : language === 'ar' ? 'مخصص بالذكاء الاصطناعي' : 'Personnalisé par IA'}
                </Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={[styles.planCalories, { color: Colors.brand.primary }]}>{plan.totalDayCalories}</Text>
                <Text style={[styles.planCaloriesUnit, { color: theme.muted }]}>KCAL / JOUR</Text>
              </View>
            </View>

            {plan.macroSummary && (
              <View style={styles.macroRow}>
                {[
                  { label: language === 'en' ? 'Protein' : language === 'ar' ? 'بروتين' : 'Protéines', value: plan.macroSummary.totalProtein, unit: 'g', tint: '#3b82f622', text: '#3b82f6' },
                  { label: language === 'en' ? 'Carbs' : language === 'ar' ? 'كربوهيدرات' : 'Glucides', value: plan.macroSummary.totalCarbs, unit: 'g', tint: '#f59e0b22', text: '#d97706' },
                  { label: language === 'en' ? 'Fat' : language === 'ar' ? 'دهون' : 'Lipides', value: plan.macroSummary.totalFat, unit: 'g', tint: '#ec489922', text: '#db2777' },
                ].map((macro, idx) => (
                  <View key={idx} style={[styles.macroBox, { backgroundColor: macro.tint }]}>
                    <Text style={[styles.macroValue, { color: macro.text }]}>{macro.value}{macro.unit}</Text>
                    <Text style={[styles.macroLabel, { color: macro.text }]}>{macro.label}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Action Buttons */}
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 15 }}>
              <TouchableOpacity
                onPress={handleSaveAllToLog}
                disabled={saveAllLoading || (plan.meals || []).every((_: any, i: number) => savedMealIndices.has(i))}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: (plan.meals || []).every((_: any, i: number) => savedMealIndices.has(i))
                      ? '#10b981'
                      : theme.background,
                    borderWidth: 1,
                    borderColor: theme.border,
                  },
                ]}
              >
                {saveAllLoading ? (
                  <ActivityIndicator color={(plan.meals || []).every((_: any, i: number) => savedMealIndices.has(i)) ? '#fff' : Colors.brand.primary} size="small" />
                ) : (
                  <Text style={[styles.actionButtonText, { color: (plan.meals || []).every((_: any, i: number) => savedMealIndices.has(i)) ? '#fff' : Colors.brand.primary }]}>
                    {(plan.meals || []).every((_: any, i: number) => savedMealIndices.has(i))
                      ? (language === 'en' ? '✓ All Saved' : language === 'ar' ? '✓ تم الحفظ الكل' : '✓ Tout enregistré')
                      : (language === 'en' ? '💾 Save All' : language === 'ar' ? '💾 حفظ الكل' : '💾 Tout enregistrer')}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handlePinPlan}
                disabled={pinning}
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isPinned ? '#10b981' : theme.background,
                    borderWidth: 1,
                    borderColor: isPinned ? '#10b981' : theme.border,
                  },
                ]}
              >
                {pinning ? (
                  <ActivityIndicator color={isPinned ? '#fff' : Colors.brand.primary} size="small" />
                ) : (
                  <Text style={[styles.actionButtonText, { color: isPinned ? '#fff' : Colors.brand.primary }]}>
                    {isPinned
                      ? (language === 'en' ? '📌 Unpin' : language === 'ar' ? '📌 إلغاء التثبيت' : '📌 Désépingler')
                      : (language === 'en' ? '📌 Pin this plan' : language === 'ar' ? '📌 تثبيت الخطة' : '📌 Épingler ce plan')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Meals List */}
          <View style={styles.mealsList}>
            {(plan.meals || []).map((meal: any, idx: number) => {
              const isExpanded = expandedMeal === idx;
              const iconTint = isDarkMode ? 'rgba(124,58,237,0.15)' : 'rgba(124,58,237,0.08)';

              return (
                <View key={idx} style={[styles.mealCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TouchableOpacity
                    style={styles.mealHeader}
                    onPress={() => setExpandedMeal(isExpanded ? null : idx)}
                  >
                    <View style={styles.mealHeaderLeft}>
                      <View style={[styles.mealIconBox, { backgroundColor: iconTint }]}>
                        <Text style={{ fontSize: 20 }}>{MEAL_TYPE_ICONS[meal.mealType] || '🍽️'}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.mealTypeLabel, { color: theme.muted }]}>
                          {meal.mealType === 'breakfast' ? (language === 'en' ? 'Breakfast' : language === 'ar' ? 'فطور' : 'Petit-déjeuner') :
                           meal.mealType === 'lunch' ? (language === 'en' ? 'Lunch' : language === 'ar' ? 'غداء' : 'Déjeuner') :
                           meal.mealType === 'dinner' ? (language === 'en' ? 'Dinner' : language === 'ar' ? 'عشاء' : 'Dîner') :
                           (language === 'en' ? 'Snack' : language === 'ar' ? 'وجبة خفيفة' : 'Collation')}
                        </Text>
                        <Text style={[styles.mealName, { color: theme.text }]} numberOfLines={1}>{meal.name}</Text>
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', flexDirection: 'row' }}>
                       <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
                         <Text style={[styles.mealCal, { color: Colors.brand.primary }]}>{meal.calories}</Text>
                         <Text style={[styles.mealCalUnit, { color: theme.muted }]}>kcal</Text>
                       </View>
                       <Feather name={isExpanded ? "chevron-up" : "chevron-down"} size={20} color={theme.muted} />
                    </View>
                  </TouchableOpacity>

                  {isExpanded && (
                    <View style={[styles.mealDetails, { borderTopColor: theme.border }]}>
                      <Text style={[styles.mealDesc, { color: theme.secondaryText }]}>{meal.description}</Text>
                      
                      {/* Macros */}
                      <View style={styles.mealMacros}>
                        {[
                          { label: language === 'en' ? 'PRO' : 'PRO', value: meal.protein_g || 0, tint: isDarkMode ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)', text: '#3b82f6' },
                          { label: language === 'en' ? 'CARB' : 'GLU', value: meal.carbs_g || 0, tint: isDarkMode ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.08)', text: '#d97706' },
                          { label: language === 'en' ? 'FAT' : 'LIP', value: meal.fat_g || 0, tint: isDarkMode ? 'rgba(236,72,153,0.12)' : 'rgba(236,72,153,0.08)', text: '#db2777' },
                        ].map((m, i) => (
                          <View key={i} style={[styles.mealMacroBox, { backgroundColor: m.tint }]}>
                            <Text style={[styles.mealMacroVal, { color: m.text }]}>{m.value}g</Text>
                            <Text style={[styles.mealMacroLbl, { color: m.text, opacity: 0.7 }]}>{m.label}</Text>
                          </View>
                        ))}
                      </View>

                      {/* Prep Time */}
                      {meal.prepTime && (
                        <Text style={[styles.prepTime, { color: theme.secondaryText }]}>
                          ⏱️ <Text style={{ fontWeight: 'bold' }}>{language === 'en' ? 'Prep Time:' : 'Temps de préparation :'}</Text> {meal.prepTime}
                        </Text>
                      )}

                      {/* Ingredients */}
                      {meal.ingredients && meal.ingredients.length > 0 && (
                        <View style={{ marginTop: 15 }}>
                          <Text style={[styles.sectionTitle, { color: theme.muted, fontSize: 10, marginBottom: 8 }]}>
                            {language === 'en' ? 'INGREDIENTS' : 'INGRÉDIENTS'}
                          </Text>
                          <View style={styles.wrapContainer}>
                            {meal.ingredients.map((ing: string, i: number) => (
                              <View key={i} style={[styles.ingBadge, { backgroundColor: isDarkMode ? 'rgba(124,58,237,0.12)' : 'rgba(124,58,237,0.08)' }]}>
                                <Text style={[styles.ingBadgeText, { color: Colors.brand.primary }]}>{ing}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}

                      {/* Recipe */}
                      {meal.recipe && (
                        <View style={[styles.recipeBox, { backgroundColor: theme.background }]}>
                          <Text style={[styles.sectionTitle, { color: theme.muted, fontSize: 10, marginBottom: 5 }]}>
                            {language === 'en' ? 'RECIPE' : 'RECETTE'}
                          </Text>
                          <Text style={[styles.recipeText, { color: theme.text }]}>{meal.recipe}</Text>
                        </View>
                      )}

                      {/* Save Button */}
                      <TouchableOpacity
                        onPress={() => handleSaveMealFromPlan(meal, idx)}
                        disabled={savingMealIndex === idx || savedMealIndices.has(idx)}
                        style={[
                          styles.saveButton,
                          {
                            backgroundColor: savedMealIndices.has(idx)
                              ? '#10b981'
                              : savingMealIndex === idx
                              ? theme.border
                              : Colors.brand.primary,
                          },
                        ]}
                      >
                        {savingMealIndex === idx ? (
                          <ActivityIndicator color="#fff" size="small" />
                        ) : (
                          <Text style={styles.saveButtonText}>
                            {savedMealIndices.has(idx)
                              ? (language === 'en' ? '✓ Saved' : language === 'ar' ? '✓ تم الحفظ' : '✓ Enregistré')
                              : (language === 'en' ? '💾 Save to Log' : language === 'ar' ? '💾 حفظ في السجل' : '💾 Enregistrer dans le journal')}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })}
          </View>

          {/* Tips */}
          {plan.tips && (
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border, marginTop: 15 }]}>
               <Text style={[styles.cardTitle, { color: theme.text }]}>💡 {language === 'en' ? 'Nutritional Tips' : 'Conseils Nutritionnels'}</Text>
               <Text style={{ color: theme.secondaryText, lineHeight: 22 }}>{plan.tips}</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  sectionTitle: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 10 },
  gridContainer: { flexDirection: 'row', gap: 10 },
  gridButton: { flex: 1, paddingVertical: 12, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  gridButtonText: { fontSize: 13, fontWeight: 'bold' },
  wrapContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chipButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  chipButtonText: { fontSize: 12, fontWeight: 'bold' },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, borderWidth: 1, fontSize: 14 },
  addButton: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  generateButton: { padding: 16, borderRadius: 12, alignItems: 'center' },
  generateButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  errorBox: { marginTop: 15, padding: 12, borderRadius: 12, borderWidth: 1 },
  errorText: { fontWeight: 'bold', fontSize: 13 },
  planContainer: { marginBottom: 20 },
  planHeaderCard: { padding: 20, borderRadius: 20, borderWidth: 1, borderTopWidth: 3, marginBottom: 15 },
  planTitle: { fontSize: 22, fontWeight: '900' },
  planSubtitle: { fontSize: 12, marginTop: 4 },
  planCalories: { fontSize: 28, fontWeight: '900' },
  planCaloriesUnit: { fontSize: 10, fontWeight: 'bold', letterSpacing: 1 },
  macroRow: { flexDirection: 'row', gap: 10, marginTop: 15, marginBottom: 15 },
  macroBox: { flex: 1, padding: 12, borderRadius: 16, alignItems: 'center' },
  macroValue: { fontSize: 20, fontWeight: '900' },
  macroLabel: { fontSize: 9, fontWeight: 'bold', letterSpacing: 1, marginTop: 4, textTransform: 'uppercase' },
  mealsList: { gap: 12 },
  mealCard: { borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
  mealHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15 },
  mealHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  mealIconBox: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  mealTypeLabel: { fontSize: 10, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  mealName: { fontSize: 16, fontWeight: 'bold', marginTop: 2 },
  mealCal: { fontSize: 20, fontWeight: '900' },
  mealCalUnit: { fontSize: 10, fontWeight: 'bold' },
  mealDetails: { padding: 15, paddingTop: 10, borderTopWidth: 1 },
  mealDesc: { fontSize: 14, lineHeight: 20, marginBottom: 15 },
  mealMacros: { flexDirection: 'row', gap: 10, marginBottom: 15 },
  mealMacroBox: { flex: 1, padding: 10, borderRadius: 12, alignItems: 'center' },
  mealMacroVal: { fontSize: 16, fontWeight: '900' },
  mealMacroLbl: { fontSize: 9, fontWeight: 'bold' },
  prepTime: { fontSize: 14, marginBottom: 10 },
  ingBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 5 },
  ingBadgeText: { fontSize: 12, fontWeight: '500' },
  recipeBox: { padding: 15, borderRadius: 12, marginTop: 15 },
  recipeText: { fontSize: 14, lineHeight: 22 },
  saveButton: { padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  pinButton: { padding: 12, borderRadius: 12, alignItems: 'center', marginTop: 15 },
  pinButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  actionButton: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignItems: 'center' },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
});
