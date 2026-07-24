import React from 'react';
import { analysisApi } from '../services/api';
import { useStore } from '../store/useStore';
import { AlertTriangle, ChevronRight, ChevronLeft, Loader2, Shield, Navigation, CheckSquare, XSquare } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const GapSection = ({ icon: Icon, title, items, color, renderItem }) => {
  if (!items?.length) return null;
  return (
    <div className="card space-y-3">
      <div className={`flex items-center gap-2 font-medium text-slate-200`}>
        <Icon size={16} className={color} />
        {title}
        <span className={`ml-auto badge bg-slate-700 text-slate-300`}>{items.length}</span>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => renderItem(item, i))}
      </div>
    </div>
  );
};

export default function Step4Gaps() {
  const { storyDetail, analysis, gaps, setField, nextStep, prevStep, loading, setLoading } = useStore();

  const handleAnalyze = async () => {
    setLoading('gaps', true);
    try {
      const { gaps: result } = await analysisApi.analyzeGaps({
        summary: storyDetail.summary,
        description: storyDetail.description,
        acceptanceCriteria: storyDetail.acceptanceCriteria,
        analysis,
      });
      setField('gaps', result);
      toast.success('Gap analysis complete');
    } catch (e) {
      toast.error('Gap analysis failed: ' + (e.error || e.message));
    } finally {
      setLoading('gaps', false);
    }
  };

  const riskColor = { High: 'text-red-400', Medium: 'text-yellow-400', Low: 'text-green-400' };
  const severityBadge = (s) => clsx('badge', s === 'Critical' ? 'badge-critical' : s === 'High' ? 'badge-high' : s === 'Medium' ? 'badge-medium' : 'badge-low');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gap Analysis Report</h1>
        <p className="text-slate-400 mt-1">Identify missing acceptance criteria, validation rules, and error handling</p>
      </div>

      {!gaps ? (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-orange-900/30 flex items-center justify-center mx-auto">
            <AlertTriangle size={32} className="text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Run Gap Analysis</h3>
            <p className="text-slate-400 text-sm mt-1">Find what's missing from your requirements</p>
          </div>
          <button onClick={handleAnalyze} disabled={loading.gaps || !analysis} className="btn-primary mx-auto">
            {loading.gaps ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><AlertTriangle size={16} /> Run Gap Analysis</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Overall Risk */}
          <div className="card flex items-center justify-between">
            <div className="text-slate-300 font-medium">Overall Risk Level</div>
            <span className={`text-2xl font-bold ${riskColor[gaps.overallRiskLevel] || 'text-slate-300'}`}>
              {gaps.overallRiskLevel}
            </span>
          </div>

          {/* Priority Recs */}
          {gaps.priorityRecommendations?.length > 0 && (
            <div className="card space-y-2">
              <div className="font-medium text-slate-200 flex items-center gap-2">
                <Shield size={16} className="text-brand-400" /> Priority Recommendations
              </div>
              <ul className="space-y-1">
                {gaps.priorityRecommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-brand-400">{i + 1}.</span>{r}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <GapSection
            icon={CheckSquare}
            title="Missing Acceptance Criteria"
            items={gaps.missingAcceptanceCriteria}
            color="text-red-400"
            renderItem={(item, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                <div className="flex items-start gap-2">
                  <span className={severityBadge(item.severity)}>{item.severity}</span>
                  <span className="text-sm text-slate-200">{item.item}</span>
                </div>
                {item.suggestion && <p className="text-xs text-slate-400 pl-1">💡 {item.suggestion}</p>}
              </div>
            )}
          />

          <GapSection
            icon={XSquare}
            title="Missing Validation Rules"
            items={gaps.missingValidationRules}
            color="text-orange-400"
            renderItem={(item, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-lg">
                <div className="text-sm text-slate-200 font-medium">{item.field}</div>
                <div className="text-xs text-slate-400 mt-0.5">{item.missingRule}</div>
                {item.example && <div className="text-xs text-brand-400 mt-1">e.g. {item.example}</div>}
              </div>
            )}
          />

          <GapSection
            icon={AlertTriangle}
            title="Missing Error Handling"
            items={gaps.missingErrorHandling}
            color="text-yellow-400"
            renderItem={(item, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-lg space-y-1">
                <div className="flex items-center gap-2">
                  <span className={severityBadge(item.severity)}>{item.severity}</span>
                  <span className="text-sm text-slate-200">{item.scenario}</span>
                </div>
                {item.expectedBehavior && <p className="text-xs text-slate-400">{item.expectedBehavior}</p>}
              </div>
            )}
          />

          <GapSection
            icon={Navigation}
            title="Missing Navigation Paths"
            items={gaps.missingNavigationPaths}
            color="text-purple-400"
            renderItem={(item, i) => (
              <div key={i} className="p-3 bg-slate-800/50 rounded-lg text-sm text-slate-300 flex items-center gap-2">
                <span>{item.from}</span>
                <span className="text-slate-500">→</span>
                <span>{item.to}</span>
                {item.trigger && <span className="text-xs text-slate-500 ml-auto">via: {item.trigger}</span>}
              </div>
            )}
          />

          <button onClick={() => setField('gaps', null)} className="text-xs text-slate-500 hover:text-slate-300">
            Re-run analysis
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} disabled={!gaps} className="btn-primary">
          Generate Test Cases <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
