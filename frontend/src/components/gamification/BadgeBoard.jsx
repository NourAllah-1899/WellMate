import React from 'react';

export default function BadgeBoard({ badges }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="wm-card p-6 text-center text-slate-500">
        Aucun badge disponible pour le moment.
      </div>
    );
  }

  return (
    <div className="wm-card p-6">
      <h3 className="font-bold text-lg mb-6 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
        <span>🏆</span> Tableau des Trophées
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className={`relative p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 ${
              badge.earned
                ? 'bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 shadow-sm border border-indigo-100 dark:border-indigo-800/50 hover:shadow-md hover:-translate-y-1'
                : 'bg-slate-50 dark:bg-slate-800/50 opacity-60 grayscale hover:grayscale-0 hover:opacity-100'
            }`}
          >
            <div className="text-4xl mb-3 drop-shadow-sm">
              {badge.icon || '🏅'}
            </div>
            <h4 className="font-bold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>
              {badge.title}
            </h4>
            <p className="text-xs font-medium opacity-70" style={{ color: 'var(--text-secondary)' }}>
              {badge.description}
            </p>
            {badge.earned && badge.earned_at && (
              <div className="mt-3 text-[10px] font-bold uppercase tracking-wider text-indigo-500 bg-indigo-100 dark:bg-indigo-900/40 px-2 py-1 rounded-full">
                Obtenu le {new Date(badge.earned_at).toLocaleDateString()}
              </div>
            )}
            {!badge.earned && (
              <div className="absolute top-2 right-2 text-xs opacity-50">
                🔒
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
