import React, { useState } from 'react';

const HealthSettings = ({ currentGoal, currentType, onUpdate }) => {
  const [goal, setGoal] = useState(currentGoal || 2000);
  const [type, setType] = useState(currentType || 'maintain');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate({ calorieGoal: parseInt(goal), goalType: type });
    setIsOpen(false);
  };

  return (
    <div className="mb-6">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors flex items-center gap-1"
      >
        <span>⚙️</span> Paramètres de santé
      </button>

      {isOpen && (
        <div className="wm-panel mt-4 shadow-xl animate-wm-fade-in">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Objectif Quotidien (kcal)</label>
              <input
                type="number"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="wm-input mt-0"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-400 uppercase mb-2">Type d'objectif</label>
              <select 
                value={type} 
                onChange={(e) => setType(e.target.value)}
                className="wm-input mt-0"
              >
                <option value="lose">Perte de poids</option>
                <option value="maintain">Maintien</option>
                <option value="gain">Prise de masse</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="wm-btn mt-0 py-3 flex-1">Enregistrer</button>
              <button type="button" onClick={() => setIsOpen(false)} className="wm-btn secondary mt-0 py-3">Annuler</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HealthSettings;
