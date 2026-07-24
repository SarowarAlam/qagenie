import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle, Circle, ChevronRight, Zap, RotateCcw } from 'lucide-react';
import clsx from 'clsx';

const STAGE_LABELS = {
  1: 'Stage 1 — Analysis',
  8: 'Stage 2 — Automation',
};

export default function Layout({ children, steps }) {
  const { currentStep, goToStep, reset, testCases, analysis } = useStore();

  const getStepState = (stepId) => {
    if (stepId < currentStep) return 'done';
    if (stepId === currentStep) return 'active';
    return 'pending';
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* ─── Sidebar ─────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-700/50 flex flex-col">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white text-sm">QAGenie</div>
              <div className="text-xs text-slate-400">AI Test Generator</div>
            </div>
          </div>
        </div>

        {/* Steps */}
        <nav className="flex-1 overflow-y-auto p-3">
          {steps.map((step, idx) => {
            const state = getStepState(step.id);
            const showStageLabel = STAGE_LABELS[step.id];
            return (
              <div key={step.id}>
                {showStageLabel && (
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 pt-4 pb-1">
                    {showStageLabel}
                  </div>
                )}
                <button
                  onClick={() => goToStep(step.id)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all',
                    state === 'active' && 'bg-brand-900/40 text-brand-300 font-medium',
                    state === 'done' && 'text-slate-300 hover:bg-slate-800',
                    state === 'pending' && 'text-slate-500 hover:bg-slate-800/50'
                  )}
                >
                  {state === 'done'
                    ? <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                    : state === 'active'
                    ? <div className="w-4 h-4 rounded-full bg-brand-500 flex-shrink-0 ring-2 ring-brand-500/30" />
                    : <Circle size={16} className="flex-shrink-0 opacity-30" />
                  }
                  <span className="flex-1 text-left">{step.id}. {step.label}</span>
                  {state === 'active' && <ChevronRight size={14} className="text-brand-400" />}
                </button>
              </div>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-slate-700/50">
          <button onClick={reset} className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors">
            <RotateCcw size={13} />
            Reset Session
          </button>
          <div className="mt-2 px-3 text-xs text-slate-600">
            {testCases.length > 0 && <span className="text-green-500">{testCases.length} test cases generated</span>}
          </div>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
