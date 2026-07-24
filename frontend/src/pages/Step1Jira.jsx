import React, { useState, useEffect } from 'react';
import { jiraApi } from '../services/api';
import { useStore } from '../store/useStore';
import { ChevronRight, FolderOpen, Layers, FileText, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

export default function Step1Jira() {
  const {
    selectedProject, selectedEpic, selectedStory, storyDetail,
    setField, nextStep, setLoading, loading,
  } = useStore();

  const [projects, setProjects] = useState([]);
  const [epics, setEpics] = useState([]);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    setLoading('projects', true);
    try {
      const { projects } = await jiraApi.getProjects();
      setProjects(projects);
    } catch (e) {
      toast.error('Failed to load Jira projects: ' + (e.error || e.message));
    } finally {
      setLoading('projects', false);
    }
  };

  const handleProjectSelect = async (project) => {
    setField('selectedProject', project);
    setField('selectedEpic', null);
    setField('selectedStory', null);
    setField('storyDetail', null);
    setEpics([]); setStories([]);
    setLoading('epics', true);
    try {
      const { epics } = await jiraApi.getEpics(project.key);
      setEpics(epics);
    } catch (e) {
      toast.error('Failed to load epics');
    } finally {
      setLoading('epics', false);
    }
  };

  const handleEpicSelect = async (epic) => {
    setField('selectedEpic', epic);
    setField('selectedStory', null);
    setField('storyDetail', null);
    setStories([]);
    setLoading('stories', true);
    try {
      const { stories } = await jiraApi.getStories(epic.key);
      setStories(stories);
    } catch (e) {
      toast.error('Failed to load stories');
    } finally {
      setLoading('stories', false);
    }
  };

  const handleStorySelect = async (story) => {
    setField('selectedStory', story);
    setField('storyDetail', null);
    setLoading('storyDetail', true);
    try {
      const { story: detail } = await jiraApi.getStoryDetail(story.key);
      setField('storyDetail', detail);
      toast.success('Story loaded successfully');
    } catch (e) {
      toast.error('Failed to load story detail');
    } finally {
      setLoading('storyDetail', false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Jira Story Selection</h1>
        <p className="text-slate-400 mt-1">Connect to your Jira project and select a story to analyze</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Projects */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <FolderOpen size={16} className="text-brand-400" />
            Projects
            {loading.projects && <Loader2 size={14} className="animate-spin ml-auto" />}
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => handleProjectSelect(p)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedProject?.id === p.id
                    ? 'bg-brand-700 text-white'
                    : 'hover:bg-slate-800 text-slate-300'
                )}
              >
                <span className="font-mono text-xs text-brand-400">{p.key}</span>
                <br />
                <span className="truncate">{p.name}</span>
              </button>
            ))}
            {!loading.projects && projects.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-4">No projects found</p>
            )}
          </div>
        </div>

        {/* Epics */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <Layers size={16} className="text-purple-400" />
            Epics
            {loading.epics && <Loader2 size={14} className="animate-spin ml-auto" />}
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {epics.map(e => (
              <button
                key={e.id}
                onClick={() => handleEpicSelect(e)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedEpic?.id === e.id
                    ? 'bg-purple-900/50 text-purple-200 border border-purple-700/50'
                    : 'hover:bg-slate-800 text-slate-300'
                )}
              >
                <span className="font-mono text-xs text-purple-400">{e.key}</span>
                <br />
                <span className="truncate text-xs">{e.summary}</span>
              </button>
            ))}
            {!loading.epics && selectedProject && epics.length === 0 && (
              <p className="text-slate-500 text-xs text-center py-4">No epics found</p>
            )}
          </div>
        </div>

        {/* Stories */}
        <div className="card space-y-3">
          <div className="flex items-center gap-2 text-slate-300 font-medium">
            <FileText size={16} className="text-green-400" />
            Stories
            {loading.stories && <Loader2 size={14} className="animate-spin ml-auto" />}
          </div>
          <div className="space-y-1 max-h-72 overflow-y-auto">
            {stories.map(s => (
              <button
                key={s.id}
                onClick={() => handleStorySelect(s)}
                className={clsx(
                  'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors',
                  selectedStory?.id === s.id
                    ? 'bg-green-900/30 text-green-200 border border-green-700/50'
                    : 'hover:bg-slate-800 text-slate-300'
                )}
              >
                <span className="font-mono text-xs text-green-400">{s.key}</span>
                <br />
                <span className="truncate text-xs">{s.summary}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Story Preview */}
      {loading.storyDetail && (
        <div className="card flex items-center gap-3 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          Loading story details...
        </div>
      )}
      {storyDetail && (
        <div className="card space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-green-500" />
                <span className="font-mono text-sm text-brand-400">{storyDetail.key}</span>
              </div>
              <h2 className="text-lg font-semibold text-white mt-1">{storyDetail.summary}</h2>
            </div>
          </div>

          {storyDetail.description && (
            <div>
              <div className="label">Description</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 rounded-lg p-3 max-h-40 overflow-y-auto">
                {storyDetail.description}
              </pre>
            </div>
          )}

          {storyDetail.acceptanceCriteria && (
            <div>
              <div className="label">Acceptance Criteria</div>
              <pre className="text-sm text-slate-300 whitespace-pre-wrap bg-slate-800/50 rounded-lg p-3 max-h-32 overflow-y-auto">
                {storyDetail.acceptanceCriteria}
              </pre>
            </div>
          )}

          {storyDetail.attachments?.length > 0 && (
            <div>
              <div className="label">Attachments ({storyDetail.attachments.length})</div>
              <div className="flex gap-2 flex-wrap">
                {storyDetail.attachments.map((a, i) => (
                  <span key={i} className="badge bg-slate-700 text-slate-300">{a.filename}</span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button onClick={nextStep} className="btn-primary">
              Continue to Figma
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
