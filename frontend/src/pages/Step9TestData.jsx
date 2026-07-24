import React from 'react';
import { automationApi } from '../services/api';
import { useStore } from '../store/useStore';
import { Database, ChevronRight, ChevronLeft, Loader2, Download, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Step9TestData() {
  const { testCases, testData, setField, nextStep, prevStep, loading, setLoading } = useStore();
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    setLoading('testdata', true);
    try {
      const { testData: td } = await automationApi.generateTestData({ testCases });
      setField('testData', td);
      toast.success('Test data generated');
    } catch (e) {
      toast.error('Generation failed: ' + (e.error || e.message));
    } finally {
      setLoading('testdata', false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([testData], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'test_data.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV downloaded');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(testData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Parse CSV for preview
  const rows = testData ? testData.trim().split('\n').map(r => r.split(',')) : [];
  const headers = rows[0] || [];
  const dataRows = rows.slice(1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Test Data Repository</h1>
        <p className="text-slate-400 mt-1">Generate comprehensive test data sets as CSV</p>
      </div>

      {!testData ? (
        <div className="card text-center py-12 space-y-4">
          <div className="w-16 h-16 rounded-full bg-blue-900/30 flex items-center justify-center mx-auto">
            <Database size={32} className="text-blue-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">Generate Test Data</h3>
            <p className="text-slate-400 text-sm">Creates valid, invalid, and boundary data rows based on your test cases</p>
          </div>
          <button onClick={handleGenerate} disabled={loading.testdata} className="btn-primary mx-auto">
            {loading.testdata ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Database size={16} /> Generate Test Data</>}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn-primary">
              <Download size={16} /> Download CSV
            </button>
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={() => setField('testData', '')} className="ml-auto text-xs text-slate-500 hover:text-slate-300">
              Regenerate
            </button>
          </div>

          {/* Table preview */}
          <div className="card overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-700">
                  {headers.map((h, i) => (
                    <th key={i} className="text-left py-2 px-3 font-medium text-slate-400">{h.trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataRows.map((row, i) => (
                  <tr key={i} className={`border-b border-slate-700/30 ${i % 2 === 0 ? '' : 'bg-slate-800/20'}`}>
                    {row.map((cell, j) => (
                      <td key={j} className="py-2 px-3 text-slate-300">{cell.trim()}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-500">{dataRows.length} rows · {headers.length} columns</p>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} className="btn-primary">CI/CD Setup <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
