import React, { useState } from 'react';
import { exportApi } from '../services/api';
import { useStore } from '../store/useStore';
import { Download, FileSpreadsheet, ChevronRight, ChevronLeft, Loader2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Step7Export() {
  const { testCases, storyDetail, analysis, gaps, nextStep, prevStep } = useStore();
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      await exportApi.downloadExcel({
        storyKey: storyDetail?.key,
        summary: storyDetail?.summary,
        testCases,
        acceptanceCriteria: storyDetail?.acceptanceCriteria,
      });
      setDone(true);
      toast.success('Excel file downloaded!');
    } catch (e) {
      toast.error('Export failed: ' + (e.message || 'Unknown error'));
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Export Reports</h1>
        <p className="text-slate-400 mt-1">Download your test artifacts</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Excel Export */}
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-green-900/30 flex items-center justify-center">
              <FileSpreadsheet size={24} className="text-green-400" />
            </div>
            <div>
              <div className="font-semibold text-white">Traceability Matrix</div>
              <div className="text-xs text-slate-400">Excel (.xlsx) with 3 sheets</div>
            </div>
          </div>
          <ul className="text-xs text-slate-400 space-y-1">
            <li>✓ Cover sheet with metadata</li>
            <li>✓ Traceability matrix (color-coded)</li>
            <li>✓ Test cases with full steps</li>
            <li>✓ Summary statistics</li>
          </ul>
          <button
            onClick={handleExportExcel}
            disabled={exporting || testCases.length === 0}
            className="btn-primary w-full justify-center"
          >
            {exporting
              ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
              : done
              ? <><CheckCircle2 size={16} /> Downloaded!</>
              : <><Download size={16} /> Download Excel</>
            }
          </button>
        </div>

        {/* Summary card */}
        <div className="card space-y-3">
          <div className="font-semibold text-white">Session Summary</div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-slate-300">
              <span>Story</span>
              <span className="font-mono text-brand-400">{storyDetail?.key || '—'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Test Cases</span>
              <span className="text-green-400 font-semibold">{testCases.length}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Gaps Found</span>
              <span className="text-orange-400">
                {(gaps?.missingAcceptanceCriteria?.length || 0) + (gaps?.missingErrorHandling?.length || 0)}
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Ambiguities</span>
              <span className="text-yellow-400">{analysis?.ambiguities?.length || 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} className="btn-primary">
          Generate Automation Code <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
