import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/client.js';
import NutritionProgress from '../components/health/NutritionProgress';
import SmokingTracker from '../components/health/SmokingTracker';
import SmartReports from '../components/health/SmartReports';
import HealthSettings from '../components/health/HealthSettings';
import { useLanguage } from '../context/LanguageContext.jsx';

export default function Health() {
  const { t, language } = useLanguage();
  const [nutrition, setNutrition] = useState(null);
  const [smokingStats, setSmokingStats] = useState(null);
  const [waterStats, setWaterStats] = useState({ today: 0 });
  const [reports, setReports] = useState([]);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [nutritionRes, smokingRes, reportsRes, userRes, waterRes] = await Promise.all([
        api.get('/api/health/nutrition-summary'),
        api.get('/api/health/smoking/stats'),
        api.get('/api/health/reports'),
        api.get('/api/auth/me'),
        api.get('/api/health/water/stats').catch(() => ({ data: { stats: { today: 0 } } }))
      ]);

      setNutrition(nutritionRes.data.summary);
      setSmokingStats(smokingRes.data.stats);
      setReports(reportsRes.data.reports);
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

  const handleUpdateGoal = async (data) => {
    try {
      await api.post('/api/health/update-goal', data);
      const nutritionRes = await api.get('/api/health/nutrition-summary');
      setNutrition(nutritionRes.data.summary);
    } catch (err) {
      console.error('Failed to update goal:', err);
    }
  };

  const handleLogSmoking = async (count) => {
    try {
      await api.post('/api/health/smoking', { cigarettesCount: count });
      const smokingRes = await api.get('/api/health/smoking/stats');
      setSmokingStats(smokingRes.data.stats);
    } catch (err) {
      console.error('Failed to log smoking:', err);
    }
  };

  const handleLogWater = async (count) => {
    try {
      await api.post('/api/health/water', { glassesCount: count });
      const waterRes = await api.get('/api/health/water/stats');
      setWaterStats(waterRes.data.stats);
    } catch (err) {
      console.error('Failed to log water:', err);
    }
  };

  const handleGenerateReport = async (type) => {
    setReportLoading(true);
    setReportError(null);
    try {
      await api.post('/api/health/generate-report', { type, language });
      const reportsRes = await api.get('/api/health/reports');
      setReports(reportsRes.data.reports);
    } catch (err) {
      console.error('Failed to generate report:', err);
      setReportError(err.response?.data?.message || 'Erreur lors de la génération du bilan. Veuillez réessayer plus tard.');
    } finally {
      setReportLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="wm-container space-y-10">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
            {t('health.title')} <span className="text-brand-primary">{t('health.ai')}</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium mt-2">
            {t('health.cockpitSubtitle')}
          </p>
        </div>
        <HealthSettings 
          currentGoal={nutrition?.calorieGoal} 
          currentType={nutrition?.goalType} 
          onUpdate={handleUpdateGoal} 
        />
      </div>

      {/* Vital Signs Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: t('health.vitals.weight'), value: `${userData?.weight_kg || '--'} kg`, icon: '⚖️', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400' },
          { label: t('health.vitals.height'), value: `${userData?.height_cm || '--'} cm`, icon: '📏', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400' },
          { label: t('health.vitals.bmi'), value: userData?.bmi || '--', icon: '📊', color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400' },
          { label: t('health.vitals.age'), value: `${userData?.age || '--'} ${t('health.vitals.years')}`, icon: '🎂', color: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30 dark:text-amber-400' },
        ].map((item, idx) => (
          <div key={idx} className="wm-card p-4 flex items-center gap-4">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${item.color}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
              <p className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Tracker & Tools */}
        <div className="lg:col-span-4 space-y-8">
          <NutritionProgress summary={nutrition} />
          <SmokingTracker stats={smokingStats} onLog={handleLogSmoking} />
          
          {/* Water Intake */}
          <div className="wm-card p-5">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
                <span>💧</span> {t('health.hydration.title')}
              </h4>
              <button onClick={() => handleLogWater(0)} className="text-[10px] uppercase font-bold text-slate-400 hover:text-red-500 transition-colors">
                {t('health.hydration.reset')}
              </button>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-black text-blue-500">
                {((waterStats?.today || 0) * 0.25).toFixed(1)}<span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{t('health.hydration.liter')}</span>
              </span>
              <span className="text-xs font-bold uppercase" style={{ color: 'var(--text-secondary)' }}>{t('health.hydration.goal')}</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden" style={{ backgroundColor: 'var(--border-main)' }}>
              <div 
                className="h-full bg-blue-500 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, ((waterStats?.today || 0) / 8) * 100)}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-4">
              {[...Array(8)].map((_, i) => (
                <button 
                  key={i} 
                  onClick={() => handleLogWater(i + 1)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs transition-transform transform hover:scale-110 ${i < (waterStats?.today || 0) ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 shadow-inner' : 'bg-slate-50 text-slate-300 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-600'}`}
                >
                  💧
                </button>
              ))}
            </div>
          </div>

          {/* Tip Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-xl shadow-indigo-200 dark:shadow-none">
            <h4 className="font-black text-sm uppercase tracking-widest mb-4 opacity-80">{t('health.tips.title')}</h4>
            <p className="text-lg font-bold leading-tight">
              "{t('health.tips.waterFact')}"
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold bg-white/20 w-fit px-3 py-1 rounded-full">
              <span>🧠</span> {t('health.tips.cognitiveBoost')}
            </div>
          </div>
        </div>

        {/* Right: Intelligence Center */}
        <div className="lg:col-span-8">
          <SmartReports 
            reports={reports} 
            onGenerate={handleGenerateReport} 
            loading={reportLoading} 
            error={reportError}
          />
        </div>
      </div>
    </div>
  );
}
