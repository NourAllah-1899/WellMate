import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext.jsx';

const HealthSettings = ({ currentGoal, currentType, onUpdate }) => {
  const { t } = useLanguage();
  const [goal, setGoal] = useState(currentGoal || 0);
  const [type, setType] = useState(currentType || 'maintain');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentGoal) setGoal(currentGoal);
    if (currentType) setType(currentType);
  }, [currentGoal, currentType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ calorieGoal: parseInt(goal), goalType: type });
    setIsOpen(false);
  };

  const goalTypes = [
    { id: 'lose', label: t('health.settings.lose'), icon: '📉' },
    { id: 'maintain', label: t('health.settings.maintain'), icon: '⚖️' },
    { id: 'gain', label: t('health.settings.gain'), icon: '📈' },
  ];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-sm transition-all duration-300 shadow-lg hover:shadow-indigo-200/50 ${
          isOpen 
          ? 'bg-indigo-600 text-white shadow-indigo-200' 
          : 'bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700'
        }`}
      >
        <span className={`${isOpen ? 'animate-spin-slow' : ''}`}>⚙️</span>
        {t('health.settings.title')}
        <span className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>⌄</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[320px] md:w-[480px] z-50 animate-wm-fade-in">
          <div className="wm-panel shadow-2xl border-indigo-100 dark:border-indigo-900/50 overflow-hidden bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-6 pt-2">
              {t('health.settings.title')}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Goal Selection */}
              <div>
                <label className="block text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-wider">
                  {t('health.settings.goalType')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {goalTypes.map((gt) => (
                    <button
                      key={gt.id}
                      type="button"
                      onClick={() => setType(gt.id)}
                      className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group ${
                        type === gt.id 
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 shadow-inner' 
                        : 'border-transparent bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <span className="text-xl group-hover:scale-110 transition-transform">{gt.icon}</span>
                      <span className={`text-[10px] font-black uppercase ${type === gt.id ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>
                        {gt.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Calorie Input */}
              <div>
                <div className="flex justify-between items-end mb-3">
                  <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    {t('health.settings.calorieGoal')}
                  </label>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">kcal / jour</span>
                </div>
                <div className="relative group">
                  <input
                    type="number"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    className="wm-input mt-0 text-2xl font-black h-16 px-6 bg-slate-50 dark:bg-slate-800/50 border-transparent focus:border-indigo-500 transition-all rounded-3xl"
                    placeholder="2000"
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity">
                    🔥
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)} 
                  className="px-6 py-4 rounded-2xl font-bold text-sm bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button 
                  type="submit" 
                  className="flex-1 py-4 rounded-2xl font-black text-sm bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all transform active:scale-95"
                >
                  {t('common.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HealthSettings;
