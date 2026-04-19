import React, { useState } from 'react';
import SmokingSummaryCard from '../components/health/SmokingSummaryCard';
import SmokingForm from '../components/health/SmokingForm';
import SmokingHistoryTable from '../components/health/SmokingHistoryTable';

export default function Health() {
  // Placeholder data for structure to allow easy backend integration later
  const [entries, setEntries] = useState([]);

  const handleAddEntry = (newEntry) => {
    const entry = {
      ...newEntry,
      id: Date.now().toString()
    };
    // In a real implementation, you would POST this to the backend
    setEntries([entry, ...entries]);
  };

  const handleDeleteEntry = (id) => {
    // In a real implementation, you would DELETE this from the backend
    setEntries(entries.filter(e => e.id !== id));
  };

  // Calculations for summaries
  const todayStr = new Date().toISOString().split('T')[0];
  const todayCount = entries
    .filter(e => e.date === todayStr)
    .reduce((sum, e) => sum + e.count, 0);

  const lastWeek = new Date();
  lastWeek.setDate(lastWeek.getDate() - 7);
  const weekCount = entries
    .filter(e => new Date(e.date) >= lastWeek)
    .reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="wm-container space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">Santé</h1>
        <p className="wm-subtitle text-lg mt-2">Suivi des habitudes de santé liées au tabagisme</p>
      </div>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SmokingSummaryCard 
          title="Aujourd'hui" 
          value={todayCount} 
          subtitle="Cigarettes consommées" 
        />
        <SmokingSummaryCard 
          title="Cette semaine" 
          value={weekCount} 
          subtitle="Sur les 7 derniers jours" 
        />
        <SmokingSummaryCard 
          title="Tendance" 
          value={todayCount === 0 ? "Nulle" : todayCount > 5 ? "Élevée" : "Stable"} 
          subtitle="Estimation d'évolution" 
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <SmokingForm onSubmit={handleAddEntry} />
        </div>
        <div className="lg:col-span-2">
          <SmokingHistoryTable entries={entries} onDelete={handleDeleteEntry} />
        </div>
      </div>
    </div>
  );
}
