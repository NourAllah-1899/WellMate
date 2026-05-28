import { useState, useEffect } from 'react';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

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

const MEAL_TYPE_ICONS = {
  breakfast: '🌅',
  lunch: '☀️',
  dinner: '🌙',
  snack: '🍎',
};

const MEAL_TYPE_COLORS = {
  breakfast: 'from-amber-400 to-orange-500',
  lunch: 'from-blue-400 to-cyan-500',
  dinner: 'from-indigo-400 to-purple-500',
  snack: 'from-emerald-400 to-green-500',
};

export default function MealPlanGenerator() {
  const { language } = useLanguage();
  const [goal, setGoal] = useState('');
  const [selectedAllergies, setSelectedAllergies] = useState([]);
  const [ingredientInput, setIngredientInput] = useState('');
  const [ingredients, setIngredients] = useState([]);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [savingMealIndex, setSavingMealIndex] = useState(null);
  const [savedMealIndices, setSavedMealIndices] = useState(new Set());
  const [isPinned, setIsPinned] = useState(false);
  const [pinning, setPinning] = useState(false);
  const [saveAllLoading, setSaveAllLoading] = useState(false);

  const toggleAllergy = (id) => {
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

  const removeIngredient = (ing) => {
    setIngredients(prev => prev.filter(i => i !== ing));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient();
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setPlan(null);
    setIsPinned(false);
    try {
      const res = await api.post('/api/meals/generate-plan', {
        goal: goal || undefined,
        allergies: selectedAllergies,
        ingredients,
        language,
      });
      setPlan(res.data.plan);
    } catch (err) {
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
        await api.delete('/api/meals/plan/today');
        setIsPinned(false);
      } else {
        await api.post('/api/meals/save-plan', { plan });
        setIsPinned(true);
      }
    } catch (err) {
      setError(err?.response?.data?.message || `Failed to ${isPinned ? 'unpin' : 'pin'} meal plan.`);
    } finally {
      setPinning(false);
    }
  };

  useEffect(() => {
    const checkTodayPlan = async () => {
      try {
        const res = await api.get('/api/meals/plan/today');
        if (res.data?.plan) {
          setPlan(res.data.plan);
          setIsPinned(true);
        }
      } catch (err) {
        // silently ignore — user can generate a new plan
      }
    };
    checkTodayPlan();
  }, []);

  const handleSaveMealFromPlan = async (meal, index) => {
    setSavingMealIndex(index);
    try {
      const description = `${meal.name} (${meal.mealType}) — ${meal.description || ''}`.trim();
      await api.post('/api/meals', {
        description,
        estimatedCalories: meal.calories,
        eatenAt: new Date().toISOString(),
      });
      setSavedMealIndices(prev => new Set(prev).add(index));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save meal.');
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
        await api.post('/api/meals', {
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
    if (failed > 0) {
      setError(`${failed} meal(s) failed to save.`);
    }
  };

  const getLabel = (item) => {
    if (language === 'en') return item.labelEn || item.label;
    if (language === 'ar') return item.labelAr || item.label;
    return item.label;
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <div className="wm-card p-6">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6" style={{ color: 'var(--text-heading)' }}>
          <span className="text-2xl">🤖</span>
          {language === 'en' ? 'AI Meal Plan Generator' : language === 'ar' ? 'مولد خطة الوجبات بالذكاء الاصطناعي' : 'Générateur de Plan Repas IA'}
        </h2>

        {/* Goal Selection */}
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'Your Goal' : language === 'ar' ? 'هدفك' : 'Votre Objectif'}
          </label>
          <div className="grid grid-cols-3 gap-3">
            {GOAL_OPTIONS.map(opt => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setGoal(opt.value)}
                className={`p-3 rounded-xl text-sm font-bold transition-all border ${
                  goal === opt.value
                    ? 'text-white border-transparent shadow-lg dark:shadow-none scale-105'
                    : 'hover:opacity-80'
                }`}
                style={goal === opt.value
                  ? { background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-action))', borderColor: 'transparent' }
                  : { backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', borderColor: 'var(--border-main)' }
                }
              >
                {getLabel(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Allergies */}
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'Allergies & Restrictions' : language === 'ar' ? 'الحساسية والقيود' : 'Allergies & Restrictions'}
          </label>
          <div className="flex flex-wrap gap-2">
            {ALLERGY_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                onClick={() => toggleAllergy(opt.id)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                  selectedAllergies.includes(opt.id)
                    ? 'text-white shadow-md'
                    : 'hover:opacity-80'
                }`}
                style={selectedAllergies.includes(opt.id)
                  ? { backgroundColor: '#ef4444', borderColor: '#dc2626', color: '#fff' }
                  : { backgroundColor: 'var(--bg-main)', color: 'var(--text-primary)', borderColor: 'var(--border-main)' }
                }
              >
                {getLabel(opt)}
              </button>
            ))}
          </div>
        </div>

        {/* Ingredients */}
        <div className="mb-6">
          <label className="block text-xs font-black uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)' }}>
            {language === 'en' ? 'Available Ingredients (optional)' : language === 'ar' ? 'المكونات المتاحة (اختياري)' : 'Ingrédients Disponibles (optionnel)'}
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={ingredientInput}
              onChange={e => setIngredientInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={language === 'en' ? 'e.g. chicken, rice, tomatoes...' : language === 'ar' ? 'مثلاً: دجاج، أرز، طماطم...' : 'ex: poulet, riz, tomates...'}
              className="wm-input flex-1"
              style={{ margin: 0 }}
            />
            <button
              type="button"
              onClick={addIngredient}
              disabled={!ingredientInput.trim()}
              className="px-4 py-2 rounded-xl font-bold text-white transition-all disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-action))' }}
            >
              +
            </button>
          </div>
          {ingredients.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {ingredients.map((ing, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold"
                  style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)', color: 'var(--brand-primary)', border: '1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)' }}
                >
                  🥘 {ing}
                  <button
                    type="button"
                    onClick={() => removeIngredient(ing)}
                    className="ml-1 hover:text-red-500 transition-colors text-base leading-none"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="wm-btn flex items-center justify-center gap-2 text-base"
          style={{ marginTop: 20 }}
        >
          {loading ? (
            <>
              <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              {language === 'en' ? 'Generating your plan...' : language === 'ar' ? 'جاري إنشاء خطتك...' : 'Génération en cours...'}
            </>
          ) : (
            <>
              <span>✨</span>
              {language === 'en' ? 'Generate My Meal Plan' : language === 'ar' ? 'إنشاء خطة وجباتي' : 'Générer Mon Plan Repas'}
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded-xl text-sm font-bold border" style={{ backgroundColor: 'color-mix(in srgb, #ef4444 8%, transparent)', color: '#ef4444', borderColor: 'color-mix(in srgb, #ef4444 20%, transparent)' }}>
            ⚠️ {error}
          </div>
        )}
      </div>

      {/* Generated Plan */}
      {plan && (
        <div className="space-y-6 animate-fade-in">
          {/* Plan Header */}
          <div className="wm-card p-6" style={{ borderTop: '3px solid var(--brand-primary)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-black" style={{ color: 'var(--text-heading)' }}>{plan.planTitle || 'Plan du Jour'}</h3>
                <p className="mt-1 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {language === 'en' ? 'Personalized by AI based on your goals' : language === 'ar' ? 'مخصص بالذكاء الاصطناعي بناءً على أهدافك' : 'Personnalisé par IA selon vos objectifs'}
                </p>
              </div>
              <div className="wm-badge" style={{ fontSize: '1.1rem' }}>
                <span style={{ color: 'var(--brand-primary)' }}>{plan.totalDayCalories}</span>
                <span className="text-xs ml-1" style={{ color: 'var(--text-muted)' }}>kcal</span>
              </div>
            </div>

            {/* Macro Summary */}
            {plan.macroSummary && (
              <div className="grid grid-cols-3 gap-3 mt-5">
                {[
                  { label: language === 'en' ? 'Protein' : language === 'ar' ? 'بروتين' : 'Protéines', value: plan.macroSummary.totalProtein, unit: 'g', tint: 'color-mix(in srgb, #3b82f6 12%, transparent)', text: '#3b82f6' },
                  { label: language === 'en' ? 'Carbs' : language === 'ar' ? 'كربوهيدرات' : 'Glucides', value: plan.macroSummary.totalCarbs, unit: 'g', tint: 'color-mix(in srgb, #f59e0b 12%, transparent)', text: '#d97706' },
                  { label: language === 'en' ? 'Fat' : language === 'ar' ? 'دهون' : 'Lipides', value: plan.macroSummary.totalFat, unit: 'g', tint: 'color-mix(in srgb, #ec4899 12%, transparent)', text: '#db2777' },
                ].map((macro, idx) => (
                  <div key={idx} className="wm-panel p-3 text-center" style={{ backgroundColor: macro.tint, borderColor: macro.tint }}>
                    <div className="text-xl font-black" style={{ color: macro.text }}>{macro.value}{macro.unit}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold" style={{ color: macro.text, opacity: 0.7 }}>{macro.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                onClick={handleSaveAllToLog}
                disabled={saveAllLoading || (plan.meals || []).every((_, i) => savedMealIndices.has(i))}
                className={`wm-btn small flex items-center gap-2 ${(plan.meals || []).every((_, i) => savedMealIndices.has(i)) ? 'success' : 'secondary'}`}
              >
                {saveAllLoading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{(plan.meals || []).every((_, i) => savedMealIndices.has(i)) ? '✓ All Saved' : '💾 Save All to Log'}</span>
                )}
              </button>
              <button
                type="button"
                onClick={handlePinPlan}
                disabled={pinning}
                className={`wm-btn small flex items-center gap-2 ${isPinned ? 'success' : 'secondary'}`}
              >
                {pinning ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <span>{isPinned ? '📌 Unpin' : '📌 Pin this plan'}</span>
                )}
              </button>
            </div>
          </div>

          {/* Meals List */}
          <div className="space-y-4">
            {(plan.meals || []).map((meal, idx) => (
              <div
                key={idx}
                className="wm-card overflow-hidden transition-all"
              >
                {/* Meal Header */}
                <div
                  className="p-4 cursor-pointer flex items-center justify-between gap-4"
                  onClick={() => setExpandedMeal(expandedMeal === idx ? null : idx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)' }}>
                      {MEAL_TYPE_ICONS[meal.mealType] || '🍽️'}
                    </div>
                    <div>
                      <div className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                        {meal.mealType === 'breakfast' ? (language === 'en' ? 'Breakfast' : language === 'ar' ? 'فطور' : 'Petit-déjeuner') :
                         meal.mealType === 'lunch' ? (language === 'en' ? 'Lunch' : language === 'ar' ? 'غداء' : 'Déjeuner') :
                         meal.mealType === 'dinner' ? (language === 'en' ? 'Dinner' : language === 'ar' ? 'عشاء' : 'Dîner') :
                         (language === 'en' ? 'Snack' : language === 'ar' ? 'وجبة خفيفة' : 'Collation')}
                      </div>
                      <div className="text-base font-bold" style={{ color: 'var(--text-heading)' }}>{meal.name}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-lg font-black" style={{ color: 'var(--brand-primary)' }}>{meal.calories}</div>
                      <div className="text-[10px] font-bold" style={{ color: 'var(--text-muted)' }}>kcal</div>
                    </div>
                    <span className={`transition-transform duration-300 text-lg ${expandedMeal === idx ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }}>
                      ⌄
                    </span>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedMeal === idx && (
                  <div className="px-4 pb-4 border-t" style={{ borderColor: 'var(--border-main)' }}>
                    {/* Description */}
                    <p className="text-sm mt-4 mb-4" style={{ color: 'var(--text-secondary)' }}>{meal.description}</p>

                    {/* Macros */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { label: language === 'en' ? 'Protein' : language === 'ar' ? 'بروتين' : 'Protéines', value: meal.protein_g || 0, tint: 'color-mix(in srgb, #3b82f6 10%, transparent)', text: '#3b82f6' },
                        { label: language === 'en' ? 'Carbs' : language === 'ar' ? 'كربوهيدرات' : 'Glucides', value: meal.carbs_g || 0, tint: 'color-mix(in srgb, #f59e0b 10%, transparent)', text: '#d97706' },
                        { label: language === 'en' ? 'Fat' : language === 'ar' ? 'دهون' : 'Lipides', value: meal.fat_g || 0, tint: 'color-mix(in srgb, #ec4899 10%, transparent)', text: '#db2777' },
                      ].map((m, i) => (
                        <div key={i} className="wm-panel p-2 text-center" style={{ backgroundColor: m.tint, borderColor: m.tint }}>
                          <div className="text-sm font-black" style={{ color: m.text }}>{m.value}g</div>
                          <div className="text-[9px] font-bold uppercase" style={{ color: m.text, opacity: 0.7 }}>{m.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Prep Time */}
                    {meal.prepTime && (
                      <div className="flex items-center gap-2 mb-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        <span>⏱️</span>
                        <span className="font-bold">{language === 'en' ? 'Prep Time:' : language === 'ar' ? 'وقت التحضير:' : 'Temps de préparation :'}</span>
                        {meal.prepTime}
                      </div>
                    )}

                    {/* Ingredients */}
                    {meal.ingredients && meal.ingredients.length > 0 && (
                      <div className="mb-4">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                          {language === 'en' ? 'Ingredients' : language === 'ar' ? 'المكونات' : 'Ingrédients'}
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {meal.ingredients.map((ing, i) => (
                            <span key={i} className="px-2 py-1 rounded-lg text-xs font-medium" style={{ backgroundColor: 'color-mix(in srgb, var(--brand-primary) 8%, transparent)', color: 'var(--text-primary)' }}>
                              {ing}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recipe */}
                    {meal.recipe && (
                      <div className="p-4 rounded-2xl" style={{ backgroundColor: 'var(--bg-main)' }}>
                        <h4 className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>
                          {language === 'en' ? 'Recipe' : language === 'ar' ? 'الوصفة' : 'Recette'}
                        </h4>
                        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'var(--text-primary)' }}>
                          {meal.recipe}
                        </p>
                      </div>
                    )}

                    {/* Save Button */}
                    <button
                      type="button"
                      onClick={() => handleSaveMealFromPlan(meal, idx)}
                      disabled={savingMealIndex === idx || savedMealIndices.has(idx)}
                      className={`wm-btn small flex items-center justify-center gap-2 ${
                        savedMealIndices.has(idx) ? 'success' : ''
                      }`}
                      style={{ marginTop: 16 }}
                    >
                      {savingMealIndex === idx ? (
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      ) : (
                        <span>{savedMealIndices.has(idx) ? '✓ Saved' : '💾 Save to Log'}</span>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Tips */}
          {plan.tips && (
            <div className="wm-card p-5">
              <h4 className="font-bold flex items-center gap-2 mb-3" style={{ color: 'var(--text-heading)' }}>
                <span>💡</span>
                {language === 'en' ? 'Nutritional Tips' : language === 'ar' ? 'نصائح غذائية' : 'Conseils Nutritionnels'}
              </h4>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{plan.tips}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
