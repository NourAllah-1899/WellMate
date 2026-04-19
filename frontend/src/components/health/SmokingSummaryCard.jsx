import React from 'react';

export default function SmokingSummaryCard({ title, value, subtitle }) {
  return (
    <div className="wm-card flex flex-col items-center justify-center text-center p-6 h-full">
      <h3 className="text-slate-500 font-semibold text-sm uppercase tracking-wider mb-2">{title}</h3>
      <p className="text-5xl font-extrabold text-indigo-700 my-2">{value}</p>
      {subtitle && <p className="text-sm text-slate-400 font-medium mt-2">{subtitle}</p>}
    </div>
  );
}
