import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

const DIRECTIONS = [
  { key: 'lose',     labelKey: 'goals.lose' },
  { key: 'maintain', labelKey: 'goals.maintain' },
  { key: 'gain',     labelKey: 'goals.gain' },
];

export default function GoalsScreen() {
  const { isDarkMode } = useTheme();
  const { t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [activeGoal, setActiveGoal]     = useState<any>(null);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState(false);
  const [generating, setGenerating]     = useState(false);
  const [showForm, setShowForm]         = useState(false);

  // Form state
  const [direction, setDirection]       = useState('lose');
  const [targetWeight, setTargetWeight] = useState('');
  const [aiSummary, setAiSummary]       = useState('');

  useEffect(() => { fetchActiveGoal(); }, []);

  const fetchActiveGoal = async () => {
    try {
      const res = await apiClient.get('/goals/active');
      if (res.data.goal) {
        setActiveGoal(res.data.goal);
        setShowForm(false);
      } else {
        setActiveGoal(null);
        setShowForm(true);
      }
    } catch {
      setActiveGoal(null);
      setShowForm(true);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateAI = async () => {
    setGenerating(true);
    try {
      const res = await apiClient.post('/goals/recommendation');
      const rec = res.data.recommendation;
      setDirection(rec.direction);
      setTargetWeight(rec.suggestedTargetWeightKg?.toString() || '');
      setAiSummary(rec.explanation || '');
    } catch (e: any) {
      Alert.alert(
        t('common.error'),
        e.response?.data?.message ||
          (t ? t('common.error') : 'Fill your height & weight in Profile first.')
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!targetWeight || isNaN(parseFloat(targetWeight))) {
      Alert.alert(t('common.error'), 'Please enter a valid target weight.');
      return;
    }
    setSaving(true);
    try {
      await apiClient.post('/goals', {
        direction,
        targetWeightKg: parseFloat(targetWeight),
        aiSummary,
      });
      Alert.alert(t('common.success'), t('common.success'));
      setShowForm(false);
      setAiSummary('');
      fetchActiveGoal();
    } catch (e: any) {
      Alert.alert(t('common.error'), e.response?.data?.message || 'Failed to save goal.');
    } finally {
      setSaving(false);
    }
  };

  /* ─── Loading ─── */
  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.brand.action} style={{ marginTop: 80 }} />
      </SafeAreaView>
    );
  }

  /* ─── Active goal view ─── */
  if (activeGoal && !showForm) {
    const dirInfo = DIRECTIONS.find(d => d.key === activeGoal.direction) || DIRECTIONS[0];
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: theme.text }]}>{t('goals.title')}</Text>
            <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('goals.subtitle')}</Text>
          </View>

          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: Colors.brand.primary }]}>{t('goals.activeGoal')}</Text>

            {/* Direction badge */}
            <View style={styles.row}>
              <Text style={[styles.metaLabel, { color: theme.muted }]}>{t('goals.direction')}</Text>
              <View style={[styles.dirBadge, { backgroundColor: Colors.brand.primary + '22', borderColor: Colors.brand.primary }]}>
                <Text style={[styles.dirBadgeText, { color: Colors.brand.primary }]}>{t(dirInfo.labelKey)}</Text>
              </View>
            </View>

            {/* Target weight */}
            <View style={styles.row}>
              <Text style={[styles.metaLabel, { color: theme.muted }]}>{t('goals.targetWeight')}</Text>
              <Text style={[styles.goalTarget, { color: theme.text }]}>{activeGoal.target_weight_kg} kg</Text>
            </View>

            {/* AI summary */}
            {!!activeGoal.ai_summary && (
              <Text style={[styles.summary, { color: theme.secondaryText }]}>{activeGoal.ai_summary}</Text>
            )}

            <TouchableOpacity
              style={[styles.button, { backgroundColor: Colors.brand.primary, marginTop: 20 }]}
              onPress={() => { setActiveGoal(null); setShowForm(true); setAiSummary(''); setTargetWeight(''); }}
            >
              <Feather name="edit-3" size={16} color="#fff" style={{ marginRight: 8 }} />
              <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>{t('goals.newGoal')}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  /* ─── Goal-setting form ─── */
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>{t('goals.title')}</Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('goals.subtitle')}</Text>
        </View>

        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: Colors.brand.action }]}>
            {activeGoal ? t('goals.newGoal') : t('goals.noGoal')}
          </Text>

          {/* AI Summary if generated */}
          {!!aiSummary && (
            <View style={[styles.aiBox, { backgroundColor: Colors.brand.primary + '18', borderColor: Colors.brand.primary + '55' }]}>
              <Text style={[styles.aiLabel, { color: Colors.brand.primary }]}>{t('goals.recommendation')}</Text>
              <Text style={[styles.aiText, { color: theme.secondaryText }]}>{aiSummary}</Text>
            </View>
          )}

          {/* Direction selector */}
          <Text style={[styles.fieldLabel, { color: theme.muted }]}>{t('goals.direction')}</Text>
          <View style={styles.dirRow}>
            {DIRECTIONS.map(d => {
              const active = direction === d.key;
              return (
                <TouchableOpacity
                  key={d.key}
                  style={[
                    styles.dirChip,
                    { borderColor: Colors.brand.primary, backgroundColor: active ? Colors.brand.primary : 'transparent' },
                  ]}
                  onPress={() => setDirection(d.key)}
                >
                  <Text style={[styles.dirChipText, { color: active ? '#fff' : Colors.brand.primary }]}>
                    {t(d.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Target weight */}
          <Text style={[styles.fieldLabel, { color: theme.muted, marginTop: 18 }]}>{t('goals.targetWeight')}</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]}
            placeholder="e.g. 70"
            placeholderTextColor={theme.muted}
            value={targetWeight}
            onChangeText={setTargetWeight}
            keyboardType="numeric"
          />

          {/* Save button */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: Colors.brand.primary, marginTop: 8 }]}
            onPress={handleSave}
            disabled={saving}
          >
            {saving
              ? <ActivityIndicator color="#fff" />
              : <>
                  <Feather name="check-circle" size={16} color="#fff" style={{ marginRight: 8 }} />
                  <Text style={[styles.buttonText, { fontWeight: 'bold' }]}>{t('goals.saveGoal')}</Text>
                </>
            }
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider} />

          {/* AI generate (optional) */}
          <TouchableOpacity
            style={[styles.buttonOutline, { borderColor: Colors.brand.action }]}
            onPress={handleGenerateAI}
            disabled={generating}
          >
            {generating
              ? <ActivityIndicator color={Colors.brand.action} />
              : <>
                  <Text style={[styles.buttonOutlineText, { color: Colors.brand.action, fontWeight: 'bold' }]}>
                    {t('goals.getRecommendation')}
                  </Text>
                </>
            }
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 24, marginTop: 10 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 15 },
  card: { padding: 24, borderRadius: 20, borderWidth: 1 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 20 },

  // active goal
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  metaLabel: { fontSize: 14, fontWeight: '500' },
  dirBadge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  dirBadgeText: { fontSize: 13, fontWeight: '700' },
  goalTarget: { fontSize: 22, fontWeight: 'bold' },
  summary: { fontSize: 14, fontStyle: 'italic', lineHeight: 22, marginTop: 8, marginBottom: 4 },

  // form
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  dirRow: { flexDirection: 'row', gap: 10 },
  dirChip: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 2, alignItems: 'center' },
  dirChipText: { fontWeight: '700', fontSize: 13 },
  input: { borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 4, fontSize: 16 },

  // AI box
  aiBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 20 },
  aiLabel: { fontSize: 13, fontWeight: '700', marginBottom: 6 },
  aiText: { fontSize: 14, lineHeight: 20 },

  // buttons
  button: { borderRadius: 12, padding: 16, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  buttonOutline: { borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 2, flexDirection: 'row', justifyContent: 'center' },
  buttonOutlineText: { fontSize: 15, fontWeight: '700' },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 16 },
});

