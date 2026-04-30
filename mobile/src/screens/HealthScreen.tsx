import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import apiClient from '../api/apiClient';
import { Feather } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function HealthScreen() {
  const { isDarkMode } = useTheme();
  const { t, language } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const [nutrition, setNutrition] = useState<any>(null);
  const [smokingStats, setSmokingStats] = useState<any>(null);
  const [waterStats, setWaterStats] = useState<any>({ today: 0 });
  const [reports, setReports] = useState<any[]>([]);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [expandedReportId, setExpandedReportId] = useState<number | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [nutritionRes, smokingRes, reportsRes, userRes, waterRes] = await Promise.all([
        apiClient.get('/health/nutrition-summary'),
        apiClient.get('/health/smoking/stats'),
        apiClient.get('/health/reports'),
        apiClient.get('/auth/me'),
        apiClient.get('/health/water/stats').catch(() => ({ data: { stats: { today: 0 } } }))
      ]);

      setNutrition(nutritionRes.data.summary);
      setSmokingStats(smokingRes.data.stats);
      setReports(reportsRes.data.reports);
      if (reportsRes.data.reports && reportsRes.data.reports.length > 0) {
        setExpandedReportId(reportsRes.data.reports[0].id);
      }
      setUserData(userRes.data.user);
      if (waterRes && waterRes.data) {
        setWaterStats(waterRes.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch health data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogSmoking = async (count: number) => {
    try {
      await apiClient.post('/health/smoking', { cigarettesCount: count });
      const smokingRes = await apiClient.get('/health/smoking/stats');
      setSmokingStats(smokingRes.data.stats);
    } catch (err) {
      console.error('Failed to log smoking:', err);
    }
  };

  const handleLogWater = async (count: number) => {
    try {
      await apiClient.post('/health/water', { glassesCount: count });
      const waterRes = await apiClient.get('/health/water/stats');
      setWaterStats(waterRes.data.stats);
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleUpdateGoal = async (type: string, goal: number) => {
    try {
      await apiClient.post('/health/update-goal', { goalType: type, calorieGoal: goal });
      const nutritionRes = await apiClient.get('/health/nutrition-summary');
      setNutrition(nutritionRes.data.summary);
      Alert.alert(t('common.success'), t('common.success'));
    } catch (err) {
      console.error('Failed to update goal:', err);
      Alert.alert(t('common.error'), 'Impossible de mettre à jour l\'objectif.');
    }
  };

  const handleGenerateReport = async (type: string) => {
    setLoadingType(type);
    try {
      await apiClient.post('/health/generate-report', { type, language });
      const reportsRes = await apiClient.get('/health/reports');
      setReports(reportsRes.data.reports);
      if (reportsRes.data.reports && reportsRes.data.reports.length > 0) {
        setExpandedReportId(reportsRes.data.reports[0].id);
      }
      Alert.alert(t('common.success'), t('health.reportGenerated') || 'Bilan généré avec succès');
    } catch (err: any) {
      console.error('Failed to generate report:', err);
      Alert.alert(t('common.error'), err.response?.data?.message || 'Erreur lors de la génération du bilan.');
    } finally {
      setLoadingType(null);
    }
  };

  const getGoalLabel = (type: string) => {
    switch (type) {
      case 'lose': return t('health.settings.lose') || 'Perte de poids';
      case 'gain': return t('health.settings.gain') || 'Prise de masse';
      case 'maintain': return t('health.settings.maintain') || 'Maintien';
      default: return t('health.settings.notSet') || (language === 'fr' ? 'Non défini' : 'Not set');
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.background }]}>
        <ActivityIndicator size="large" color={Colors.brand.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t('health.title')} <Text style={{ color: Colors.brand.primary }}>{t('health.ai')}</Text>
          </Text>
          <Text style={[styles.subtitle, { color: theme.secondaryText }]}>
            {t('health.cockpitSubtitle')}
          </Text>
        </View>

        {/* Vital Signs Grid */}
        <View style={styles.vitalsGrid}>
          <VitalCard label={t('health.vitals.weight')} value={`${userData?.weight_kg || '--'} kg`} icon="⚖️" theme={theme} />
          <VitalCard label={t('health.vitals.height')} value={`${userData?.height_cm || '--'} cm`} icon="📏" theme={theme} />
          <VitalCard label={userData?.bmi ? t('health.vitals.bmi') : 'IMC'} value={userData?.bmi || '--'} icon="📊" theme={theme} />
          <VitalCard label={t('health.vitals.age')} value={`${userData?.age || '--'} ${t('health.vitals.years') || 'ans'}`} icon="🎂" theme={theme} />
        </View>

        {/* Nutrition Card */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🥗 {t('health.nutrition.title')}</Text>
          <View style={styles.nutritionContent}>
            <View style={styles.progressPlaceholder}>
              {/* Simple circle progress via View */}
              <View style={[styles.circleBase, { borderColor: theme.border }]}>
                <View style={[styles.circleContent]}>
                  <Text style={[styles.caloriesValue, { color: theme.text }]}>{nutrition?.caloriesConsumedToday || 0}</Text>
                  <Text style={[styles.caloriesSub, { color: theme.muted }]}>
                    {nutrition?.calorieGoal > 0 ? `${t('health.nutrition.sur')} ${nutrition.calorieGoal}` : (t('health.nutrition.noGoal') || (language === 'fr' ? 'Pas d\'objectif' : 'No Goal'))}
                  </Text>
                </View>
              </View>
            </View>
            
            <View style={styles.nutritionStats}>
              <View style={[styles.statBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <Text style={[styles.statLabel, { color: theme.muted }]}>{t('health.nutrition.remaining')}</Text>
                <Text style={[styles.statValue, { color: (nutrition?.caloriesRemaining === 0 && nutrition?.calorieGoal > 0) ? Colors.error : theme.text }]}>
                  {nutrition?.caloriesRemaining || 0} <Text style={{ fontSize: 10 }}>kcal</Text>
                </Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: theme.background, borderColor: theme.border }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={[styles.statLabel, { color: theme.muted }]}>{t('health.nutrition.goal')}</Text>
                  <TouchableOpacity onPress={() => {
                    Alert.prompt(
                      t('health.nutrition.goal'),
                      'Entrez votre objectif calorique quotidien',
                      [
                        { text: t('common.cancel'), style: 'cancel' },
                        { text: t('common.save'), onPress: (val) => handleUpdateGoal(nutrition?.goalType || 'maintain', parseInt(val || '2000')) }
                      ],
                      'plain-text',
                      nutrition?.calorieGoal?.toString()
                    );
                  }}>
                    <Feather name="settings" size={12} color={theme.muted} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.statValue, { color: Colors.brand.primary, fontSize: 12 }]}>
                  {getGoalLabel(nutrition?.goalType)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Smoking Tracker */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
             <Text style={[styles.cardTitle, { color: theme.text }]}>🚭 {t('health.smoking.title') || 'Tabagisme'}</Text>
             {smokingStats?.trend === 'decrease' && <View style={styles.trendBadge}><Text style={styles.trendText}>▼</Text></View>}
          </View>
          
          <View style={styles.smokingStatsRow}>
            <View style={styles.smokingStat}>
               <Text style={[styles.smokingValue, { color: theme.text }]}>{smokingStats?.today || 0}</Text>
               <Text style={[styles.smokingLabel, { color: theme.muted }]}>{t('health.smoking.today') || 'Aujourd\'hui'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.smokingStat}>
               <Text style={[styles.smokingValue, { color: theme.muted }]}>{smokingStats?.yesterday || 0}</Text>
               <Text style={[styles.smokingLabel, { color: theme.muted }]}>{t('health.smoking.yesterday') || 'Hier'}</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <View style={styles.smokingStat}>
               <Text style={[styles.smokingValue, { color: theme.text }]}>{smokingStats?.weekly || 0}</Text>
               <Text style={[styles.smokingLabel, { color: theme.muted }]}>{t('health.smoking.week') || 'Semaine'}</Text>
            </View>
          </View>

          <View style={styles.smokingActions}>
            <TouchableOpacity 
              style={[styles.smokingBtn, { backgroundColor: Colors.brand.primary }]}
              onPress={() => handleLogSmoking(1)}
            >
              <Text style={styles.btnText}>+ 1 Cigarette</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Water Tracker */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.cardHeader}>
             <Text style={[styles.cardTitle, { color: theme.text }]}>💧 {t('health.hydration.title')}</Text>
             <TouchableOpacity onPress={() => handleLogWater(0)}>
                <Text style={{ color: theme.muted, fontSize: 10 }}>{t('health.hydration.reset')}</Text>
             </TouchableOpacity>
          </View>
          
          <View style={styles.waterInfo}>
             <Text style={[styles.waterValue, { color: '#3b82f6' }]}>
               {((waterStats?.today || 0) * 0.25).toFixed(1)} <Text style={{ fontSize: 14, color: theme.muted }}>{t('health.hydration.liter')}</Text>
             </Text>
             <Text style={[styles.waterGoal, { color: theme.muted }]}>{t('health.hydration.goal')}</Text>
          </View>

          <View style={styles.waterProgress}>
            <View style={[styles.progressBar, { backgroundColor: theme.background }]}>
              <View style={[styles.progressFill, { width: `${Math.min(100, ((waterStats?.today || 0) / 8) * 100)}%`, backgroundColor: '#3b82f6' }]} />
            </View>
          </View>

          <View style={styles.waterGrid}>
            {[...Array(8)].map((_, i) => (
              <TouchableOpacity 
                key={i}
                onPress={() => handleLogWater(i + 1)}
                style={[
                  styles.waterGlass, 
                  { backgroundColor: i < (waterStats?.today || 0) ? '#dbeafe' : theme.background }
                ]}
              >
                <Text style={{ opacity: i < (waterStats?.today || 0) ? 1 : 0.3 }}>💧</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Smart Reports */}
        <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>🧠 {t('health.reports.title') || 'Bilans Intelligents'}</Text>
          <Text style={[styles.cardSubtitle, { color: theme.secondaryText }]}>
             Analysez vos données avec notre IA pour obtenir des conseils personnalisés.
          </Text>

          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: Colors.brand.primary }]}
              onPress={() => handleGenerateReport('daily')}
              disabled={loadingType !== null}
            >
              {loadingType === 'daily' ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.actionBtnText}>{t('health.reports.daily') || 'Quotidien'}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, { backgroundColor: theme.background, borderColor: Colors.brand.primary, borderWidth: 1 }]}
              onPress={() => handleGenerateReport('weekly')}
              disabled={loadingType !== null}
            >
              {loadingType === 'weekly' ? (
                <ActivityIndicator color={Colors.brand.primary} size="small" />
              ) : (
                <Text style={[styles.actionBtnText, { color: Colors.brand.primary }]}>{t('health.reports.weekly') || 'Hebdomadaire'}</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.reportsList}>
            {reports.length === 0 ? (
              <Text style={[styles.emptyText, { color: theme.muted }]}>Aucun bilan généré pour le moment.</Text>
            ) : (
              reports.map((report, idx) => (
                <TouchableOpacity 
                  key={report.id} 
                  style={[styles.reportItem, { borderTopWidth: idx === 0 ? 0 : 1, borderTopColor: theme.border }]}
                  onPress={() => setExpandedReportId(expandedReportId === report.id ? null : report.id)}
                >
                   <View style={styles.reportHeader}>
                      <View>
                        <Text style={[styles.reportType, { color: theme.text }]}>Bilan {report.report_type === 'daily' ? 'Quotidien' : 'Hebdomadaire'}</Text>
                        <Text style={[styles.reportDate, { color: theme.muted }]}>{new Date(report.generated_at).toLocaleDateString()}</Text>
                      </View>
                      <Feather name={expandedReportId === report.id ? "chevron-up" : "chevron-down"} size={20} color={theme.muted} />
                   </View>
                   {expandedReportId === report.id && (
                     <Text style={[styles.reportSummary, { color: theme.secondaryText, marginTop: 10 }]}>
                        {report.content}
                     </Text>
                   )}
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

function VitalCard({ label, value, icon, theme }: any) {
  return (
    <View style={[styles.vitalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.vitalIcon, { backgroundColor: theme.background }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View>
        <Text style={[styles.vitalLabel, { color: theme.muted }]}>{label.toUpperCase()}</Text>
        <Text style={[styles.vitalValue, { color: theme.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContent: { padding: 20, paddingBottom: 40 },
  header: { marginBottom: 25 },
  title: { fontSize: 32, fontWeight: 'bold', tracking: -1 },
  subtitle: { fontSize: 15, marginTop: 5, lineHeight: 22 },
  
  vitalsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 25 },
  vitalCard: { width: (width - 50) / 2, padding: 12, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 10 },
  vitalIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  vitalLabel: { fontSize: 8, fontWeight: '900', letterSpacing: 1 },
  vitalValue: { fontSize: 15, fontWeight: 'bold' },
  
  card: { padding: 20, borderRadius: 24, borderWidth: 1, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  cardSubtitle: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  
  nutritionContent: { flexDirection: 'row', alignItems: 'center', gap: 20 },
  progressPlaceholder: { width: 120, height: 120, alignItems: 'center', justifyContent: 'center' },
  circleBase: { width: 110, height: 110, borderRadius: 55, borderWidth: 8, alignItems: 'center', justifyContent: 'center' },
  circleContent: { alignItems: 'center' },
  caloriesValue: { fontSize: 24, fontWeight: '900' },
  caloriesSub: { fontSize: 8, fontWeight: 'bold', textTransform: 'uppercase' },
  
  nutritionStats: { flex: 1, gap: 10 },
  statBox: { padding: 10, borderRadius: 12, borderWidth: 1 },
  statLabel: { fontSize: 9, fontWeight: '900', textTransform: 'uppercase', marginBottom: 2 },
  statValue: { fontSize: 14, fontWeight: 'bold' },
  
  smokingStatsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around', marginVertical: 10 },
  smokingStat: { alignItems: 'center' },
  smokingValue: { fontSize: 24, fontWeight: '900' },
  smokingLabel: { fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  divider: { width: 1, height: 40 },
  smokingActions: { marginTop: 15 },
  smokingBtn: { padding: 12, borderRadius: 12, alignItems: 'center' },
  trendBadge: { backgroundColor: Colors.brand.primary + '20', width: 24, height: 24, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  trendText: { color: Colors.brand.primary, fontSize: 12 },
  
  waterInfo: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 },
  waterValue: { fontSize: 28, fontWeight: '900' },
  waterGoal: { fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase' },
  waterProgress: { height: 8, borderRadius: 4, overflow: 'hidden', marginBottom: 20 },
  progressBar: { flex: 1, height: '100%' },
  progressFill: { height: '100%', borderRadius: 4 },
  waterGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  waterGlass: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  
  actionRow: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  actionBtn: { flex: 1, padding: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  actionBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  reportsList: { marginTop: 10 },
  reportItem: { paddingVertical: 15 },
  reportHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  reportType: { fontWeight: 'bold', fontSize: 14 },
  reportDate: { fontSize: 12 },
  reportSummary: { fontSize: 13, lineHeight: 18 },
  emptyText: { textAlign: 'center', padding: 20, fontStyle: 'italic' },
});
