import React from 'react';
import { analysisApi } from '../services/api';
import { useStore } from '../store/useStore';
import { Brain, ChevronRight, ChevronLeft, Loader2, AlertTriangle, CheckCircle2, HelpCircle, Layers } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Step3Analysis() {
  const { storyDetail, figmaTexts, figmaMetadata, analysis, setField, nextStep, prevStep, loading, setLoading } = useStore();

  const handleAnalyze = async () => {
    if (!storyDetail) { toast.error('No story selected. Go back to Step 1.'); return; }
    setLoading('analysis', true);
    try {
      const figmaContext = figmaMetadata
        ? `File: ${figmaMetadata.fileName}\nFrames: ${figmaMetadata.frames?.map(f => f.name).join(', ')}\nUI Texts: ${figmaTexts?.slice(0, 30).map(t => t.content).join('; ')}`
        : null;
      const { analysis: result } = await analysisApi.analyzeRequirements({
        summary: storyDetail.summary,
        description: storyDetail.description,
        acceptanceCriteria: storyDetail.acceptanceCriteria,
        figmaContext,
      });
      setField('analysis', result);
      toast.success('Analysis complete');
    } catch (e) {
      toast.error('Analysis failed: ' + (e.error || e.message));
    } finally {
      setLoading('analysis', false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">AI Requirement Analysis</h1>
        <p className="text-slate-400 mt-1">Claude AI analyzes your requirements and extracts structured insights</p>
      </div>

      {!analysis ? (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-brand-900/50 flex items-center justify-center mx-auto">
            <Brain size={32} className="text-brand-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Ready to Analyze</h3>
            <p className="text-slate-400 text-sm mt-1">
              Story: <span className="text-brand-400">{storyDetail?.key || 'None selected'}</span>
              {figmaMetadata && <> · Figma: <span className="text-purple-400">{figmaMetadata.fileName}</span></>}
            </p>
          </div>
          <button onClick={handleAnalyze} disabled={loading.analysis || !storyDetail} className="btn-primary mx-auto">
            {loading.analysis ? <><Loader2 size={16} className="animate-spin" /> Analyzing...</> : <><Brain size={16} /> Run AI Analysis</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Requirement Summary */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <CheckCircle2 size={16} className="text-green-400" /> Requirement Summary
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">{analysis.requirementSummary}</p>
          </div>

          {/* User Flow */}
          <div className="card space-y-3">
            <div className="flex items-center gap-2 font-medium text-slate-200">
              <Layers size={16} className="text-brand-400" /> User Flow
            </div>
            <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{analysis.userFlowSummary}</p>
          </div>

          {/* Assumptions */}
          {analysis.assumptions?.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <CheckCircle2 size={16} className="text-yellow-400" /> Assumptions ({analysis.assumptions.length})
              </div>
              <ul className="space-y-1">
                {analysis.assumptions.map((a, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-yellow-400 flex-shrink-0">•</span>
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ambiguities */}
          {analysis.ambiguities?.length > 0 && (
            <div className="card space-y-3">
              <div className="flex items-center gap-2 font-medium text-slate-200">
                <HelpCircle size={16} className="text-orange-400" /> Ambiguities ({analysis.ambiguities.length})
              </div>
              <div className="space-y-2">
                {analysis.ambiguities.map((amb, i) => (
                  <div key={i} className="flex gap-3 p-3 bg-slate-800/50 rounded-lg">
                    <span className={clsx('badge flex-shrink-0',
                      amb.impact === 'High' ? 'badge-high' : amb.impact === 'Medium' ? 'badge-medium' : 'badge-low'
                    )}>{amb.impact}</span>
                    <div>
                      <div className="text-sm font-medium text-slate-200">{amb.area}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{amb.question}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button onClick={() => setField('analysis', null)} className="text-xs text-slate-500 hover:text-slate-300">
            Re-run analysis
          </button>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} disabled={!analysis} className="btn-primary">
          Continue to Gap Analysis <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
