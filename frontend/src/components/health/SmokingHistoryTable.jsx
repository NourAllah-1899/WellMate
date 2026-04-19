import React from 'react';

export default function SmokingHistoryTable({ entries, onDelete }) {
  if (!entries || entries.length === 0) {
    return (
      <div className="wm-card text-center py-24 flex flex-col items-center justify-center h-full border border-dashed border-slate-300">
        <div className="bg-slate-50 p-4 rounded-full mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-500 font-medium text-lg">Aucune donnée de tabagisme disponible.</p>
        <p className="text-slate-400 text-sm mt-1">Aucun enregistrement n'a été trouvé.</p>
      </div>
    );
  }

  // Sort by date descending
  const sortedEntries = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="wm-card h-full flex flex-col">
      <h2 className="text-xl font-bold mb-4 text-slate-800 border-b border-slate-100 pb-2">Historique récent</h2>
      
      <div className="overflow-x-auto flex-grow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-slate-100 bg-slate-50/50">
              <th className="py-3 px-4 text-sm font-bold text-slate-600 rounded-tl-lg">Date</th>
              <th className="py-3 px-4 text-sm font-bold text-slate-600 text-center">Quantité</th>
              <th className="py-3 px-4 text-sm font-bold text-slate-600">Note</th>
              <th className="py-3 px-4 text-sm font-bold text-slate-600 text-right rounded-tr-lg">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEntries.map((entry) => (
              <tr key={entry.id} className="border-b border-slate-100 last:border-0 hover:bg-indigo-50/30 transition-colors">
                <td className="py-4 px-4 text-slate-700 font-medium">
                  {new Date(entry.date).toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-flex items-center justify-center bg-indigo-100 text-indigo-700 font-bold px-3 py-1 rounded-full text-sm">
                    {entry.count}
                  </span>
                </td>
                <td className="py-4 px-4 text-slate-500 text-sm max-w-[200px] truncate" title={entry.note}>
                  {entry.note || <span className="text-slate-300 italic">Aucune note</span>}
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg font-medium text-sm transition-colors border border-transparent hover:border-red-100"
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
