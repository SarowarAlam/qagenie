import React, { useState } from 'react';
import { testgenApi } from '../services/api';
import { useStore } from '../store/useStore';
import { FlaskConical, ChevronRight, ChevronLeft, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const typeBadge = (t) => clsx('badge text-xs',
  t === 'Positive' ? 'badge-positive' :
  t === 'Negative' ? 'badge-negative' :
  t === 'Boundary' ? 'badge-boundary' : 'badge-validation'
);
const prioBadge = (p) => clsx('badge text-xs',
  p === 'Critical' ? 'badge-critical' :
  p === 'High' ? 'badge-high' :
  p === 'Medium' ? 'badge-medium' : 'badge-low'
);

function TestCaseRow({ tc }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-700/50 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/50 transition-colors"
      >
        <span className="font-mono text-xs text-slate-500 w-16 flex-shrink-0">{tc.id}</span>
        <span className="text-sm text-slate-200 flex-1">{tc.title}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className={typeBadge(tc.type)}>{tc.type}</span>
          <span className={prioBadge(tc.priority)}>{tc.priority}</span>
          {open ? <ChevronUp size={14} className="text-slate-500" /> : <ChevronDown size={14} className="text-slate-500" />}
        </div>
      </button>
      {open && (
        <div className="border-t border-slate-700/50 px-4 py-3 bg-slate-900/50 space-y-3">
          {tc.preconditions?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1">Preconditions</div>
              <ul className="space-y-0.5">{tc.preconditions.map((p, i) => <li key={i} className="text-xs text-slate-300">• {p}</li>)}</ul>
            </div>
          )}
          {tc.steps?.length > 0 && (
            <div>
              <div className="text-xs font-medium text-slate-400 mb-1">Steps</div>
              <div className="space-y-1">
                {tc.steps.map((s, i) => (
                  <div key={i} className="flex gap-3 text-xs">
                    <span className="text-brand-400 w-4 flex-shrink-0">{s.stepNo}.</span>
                    <span className="text-slate-300 flex-1">{s.action}</span>
                    <span className="text-green-400 flex-1">→ {s.expectedResult}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div>
            <div className="text-xs font-medium text-slate-400 mb-1">Expected Result</div>
            <p className="text-xs text-slate-300">{tc.expectedResult}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Step5TestCases() {
  const { storyDetail, analysis, gaps, testCases, setField, nextStep, prevStep, loading, setLoading } = useStore();
  const [filter, setFilter] = useState('All');

  const handleGenerate = async () => {
    setLoading('testcases', true);
    try {
      const { testCases: tcs } = await testgenApi.generateTestCases({
        summary: storyDetail.summary,
        description: storyDetail.description,
        acceptanceCriteria: storyDetail.acceptanceCriteria,
        analysis,
        gaps,
      });
      setField('testCases', tcs);
      toast.success(`Generated ${tcs.length} test cases`);
    } catch (e) {
      toast.error('Generation failed: ' + (e.error || e.message));
    } finally {
      setLoading('testcases', false);
    }
  };

  const types = ['All', 'Positive', 'Negative', 'Boundary', 'Validation'];
  const filtered = filter === 'All' ? testCases : testCases.filter(t => t.type === filter);

  const counts = types.slice(1).reduce((acc, t) => {
    acc[t] = testCases.filter(tc => tc.type === t).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Test Case Generation</h1>
        <p className="text-slate-400 mt-1">AI-generated test cases covering all scenarios</p>
      </div>

      {testCases.length === 0 ? (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-green-900/30 flex items-center justify-center mx-auto">
            <FlaskConical size={32} className="text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Generate Test Cases</h3>
            <p className="text-slate-400 text-sm mt-1">AI will create positive, negative, boundary, and validation scenarios</p>
          </div>
          <button onClick={handleGenerate} disabled={loading.testcases} className="btn-primary mx-auto">
            {loading.testcases
              ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
              : <><FlaskConical size={16} /> Generate Test Cases</>
            }
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-5 gap-3">
            {[['Total', testCases.length, 'text-white'], ...Object.entries(counts).map(([k, v]) => [k, v, ''])].map(([label, count, cls]) => (
              <div key={label} className="card text-center py-3">
                <div className={`text-2xl font-bold ${cls || (label === 'Positive' ? 'text-green-400' : label === 'Negative' ? 'text-red-400' : label === 'Boundary' ? 'text-yellow-400' : 'text-purple-400')}`}>{count}</div>
                <div className="text-xs text-slate-400">{label}</div>
              </div>
            ))}
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)}
                className={clsx('px-3 py-1.5 rounded-lg text-sm transition-colors',
                  filter === t ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                )}>
                {t}
              </button>
            ))}
            <button onClick={() => setField('testCases', [])} className="ml-auto text-xs text-slate-500 hover:text-slate-300">
              Regenerate
            </button>
          </div>

          {/* Test Cases */}
          <div className="space-y-2">
            {filtered.map(tc => <TestCaseRow key={tc.id} tc={tc} />)}
          </div>
        </>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} disabled={testCases.length === 0} className="btn-primary">
          View Traceability Matrix <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
