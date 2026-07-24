// Step6Traceability.jsx
import React from 'react';
import { useStore } from '../store/useStore';
import { ChevronRight, ChevronLeft, Table2 } from 'lucide-react';
import clsx from 'clsx';

export default function Step6Traceability() {
  const { testCases, storyDetail, nextStep, prevStep } = useStore();
  const grouped = testCases.reduce((acc, tc) => {
    const ref = tc.requirementRef || 'General';
    if (!acc[ref]) acc[ref] = [];
    acc[ref].push(tc);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Traceability Matrix</h1>
        <p className="text-slate-400 mt-1">Story → Requirement → Test Case mapping</p>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-3 text-slate-400 font-medium w-24">Story ID</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium w-28">Req Ref</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium w-24">TC ID</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium">Test Case Title</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium w-24">Type</th>
              <th className="text-left py-3 px-3 text-slate-400 font-medium w-20">Priority</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map((tc, i) => (
              <tr key={tc.id} className={clsx('border-b border-slate-700/30', i % 2 === 0 ? '' : 'bg-slate-800/20')}>
                <td className="py-2.5 px-3 font-mono text-xs text-brand-400">{storyDetail?.key || '—'}</td>
                <td className="py-2.5 px-3 text-xs text-slate-400">{tc.requirementRef || 'General'}</td>
                <td className="py-2.5 px-3 font-mono text-xs text-slate-300">{tc.id}</td>
                <td className="py-2.5 px-3 text-slate-200">{tc.title}</td>
                <td className="py-2.5 px-3">
                  <span className={clsx('badge text-xs',
                    tc.type === 'Positive' ? 'badge-positive' :
                    tc.type === 'Negative' ? 'badge-negative' :
                    tc.type === 'Boundary' ? 'badge-boundary' : 'badge-validation'
                  )}>{tc.type}</span>
                </td>
                <td className="py-2.5 px-3">
                  <span className={clsx('badge text-xs',
                    tc.priority === 'Critical' ? 'badge-critical' :
                    tc.priority === 'High' ? 'badge-high' :
                    tc.priority === 'Medium' ? 'badge-medium' : 'badge-low'
                  )}>{tc.priority}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} className="btn-primary">Export Files <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
