import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import api from '../../api/client.js';
import { useLanguage } from '../../context/LanguageContext.jsx';

const WeeklyCharts = () => {
  const { t } = useLanguage();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/health/weekly-chart-stats');
        // Format dates for display (e.g., "Mon", "Tue")
        const formattedData = res.data.data.map(item => ({
          ...item,
          dayLabel: new Date(item.date).toLocaleDateString(undefined, { weekday: 'short' })
        }));
        setData(formattedData);
      } catch (err) {
        console.error('Failed to fetch weekly stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 mt-6">
      {/* Calories Chart */}
      <div className="wm-card p-4">
        <h3 className="font-bold mb-4 text-orange-500">🍽️ Calories Consommées (kcal)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="dayLabel" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="calories" name="Calories" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Sports Chart */}
      <div className="wm-card p-4">
        <h3 className="font-bold mb-4 text-blue-500">🏃‍♂️ Activité Physique (min)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="dayLabel" stroke="var(--text-muted)" fontSize={12} />
              <YAxis stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Bar dataKey="sportDuration" name="Sport (min)" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Weight Chart */}
      <div className="wm-card p-4">
        <h3 className="font-bold mb-4 text-emerald-500">⚖️ Évolution du Poids (kg)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
              <XAxis dataKey="dayLabel" stroke="var(--text-muted)" fontSize={12} />
              <YAxis domain={['auto', 'auto']} stroke="var(--text-muted)" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)', borderRadius: '12px' }}
                itemStyle={{ color: 'var(--text-primary)' }}
              />
              <Line type="monotone" dataKey="weight" name="Poids (kg)" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#10b981' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default WeeklyCharts;
