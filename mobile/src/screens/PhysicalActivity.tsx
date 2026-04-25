import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, ActivityIndicator, Alert, TextInput } from 'react-native';
import apiClient from '../api/apiClient';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { Colors } from '../constants/Colors';
import { Feather } from '@expo/vector-icons';

export default function PhysicalActivityScreen() {
  const { isDarkMode } = useTheme();
  const { language, t } = useLanguage();
  const theme = isDarkMode ? Colors.dark : Colors.light;

  const ACTIVITY_TYPES = [
    { value: 'running',    label: t('activities.running') || 'Course à pied' },
    { value: 'walking',    label: t('activities.walking') || 'Marche' },
    { value: 'cycling',    label: t('activities.cycling') || 'Vélo' },
    { value: 'swimming',   label: t('activities.swimming') || 'Natation' },
    { value: 'gym',        label: t('activities.gym') || 'Musculation' },
    { value: 'yoga',       label: t('activities.yoga') || 'Yoga' },
    { value: 'football',   label: t('activities.football') || 'Football' },
    { value: 'basketball', label: t('activities.basketball') || 'Basketball' },
    { value: 'tennis',     label: t('activities.tennis') || 'Tennis' },
    { value: 'boxing',     label: t('activities.boxing') || 'Boxe' },
    { value: 'hiit',       label: t('activities.hiit') || 'HIIT' },
    { value: 'pilates',    label: t('activities.pilates') || 'Pilates' },
    { value: 'other',      label: t('activities.other') || 'Autre' },
  ];

  const INTENSITY_OPTIONS = [
    { value: 'low', label: t('activities.low') },
    { value: 'medium', label: t('activities.medium') },
    { value: 'high', label: t('activities.high') },
  ];

  const OBJECTIVE_OPTIONS = [
    { value: 'perte_de_poids', label: t('goals.perte_de_poids') || (language === 'fr' ? 'Perte de poids' : 'Weight Loss') },
    { value: 'prise_de_masse', label: t('goals.prise_de_masse') || (language === 'fr' ? 'Prise de masse' : 'Muscle Gain') },
    { value: 'maintien', label: t('goals.maintien') || (language === 'fr' ? 'Maintien' : 'Maintenance') },
    { value: 'performance', label: t('goals.performance') || (language === 'fr' ? 'Performance' : 'Performance') },
    { value: 'sante_generale', label: t('goals.sante_generale') || (language === 'fr' ? 'Santé générale' : 'General Health') },
  ];

  const LEVEL_OPTIONS = [
    { value: 'debutant', label: language === 'fr' ? 'Débutant' : 'Beginner' },
    { value: 'intermediaire', label: language === 'fr' ? 'Intermédiaire' : 'Intermediate' },
    { value: 'avance', label: language === 'fr' ? 'Avancé' : 'Advanced' },
  ];

  const SESSION_OPTIONS = [
    { value: '1', label: language === 'fr' ? '1 séance' : '1 session' },
    { value: '2', label: language === 'fr' ? '2 séances' : '2 sessions' },
    { value: '3', label: language === 'fr' ? '3 séances' : '3 sessions' },
    { value: '4', label: language === 'fr' ? '4 séances' : '4 sessions' },
    { value: '5', label: language === 'fr' ? '5 séances' : '5 sessions' },
    { value: '6', label: language === 'fr' ? '6 séances' : '6 sessions' },
    { value: '7', label: language === 'fr' ? '7 séances' : '7 sessions' },
  ];

  const TODAY = new Date().toISOString().split('T')[0];

  const [activeTab, setActiveTab] = useState<'tracking' | 'program'>('tracking');
  const [activityType, setActivityType] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('medium');
  const [activityDate, setActivityDate] = useState(TODAY);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [activities, setActivities] = useState<any[]>([]);
  const [totalCalories, setTotalCalories] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [activeProgram, setActiveProgram] = useState<any>(null);
  const [generatedProgram, setGeneratedProgram] = useState<any>(null);
  const [loadingProgram, setLoadingProgram] = useState(true);
  const [objective, setObjective] = useState('maintien');
  const [level, setLevel] = useState('debutant');
  const [sessions, setSessions] = useState('3');
  const [showTypeSelect, setShowTypeSelect] = useState(false);
  const [showIntensitySelect, setShowIntensitySelect] = useState(false);
  const [showObjectiveSelect, setShowObjectiveSelect] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(false);
  const [showSessionsSelect, setShowSessionsSelect] = useState(false);

  useEffect(() => {
    fetchActiveProgram();
    fetchTodayActivities();
  }, []);

  const fetchTodayActivities = async () => {
    try {
      const response = await apiClient.get('/activities/today');
      const activitiesList = response.data.activities || [];
      setActivities(activitiesList);
      setTotalCalories(response.data.totalCalories || 0);
      const durationSum = activitiesList.reduce((s: number, a: any) => s + (a.duration_minutes || 0), 0);
      setTotalDuration(durationSum);
    } catch (error) {
      console.log('Error fetching today activities:', error);
    }
  };

  const fetchActiveProgram = async () => {
    try {
      const response = await apiClient.get('/programs/active');
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
      Alert.alert(t('common.error'), 'Veuillez saisir le type et la durée.');
      return;
    }
    setLoadingActivity(true);
    try {
      await apiClient.post('/activities', {
        activityType,
        description,
        durationMinutes: parseInt(duration),
        intensity,
        activityDate
      });
      Alert.alert(t('common.success'), t('common.success'));
      setActivityType('');
      setDescription('');
      setDuration('');
      setIntensity('medium');
      setActivityDate(TODAY);
      fetchTodayActivities();
    } catch (error: any) {
      Alert.alert(t('common.error'), 'Impossible d\'enregistrer l\'activité.');
    } finally {
      setLoadingActivity(false);
    }
  };

  const handleGenerateProgram = async () => {
    setLoadingProgram(true);
    try {
      const response = await apiClient.post('/programs/generate', {
        objective: objective,
        level: level,
        sessionsPerWeek: parseInt(sessions) || 3
      });
      setGeneratedProgram(response.data.program);
    } catch (error: any) {
      Alert.alert(t('common.error'), 'Impossible de générer le programme.');
    } finally {
      setLoadingProgram(false);
    }
  };

  const handleSaveProgram = async () => {
    if (!generatedProgram) return;
    setLoadingProgram(true);
    try {
      await apiClient.post('/programs/save', { program: generatedProgram });
      Alert.alert(t('common.success'), t('common.success'));
      setGeneratedProgram(null);
      fetchActiveProgram();
    } catch (error: any) {
      Alert.alert(t('common.error'), 'Impossible de sauvegarder.');
    } finally {
      setLoadingProgram(false);
    }
  };

  const renderStatCard = (icon: string, label: string, value: string | number, sub: string) => (
    <View key={label} style={[styles.statCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statLabel, { color: theme.muted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.statValue, { color: theme.text }]}>{value}</Text>
      <Text style={[styles.statSub, { color: theme.muted }]}>{sub}</Text>
    </View>
  );

  const renderProgram = (program: any) => (
    <View>
      <View style={styles.programHeaderRow}>
         <Text style={[styles.programTitle, { color: Colors.brand.primary }]}>{program.program_name}</Text>
         <View style={[styles.badge, { backgroundColor: Colors.brand.primary }]}>
            <Text style={styles.badgeText}>{t('programs.active')}</Text>
         </View>
      </View>
      
      <View style={styles.statsRow}>
        <View style={[styles.miniStatCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
           <Text style={[styles.miniStatLabel, { color: theme.muted }]}>{t('programs.frequency')}</Text>
           <Text style={[styles.miniStatValue, { color: theme.text }]}>{program.sessions_per_week} / sem</Text>
        </View>
        <View style={[styles.miniStatCard, { backgroundColor: theme.background, borderColor: theme.border }]}>
           <Text style={[styles.miniStatLabel, { color: theme.muted }]}>OBJECTIF</Text>
           <Text style={[styles.miniStatValue, { color: theme.text }]}>{program.target_objective}</Text>
        </View>
      </View>

      <View style={styles.exercisesContainer}>
        {program.exercises.map((dayObj: any, index: number) => (
          <View key={index} style={[styles.dayCard, { backgroundColor: theme.background, borderColor: theme.border, borderWidth: 1 }]}>
            <Text style={[styles.dayText, { color: Colors.brand.primary }]}>{dayObj.day}</Text>
            {dayObj.activities.map((act: string, i: number) => (
              <View key={i} style={styles.activityRow}>
                <View style={[styles.dot, { backgroundColor: Colors.brand.action }]} />
                <Text style={[styles.actText, { color: theme.text }]}>{act}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {program.recommendations && program.recommendations.length > 0 && (
        <View style={[styles.card, { backgroundColor: theme.background, borderColor: theme.border, marginTop: 15 }]}>
          <Text style={[styles.cardTitle, { color: theme.text, fontSize: 16 }]}>💡 {t('programs.tips')}</Text>
          {program.recommendations.map((rec: string, i: number) => (
            <View key={i} style={{ flexDirection: 'row', marginBottom: 8, paddingRight: 10 }}>
              <Text style={{ color: Colors.brand.primary, marginRight: 8 }}>•</Text>
              <Text style={{ color: theme.secondaryText, fontSize: 13, lineHeight: 18 }}>{rec}</Text>
            </View>
          ))}
        </View>
      )}

      <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.action, marginTop: 20 }]} onPress={() => { setActiveProgram(null); setGeneratedProgram(null); }}>
        <Text style={styles.buttonText}>{t('programs.newProgram')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.tabBar, { borderBottomColor: theme.border }]}>
        <TouchableOpacity style={[styles.tab, activeTab === 'tracking' && { borderBottomColor: Colors.brand.primary, borderBottomWidth: 3 }]} onPress={() => setActiveTab('tracking')}>
          <Text style={[styles.tabText, { color: activeTab === 'tracking' ? Colors.brand.primary : theme.muted }]}>Suivi</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'program' && { borderBottomColor: Colors.brand.primary, borderBottomWidth: 3 }]} onPress={() => setActiveTab('program')}>
          <Text style={[styles.tabText, { color: activeTab === 'program' ? Colors.brand.primary : theme.muted }]}>Programme IA</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {activeTab === 'tracking' ? (
          <>
            <View style={styles.header}>
              <Text style={[styles.title, { color: theme.text }]}>{t('activities.title')}</Text>
              <Text style={[styles.subtitle, { color: theme.secondaryText }]}>{t('activities.subtitle')}</Text>
            </View>
            <View style={styles.statsRow}>
              {renderStatCard('🏅', 'Séances', activities.length, 'aujourd\'hui')}
              {renderStatCard('⏱️', 'Durée', `${totalDuration} min`, 'session du jour')}
              {renderStatCard('🔥', 'Calories', `${totalCalories} kcal`, 'estimation')}
            </View>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>➕ {t('activities.addActivity')}</Text>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('activities.activityType')}</Text>
              <TouchableOpacity style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]} onPress={() => setShowTypeSelect(!showTypeSelect)}>
                <Text style={{ color: activityType ? theme.text : theme.muted }}>{ACTIVITY_TYPES.find(t => t.value === activityType)?.label || '— Choisir —'}</Text>
                <Feather name="chevron-down" size={18} color={theme.muted} style={{ position: 'absolute', right: 15 }} />
              </TouchableOpacity>
              {showTypeSelect && (
                <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {ACTIVITY_TYPES.map(t => (
                    <TouchableOpacity key={t.value} style={styles.dropdownItem} onPress={() => { setActivityType(t.value); setShowTypeSelect(false); }}><Text style={{ color: theme.text }}>{t.label}</Text></TouchableOpacity>
                  ))}
                </View>
              )}
              <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                <View style={{width: '48%'}}><Text style={[styles.fieldLabel, { color: theme.text }]}>{t('activities.duration')}</Text><TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} placeholder="ex. 45" keyboardType="numeric" placeholderTextColor={theme.muted} value={duration} onChangeText={setDuration} /></View>
                <View style={{width: '48%'}}><Text style={[styles.fieldLabel, { color: theme.text }]}>{t('activities.intensity')}</Text>
                  <TouchableOpacity style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]} onPress={() => setShowIntensitySelect(!showIntensitySelect)}>
                    <Text style={{ color: theme.text }}>{INTENSITY_OPTIONS.find(o => o.value === intensity)?.label || 'Modérée'}</Text>
                    <Feather name="chevron-down" size={18} color={theme.muted} style={{ position: 'absolute', right: 15 }} />
                  </TouchableOpacity>
                </View>
              </View>
              {showIntensitySelect && (
                <View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  {INTENSITY_OPTIONS.map(o => (
                    <TouchableOpacity key={o.value} style={styles.dropdownItem} onPress={() => { setIntensity(o.value); setShowIntensitySelect(false); }}><Text style={{ color: theme.text }}>{o.label}</Text></TouchableOpacity>
                  ))}
                </View>
              )}
              <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 10 }]}>{t('activities.date')}</Text>
              <TextInput style={[styles.input, { backgroundColor: theme.background, color: theme.text, borderColor: theme.border }]} placeholder="YYYY-MM-DD" placeholderTextColor={theme.muted} value={activityDate} onChangeText={setActivityDate} />
              <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.primary, marginTop: 10 }]} onPress={handleLogActivity} disabled={loadingActivity}>{loadingActivity ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{t('activities.save')}</Text>}</TouchableOpacity>
            </View>
            <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <Text style={[styles.cardTitle, { color: theme.text }]}>📅 {t('activities.todayActivities')}</Text>
              {activities.length === 0 ? (<Text style={{ color: theme.muted, textAlign: 'center', marginVertical: 20 }}>{t('activities.noActivities')}</Text>) : (
                <View style={{ gap: 12 }}>{activities.map((act) => (
                    <View key={act.id} style={[styles.activityItem, { backgroundColor: theme.background, borderColor: theme.border }]}><View style={{ flex: 1 }}><View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}><Text style={[styles.activityType, { color: theme.text }]}>{ACTIVITY_TYPES.find(t => t.value === act.activity_type)?.label || act.activity_type}</Text><View style={[styles.intensityBadge, { backgroundColor: act.intensity === 'high' ? Colors.error + '20' : act.intensity === 'medium' ? Colors.brand.primary + '20' : Colors.success + '20' }]}><Text style={{ fontSize: 10, fontWeight: 'bold', color: act.intensity === 'high' ? Colors.error : act.intensity === 'medium' ? Colors.brand.primary : Colors.success }}>{act.intensity === 'high' ? 'Élevée' : act.intensity === 'medium' ? 'Modérée' : 'Faible'}</Text></View></View><Text style={{ color: theme.secondaryText, fontSize: 13 }}>{act.duration_minutes} min • {act.calories_burned} kcal</Text></View>
                      <TouchableOpacity onPress={async () => { Alert.alert('Supprimer', '...', [{ text: 'Annuler', style: 'cancel' }, { text: 'Supprimer', style: 'destructive', onPress: async () => { try { await apiClient.delete(`/activities/${act.id}`); fetchTodayActivities(); } catch (e) {} }}]); }}><Feather name="trash-2" size={18} color={Colors.error} /></TouchableOpacity>
                    </View>
                  ))}</View>
              )}
            </View>
          </>
        ) : (
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.text, marginBottom: 15 }]}>🤖 {t('programs.title')}</Text>
            {loadingProgram ? (<ActivityIndicator size="large" color={Colors.brand.action} style={{marginVertical: 40}} />) : activeProgram ? (renderProgram(activeProgram)) : generatedProgram ? (
               <View><Text style={[styles.programTitle, {color: Colors.success}]}>{t('programs.previewTitle')}</Text>{renderProgram(generatedProgram)}<TouchableOpacity style={[styles.button, {backgroundColor: Colors.success, marginTop: 15}]} onPress={handleSaveProgram}><Text style={styles.buttonText}>{t('programs.confirmSave')}</Text></TouchableOpacity><TouchableOpacity style={[styles.button, {backgroundColor: 'transparent', borderWidth: 1, borderColor: Colors.error, marginTop: 10}]} onPress={() => setGeneratedProgram(null)}><Text style={{color: Colors.error, fontWeight: 'bold'}}>{t('programs.regenerate')}</Text></TouchableOpacity></View>
            ) : (
              <View>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>{t('programs.objective')}</Text>
                <TouchableOpacity style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]} onPress={() => setShowObjectiveSelect(!showObjectiveSelect)}><Text style={{ color: theme.text }}>{OBJECTIVE_OPTIONS.find(o => o.value === objective)?.label || 'Choisir'}</Text><Feather name="chevron-down" size={18} color={theme.muted} style={{ position: 'absolute', right: 15 }} /></TouchableOpacity>
                {showObjectiveSelect && (<View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>{OBJECTIVE_OPTIONS.map(o => (<TouchableOpacity key={o.value} style={styles.dropdownItem} onPress={() => { setObjective(o.value); setShowObjectiveSelect(false); }}><Text style={{ color: theme.text }}>{o.label}</Text></TouchableOpacity>))}</View>)}
                <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 10 }]}>{t('programs.level')}</Text>
                <TouchableOpacity style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]} onPress={() => setShowLevelSelect(!showLevelSelect)}><Text style={{ color: theme.text }}>{LEVEL_OPTIONS.find(l => l.value === level)?.label || 'Choisir'}</Text><Feather name="chevron-down" size={18} color={theme.muted} style={{ position: 'absolute', right: 15 }} /></TouchableOpacity>
                {showLevelSelect && (<View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>{LEVEL_OPTIONS.map(l => (<TouchableOpacity key={l.value} style={styles.dropdownItem} onPress={() => { setLevel(l.value); setShowLevelSelect(false); }}><Text style={{ color: theme.text }}>{l.label}</Text></TouchableOpacity>))}</View>)}
                <Text style={[styles.fieldLabel, { color: theme.text, marginTop: 10 }]}>{t('programs.sessionsPerWeek')}</Text>
                <TouchableOpacity style={[styles.input, { backgroundColor: theme.background, borderColor: theme.border, justifyContent: 'center' }]} onPress={() => setShowSessionsSelect(!showSessionsSelect)}><Text style={{ color: theme.text }}>{SESSION_OPTIONS.find(s => s.value === sessions)?.label || 'Choisir'}</Text><Feather name="chevron-down" size={18} color={theme.muted} style={{ position: 'absolute', right: 15 }} /></TouchableOpacity>
                {showSessionsSelect && (<View style={[styles.dropdown, { backgroundColor: theme.card, borderColor: theme.border }]}>{SESSION_OPTIONS.map(s => (<TouchableOpacity key={s.value} style={styles.dropdownItem} onPress={() => { setSessions(s.value); setShowSessionsSelect(false); }}><Text style={{ color: theme.text }}>{s.label}</Text></TouchableOpacity>))}</View>)}
                <TouchableOpacity style={[styles.button, { backgroundColor: Colors.brand.action, marginTop: 20 }]} onPress={handleGenerateProgram}><Text style={styles.buttonText}>{t('programs.generate')}</Text></TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: { flexDirection: 'row', borderBottomWidth: 1 },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  tabText: { fontWeight: 'bold', fontSize: 16 },
  header: { marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  statCard: { flex: 1, padding: 12, borderRadius: 16, borderWidth: 1, alignItems: 'center' },
  statIcon: { fontSize: 20, marginBottom: 4 },
  statLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 4 },
  statValue: { fontSize: 16, fontWeight: 'bold' },
  statSub: { fontSize: 9, marginTop: 2 },
  card: { padding: 20, borderRadius: 20, borderWidth: 1, marginBottom: 20 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  fieldLabel: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginLeft: 2 },
  input: { borderRadius: 12, padding: 12, borderWidth: 1, marginBottom: 12, fontSize: 15, height: 50 },
  dropdown: { borderRadius: 12, borderWidth: 1, marginTop: -10, marginBottom: 15, overflow: 'hidden', elevation: 5, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 4 },
  dropdownItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#eee' },
  button: { borderRadius: 12, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  programHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  programTitle: { fontSize: 20, fontWeight: 'bold', flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  miniStatCard: { flex: 1, padding: 10, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  miniStatLabel: { fontSize: 9, fontWeight: 'bold', marginBottom: 2 },
  miniStatValue: { fontSize: 14, fontWeight: '700' },
  exercisesContainer: { marginTop: 10 },
  dayCard: { padding: 15, borderRadius: 16, marginBottom: 10 },
  dayText: { fontWeight: 'bold', marginBottom: 8, fontSize: 16 },
  activityRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 8 },
  actText: { fontSize: 14, flex: 1, lineHeight: 20 },
  activityItem: { padding: 15, borderRadius: 16, borderWidth: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  activityType: { fontSize: 16, fontWeight: 'bold', textTransform: 'capitalize' },
  intensityBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
});
