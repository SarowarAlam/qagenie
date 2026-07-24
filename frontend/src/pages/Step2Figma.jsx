import React, { useState } from 'react';
import { figmaApi } from '../services/api';
import { useStore } from '../store/useStore';
import { Link, Layers, ChevronRight, ChevronLeft, Loader2, Image } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Step2Figma() {
  const { figmaUrl, figmaMetadata, setField, nextStep, prevStep, loading, setLoading } = useStore();
  const [localUrl, setLocalUrl] = useState(figmaUrl || '');

  const handleConnect = async () => {
    if (!localUrl.trim()) { toast.error('Enter a Figma URL or File ID'); return; }
    setLoading('figma', true);
    try {
      const [{ metadata }, { texts }] = await Promise.all([
        figmaApi.getMetadata(localUrl),
        figmaApi.getTextContent(localUrl).catch(() => ({ texts: [] })),
      ]);
      setField('figmaUrl', localUrl);
      setField('figmaMetadata', metadata);
      setField('figmaTexts', texts);
      toast.success(`Connected: ${metadata.fileName}`);
    } catch (e) {
      toast.error('Figma connection failed: ' + (e.error || e.message));
    } finally {
      setLoading('figma', false);
    }
  };

  const handleSkip = () => {
    setField('figmaUrl', '');
    setField('figmaMetadata', null);
    nextStep();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Figma Design Integration</h1>
        <p className="text-slate-400 mt-1">Link your Figma design to enrich test case generation with UI context</p>
      </div>

      <div className="card space-y-4">
        <div className="flex items-center gap-2">
          <Link size={16} className="text-brand-400" />
          <span className="font-medium text-slate-200">Connect Figma File</span>
        </div>
        <div>
          <label className="label">Figma URL or File ID</label>
          <div className="flex gap-2">
            <input
              className="input flex-1"
              placeholder="https://www.figma.com/file/XXXX/My-Design or just the file ID"
              value={localUrl}
              onChange={e => setLocalUrl(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleConnect()}
            />
            <button onClick={handleConnect} disabled={loading.figma} className="btn-primary whitespace-nowrap">
              {loading.figma ? <Loader2 size={16} className="animate-spin" /> : <Link size={16} />}
              {loading.figma ? 'Connecting...' : 'Connect'}
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Requires FIGMA_ACCESS_TOKEN in backend .env. Get it from Figma Account → Personal Access Tokens.
          </p>
        </div>
      </div>

      {figmaMetadata && (
        <div className="card space-y-4">
          <div className="flex items-center gap-3">
            {figmaMetadata.thumbnailUrl && (
              <img src={figmaMetadata.thumbnailUrl} alt="thumbnail" className="w-16 h-16 object-cover rounded-lg bg-slate-800" />
            )}
            <div>
              <div className="font-semibold text-white">{figmaMetadata.fileName}</div>
              <div className="text-sm text-slate-400">v{figmaMetadata.version} · Modified {new Date(figmaMetadata.lastModified).toLocaleDateString()}</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-brand-400">{figmaMetadata.pages?.length || 0}</div>
              <div className="text-xs text-slate-400">Pages</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-green-400">{figmaMetadata.frames?.length || 0}</div>
              <div className="text-xs text-slate-400">Frames</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-purple-400">{useStore.getState().figmaTexts?.length || 0}</div>
              <div className="text-xs text-slate-400">Text Nodes</div>
            </div>
          </div>

          {figmaMetadata.pages?.length > 0 && (
            <div>
              <div className="label">Pages</div>
              <div className="flex gap-2 flex-wrap">
                {figmaMetadata.pages.map(p => (
                  <span key={p.id} className="badge bg-slate-700 text-slate-300">
                    {p.name} ({p.frameCount} frames)
                  </span>
                ))}
              </div>
            </div>
          )}

          {figmaMetadata.frames?.slice(0, 10).length > 0 && (
            <div>
              <div className="label">Key Frames</div>
              <div className="flex gap-2 flex-wrap">
                {figmaMetadata.frames.slice(0, 10).map(f => (
                  <span key={f.id} className="badge bg-slate-800 text-slate-400 border border-slate-700">
                    <Layers size={10} className="mr-1" />{f.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={prevStep} className="btn-secondary">
          <ChevronLeft size={16} /> Back
        </button>
        {figmaMetadata ? (
          <button onClick={nextStep} className="btn-primary">
            Continue with Figma <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSkip} className="btn-secondary">
            Skip Figma <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
