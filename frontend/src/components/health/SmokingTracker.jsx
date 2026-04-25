import React, { useState } from 'react';

const SmokingTracker = ({ stats, onLog }) => {
  const [count, setCount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!count || isNaN(count)) return;
    
    setLoading(true);
    await onLog(parseInt(count));
    setCount('');
    setLoading(false);
  };

  const getWarningMessage = () => {
    if (!stats) return null;
    if (stats.today === 0 && stats.yesterday > 0) {
      return { 
        type: 'success', 
        text: 'Incroyable ! Une journée sans tabac. Continuez comme ça ! 🎉',
        fact: 'Après 24h sans fumer, le risque de crise cardiaque commence déjà à diminuer.'
      };
    }
    if (stats.trend === 'increase') {
      return { 
        type: 'error', 
        text: 'Attention, vous fumez plus qu\'hier. Votre santé est en jeu ! ⚠️',
        fact: 'Le tabac est responsable de 90% des cancers du poumon.'
      };
    }
    if (stats.trend === 'decrease') {
      return { 
        type: 'success', 
        text: 'Bien joué ! Vous avez réduit votre consommation. Un pas vers la liberté ! 📈',
        fact: 'Moins fumer réduit immédiatement la pression artérielle.'
      };
    }
    return {
      type: 'info',
      text: 'Chaque cigarette évitée est une victoire pour vos poumons.',
      fact: 'Le tabac contient plus de 7000 substances chimiques, dont 70 sont cancérigènes.'
    };
  };

  const warning = getWarningMessage();

  return (
    <div className="wm-card">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
        <span>🚭</span> Suivi Tabagisme
      </h2>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
            placeholder="Cigarettes aujourd'hui"
            className="wm-input mt-0 flex-1"
          />
          <button 
            type="submit" 
            disabled={loading}
            className="wm-btn mt-0 w-auto px-6 whitespace-nowrap bg-brand-primary hover:bg-brand-primary/90"
          >
            {loading ? '...' : 'Valider'}
          </button>
        </div>
      </form>

      {/* Stats Mini Grid */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Aujourd'hui", value: stats?.today || 0 },
          { label: "Semaine", value: stats?.weekly || 0 },
          { label: "Mois", value: stats?.monthly || 0 },
        ].map((item, idx) => (
          <div key={idx} className="text-center p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>{item.label}</p>
            <p className="text-xl font-black" style={{ color: 'var(--text-primary)' }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Warning Box */}
      {warning && (
        <div className={`p-4 rounded-2xl border-l-4 ${
          warning.type === 'success' ? 'bg-emerald-50 border-emerald-500 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300' :
          warning.type === 'error' ? 'bg-rose-50 border-rose-500 text-rose-800 dark:bg-rose-900/20 dark:text-rose-300' :
          'bg-blue-50 border-blue-500 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300'
        }`}>
          <p className="font-bold text-sm mb-1">{warning.text}</p>
          <p className="text-[11px] opacity-80 italic leading-relaxed">💡 {warning.fact}</p>
        </div>
      )}
    </div>
  );
};

export default SmokingTracker;
