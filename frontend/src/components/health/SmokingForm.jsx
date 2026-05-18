import React, { useState } from 'react';

export default function SmokingForm({ onSubmit }) {
  const [count, setCount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const cigarettesCount = parseInt(count, 10);

    if (isNaN(cigarettesCount) || cigarettesCount < 0) {
      setError('Le nombre de cigarettes ne peut pas être négatif.');
      return;
    }

    if (cigarettesCount > 100) {
      setError('Valeur inhabituelle. Veuillez entrer un nombre réaliste (max 100).');
      return;
    }
    
    onSubmit({
      count: cigarettesCount,
      date,
      note
    });
    setCount('');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="wm-card h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-800 border-b border-slate-100 pb-2">Ajouter une entrée</h2>
      
      <form onSubmit={handleSubmit} className="wm-form flex flex-col flex-grow">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-3 mb-4 rounded shadow-sm flex items-center gap-2">
            <span className="text-lg">⚠️</span>
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <label className="wm-field !mt-0 mb-4">
          <span className="block mb-2 text-slate-700">Nombre de cigarettes</span>
          <input
            type="number"
            min="0"
            max="101"
            className={`wm-input hover:border-indigo-300 ${error ? 'border-red-400 focus:border-red-500' : ''}`}
            value={count}
            onChange={(e) => {
              setCount(e.target.value);
              if (error) setError('');
            }}
            required
            placeholder="Ex: 5"
          />
        </label>
        
        <label className="wm-field mb-4">
          <span className="block mb-2 text-slate-700">Date</span>
          <input
            type="date"
            className="wm-input hover:border-indigo-300"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </label>

        <label className="wm-field mb-6">
          <span className="block mb-2 text-slate-700">Note (optionnelle)</span>
          <input
            type="text"
            className="wm-input hover:border-indigo-300"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Contexte, humeur, moment..."
          />
        </label>

        <div className="mt-auto">
          <button type="submit" className="wm-btn hover:shadow-lg transition-shadow">
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
}
