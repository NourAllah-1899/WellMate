import React from 'react';

const SmartReports = ({ reports, onGenerate, loading, error }) => {
  return (
    <div className="wm-card h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2" style={{ color: 'var(--text-heading)' }}>
          <span>🧠</span> Bilans Intelligents
        </h2>
        <div className="flex gap-2">
          <button 
            onClick={() => onGenerate('daily')}
            disabled={loading}
            className="text-[10px] font-black px-4 py-2 bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-xl hover:bg-indigo-100 transition-all uppercase tracking-widest border border-indigo-100 dark:border-indigo-800/50 disabled:opacity-50"
          >
            {loading ? '...' : 'Analyse Jour'}
          </button>
          <button 
            onClick={() => onGenerate('weekly')}
            disabled={loading}
            className="text-[10px] font-black px-4 py-2 bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-400 rounded-xl hover:bg-slate-100 transition-all uppercase tracking-widest border border-slate-100 dark:border-slate-700/50 disabled:opacity-50"
          >
            Semaine
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl text-sm font-bold border border-red-200 dark:border-red-800/50">
          ⚠️ {error}
        </div>
      )}

      <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {reports.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center h-full">
            <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center text-4xl mb-6 shadow-inner">
              ✨
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-heading)' }}>Votre premier bilan</h3>
            <p className="text-sm max-w-sm mx-auto leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
              L'IA WellMate est prête à analyser vos données (repas, sport, tabac) pour vous fournir des conseils personnalisés.
            </p>
            <button 
              onClick={() => onGenerate('daily')}
              className="wm-btn mt-0 w-auto flex items-center gap-2 justify-center shadow-lg"
            >
              <span>Générer mon bilan du jour</span>
              <span>🚀</span>
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <div className="text-center">
              <p className="text-sm font-black text-indigo-600 dark:text-indigo-400 animate-pulse uppercase tracking-widest">Analyse en cours</p>
              <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>L'IA consulte vos données de santé...</p>
            </div>
          </div>
        )}

        {reports.map((report) => (
          <div 
            key={report.id} 
            className="p-6 rounded-2xl border transition-all group"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border-main)' }}
          >
            <div className="flex justify-between items-center mb-4">
              <span className={`text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-wider ${
                report.report_type === 'daily' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
              }`}>
                {report.report_type === 'daily' ? 'Analyse Quotidienne' : 'Analyse Hebdomadaire'}
              </span>
              <span className="text-[10px] font-bold group-hover:text-slate-600 transition-colors" style={{ color: 'var(--text-muted)' }}>
                {new Date(report.generated_at).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>
              {report.content.split('\n').map((line, i) => {
                if (line.trim().startsWith('- ')) {
                  return (
                    <li key={i} className="ml-4 list-disc mt-1 opacity-90">
                      {line.substring(2).split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                        part.startsWith('**') && part.endsWith('**') ? <strong key={idx} className="font-black">{part.slice(2, -2)}</strong> : <span key={idx}>{part}</span>
                      )}
                    </li>
                  );
                }
                return (
                  <p key={i} className={line.trim() === '' ? 'mt-4' : 'mt-1'}>
                    {line.split(/(\*\*.*?\*\*)/g).map((part, idx) => 
                      part.startsWith('**') && part.endsWith('**') ? <strong key={idx} className="font-black">{part.slice(2, -2)}</strong> : <span key={idx}>{part}</span>
                    )}
                  </p>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartReports;
