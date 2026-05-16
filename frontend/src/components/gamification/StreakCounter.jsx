import React from 'react';

export default function StreakCounter({ streak }) {
  const currentStreak = streak?.currentStreak || 0;
  const bestStreak = streak?.bestStreak || 0;

  return (
    <div className="wm-card p-6 relative overflow-hidden bg-gradient-to-br from-orange-500 to-rose-500 text-white shadow-xl shadow-rose-200 dark:shadow-none border-none">
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl"></div>
      <div className="relative z-10 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase tracking-widest opacity-80 mb-1">
            Série Actuelle
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-black">{currentStreak}</span>
            <span className="text-lg font-bold opacity-80">jours 🔥</span>
          </div>
        </div>
        <div className="text-right">
          <h3 className="text-xs font-bold uppercase opacity-80 mb-1">
            Meilleure Série
          </h3>
          <div className="text-2xl font-black">{bestStreak}</div>
        </div>
      </div>
    </div>
  );
}
