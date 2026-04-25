import React from 'react';

const NutritionProgress = ({ summary }) => {
  if (!summary) return null;

  const { calorieGoal, caloriesConsumedToday, caloriesRemaining, progressPercentage, goalType } = summary;

  // Circle progress calculations
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  const getGoalLabel = (type) => {
    switch (type) {
      case 'lose': return 'Perte de poids';
      case 'gain': return 'Prise de masse';
      case 'maintain': return 'Maintien';
      default: return 'Maintien';
    }
  };

  const getProgressColor = () => {
    if (progressPercentage > 100) return 'text-red-500';
    if (progressPercentage > 85) return 'text-amber-500';
    return 'text-indigo-600';
  };

  return (
    <div className="wm-card overflow-hidden">
      <div className="flex flex-col items-center">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span>🥗</span> Bilan Nutritionnel
        </h2>
        
        {/* Circular Progress */}
        <div className="relative flex items-center justify-center mb-6">
          <svg className="w-48 h-48 transform -rotate-90">
            {/* Background Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              fill="transparent"
              className="text-slate-200 dark:text-slate-700/50"
            />
            {/* Progress Circle */}
            <circle
              cx="96"
              cy="96"
              r={radius}
              stroke="currentColor"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className={`${getProgressColor()} transition-all duration-1000 ease-out`}
            />
          </svg>
          
          {/* Center Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center transform rotate-0">
            <span className="text-3xl font-black" style={{ color: 'var(--text-primary)' }}>
              {caloriesConsumedToday}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
              sur {calorieGoal}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 w-full">
          <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Restant</p>
            <p className="text-lg font-bold" style={{ color: caloriesRemaining === 0 ? '#f43f5e' : 'var(--text-primary)' }}>
              {caloriesRemaining} <span className="text-xs font-normal opacity-70">kcal</span>
            </p>
          </div>
          <div className="p-3 rounded-2xl border" style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}>
            <p className="text-[10px] font-black uppercase mb-1" style={{ color: 'var(--text-secondary)' }}>Objectif</p>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {getGoalLabel(goalType)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NutritionProgress;
