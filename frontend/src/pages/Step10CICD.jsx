import React, { useState } from 'react';
import { automationApi } from '../services/api';
import { useStore } from '../store/useStore';
import { GitBranch, ChevronLeft, Loader2, Download, Copy, Check, Workflow } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Step10CICD() {
  const { storyDetail, testCases, cicdTemplate, cicdFilename, setField, prevStep, loading, setLoading } = useStore();
  const [ciType, setCiType] = useState('github');
  const [copied, setCopied] = useState(false);
  const [generated, setGenerated] = useState(false);

  const handleGenerate = async () => {
    setLoading('cicd', true);
    try {
      const { template, filename } = await automationApi.generateCICD({
        type: ciType,
        projectName: storyDetail?.key || 'QAProject',
        framework: 'Java/Maven + Cucumber',
      });
      setField('cicdTemplate', template);
      setField('cicdFilename', filename);
      setGenerated(true);
      toast.success(`${ciType === 'github' ? 'GitHub Actions' : 'Jenkinsfile'} generated`);
    } catch (e) {
      toast.error('Generation failed: ' + (e.error || e.message));
    } finally {
      setLoading('cicd', false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([cicdTemplate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = cicdFilename || 'pipeline.yml'; a.click();
    URL.revokeObjectURL(url);
    toast.success('File downloaded');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(cicdTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">CI/CD Pipeline Template</h1>
        <p className="text-slate-400 mt-1">Generate a complete CI/CD pipeline to run your automated tests</p>
      </div>

      <div className="card space-y-4">
        <div className="font-medium text-slate-200">Choose CI/CD Platform</div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { id: 'github', name: 'GitHub Actions', desc: 'pipeline.yml in .github/workflows/', color: 'text-purple-400', selBg: 'bg-purple-900/20 border-purple-700' },
            { id: 'jenkins', name: 'Jenkins', desc: 'Declarative Jenkinsfile', color: 'text-orange-400', selBg: 'bg-orange-900/20 border-orange-700' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => { setCiType(opt.id); setGenerated(false); setField('cicdTemplate', ''); }}
              className={`p-4 rounded-xl border-2 text-left transition-all ${ciType === opt.id ? opt.selBg : 'bg-slate-800 border-slate-700/50 hover:border-slate-600'}`}
            >
              <Workflow size={24} className={`${opt.color} mb-2`} />
              <div className="font-semibold text-white text-sm">{opt.name}</div>
              <div className="text-xs text-slate-400 mt-0.5">{opt.desc}</div>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-3 text-xs text-slate-400">
          {[
            'Code quality gate','Unit tests','API tests',
            'E2E browser tests','Multi-browser matrix','Slack notifications',
            'Allure reports','Artifact uploads','Parameterized runs',
          ].map(f => (
            <div key={f} className="flex items-center gap-1.5"><span className="text-green-400">✓</span> {f}</div>
          ))}
        </div>

        <button onClick={handleGenerate} disabled={loading.cicd} className="btn-primary">
          {loading.cicd
            ? <><Loader2 size={16} className="animate-spin" /> Generating...</>
            : <><GitBranch size={16} /> Generate {ciType === 'github' ? 'GitHub Actions' : 'Jenkinsfile'}</>
          }
        </button>
      </div>

      {cicdTemplate && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <button onClick={handleDownload} className="btn-primary">
              <Download size={16} /> Download {cicdFilename}
            </button>
            <button onClick={handleCopy} className="btn-secondary">
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <pre className="bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-[500px]">
            <code>{cicdTemplate}</code>
          </pre>
        </div>
      )}

      {generated && (
        <div className="card bg-green-900/20 border-green-700/50 space-y-3">
          <div className="font-semibold text-green-300">🎉 QAGenie Pipeline Complete!</div>
          <p className="text-sm text-slate-300">
            Complete QA artifact suite generated for <span className="text-brand-400 font-mono">{storyDetail?.key}</span>:
          </p>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>✅ Requirements &amp; gap analysis</li>
            <li>✅ {testCases.length} test cases with traceability matrix</li>
            <li>✅ Cucumber feature file + step definitions + page objects</li>
            <li>✅ Test data CSV</li>
            <li>✅ {ciType === 'github' ? 'GitHub Actions' : 'Jenkins'} CI/CD pipeline</li>
          </ul>
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
      </div>
    </div>
  );
}
