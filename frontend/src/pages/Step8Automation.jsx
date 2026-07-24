import React, { useState } from 'react';
import { automationApi } from '../services/api';
import { useStore } from '../store/useStore';
import { Code2, ChevronRight, ChevronLeft, Loader2, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';

function CodeBlock({ code, language = 'text' }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative group">
      <button
        onClick={copy}
        className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors opacity-0 group-hover:opacity-100"
      >
        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} className="text-slate-300" />}
      </button>
      <pre className="bg-slate-950 border border-slate-700/50 rounded-xl p-4 text-xs text-slate-300 font-mono overflow-x-auto max-h-96">
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function Step8Automation() {
  const {
    storyDetail, testCases, figmaMetadata,
    featureFile, stepDefinitions, pageObject,
    setField, nextStep, prevStep, loading, setLoading,
  } = useStore();
  const [framework, setFramework] = useState('java');

  const generate = async (type) => {
    setLoading(type, true);
    try {
      if (type === 'feature') {
        const { featureFile: f } = await automationApi.generateFeature({ summary: storyDetail?.summary, testCases });
        setField('featureFile', f);
        toast.success('Feature file generated');
      } else if (type === 'steps') {
        if (!featureFile) { toast.error('Generate feature file first'); return; }
        const { stepDefinitions: s } = await automationApi.generateStepDefs({ featureFile, framework });
        setField('stepDefinitions', s);
        toast.success('Step definitions generated');
      } else if (type === 'pageobject') {
        const { pageObject: p } = await automationApi.generatePageObject({
          summary: storyDetail?.summary,
          frames: figmaMetadata?.frames,
          framework,
        });
        setField('pageObject', p);
        toast.success('Page object generated');
      }
    } catch (e) {
      toast.error('Generation failed: ' + (e.error || e.message));
    } finally {
      setLoading(type, false);
    }
  };

  const Tab = ({ id, label }) => (
    <button className="px-4 py-2 text-sm text-slate-300 hover:text-white border-b-2 border-transparent hover:border-brand-500 transition-colors">
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Code Generation</h1>
          <p className="text-slate-400 mt-1">Generate Cucumber BDD files, step definitions, and page objects</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-400">Framework:</span>
          {['java', 'python', 'typescript'].map(f => (
            <button key={f} onClick={() => setFramework(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${framework === f ? 'bg-brand-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Cucumber Feature */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-green-400" />
            <span className="font-medium text-slate-200">Cucumber Feature File</span>
          </div>
          <button onClick={() => generate('feature')} disabled={loading.feature} className="btn-primary text-sm py-1.5">
            {loading.feature ? <Loader2 size={14} className="animate-spin" /> : <Code2 size={14} />}
            {featureFile ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {featureFile && <CodeBlock code={featureFile} />}
      </div>

      {/* Step Definitions */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-blue-400" />
            <span className="font-medium text-slate-200">Step Definitions ({framework})</span>
          </div>
          <button onClick={() => generate('steps')} disabled={loading.steps || !featureFile} className="btn-primary text-sm py-1.5">
            {loading.steps ? <Loader2 size={14} className="animate-spin" /> : <Code2 size={14} />}
            {stepDefinitions ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {stepDefinitions && <CodeBlock code={stepDefinitions} />}
        {!featureFile && <p className="text-xs text-slate-500">Generate feature file first</p>}
      </div>

      {/* Page Object */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 size={16} className="text-purple-400" />
            <span className="font-medium text-slate-200">Page Object Model ({framework})</span>
          </div>
          <button onClick={() => generate('pageobject')} disabled={loading.pageobject} className="btn-primary text-sm py-1.5">
            {loading.pageobject ? <Loader2 size={14} className="animate-spin" /> : <Code2 size={14} />}
            {pageObject ? 'Regenerate' : 'Generate'}
          </button>
        </div>
        {pageObject && <CodeBlock code={pageObject} />}
      </div>

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary"><ChevronLeft size={16} /> Back</button>
        <button onClick={nextStep} className="btn-primary">Generate Test Data <ChevronRight size={16} /></button>
      </div>
    </div>
  );
}
