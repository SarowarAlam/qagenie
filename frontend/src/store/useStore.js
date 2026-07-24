import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // ─── Current session ──────────────────────────────────────────────────────
  selectedProject: null,
  selectedEpic: null,
  selectedStory: null,
  storyDetail: null,
  figmaUrl: '',
  figmaMetadata: null,
  figmaTexts: [],

  // ─── Analysis results ─────────────────────────────────────────────────────
  analysis: null,
  gaps: null,
  testCases: [],

  // ─── Automation artifacts ─────────────────────────────────────────────────
  featureFile: '',
  stepDefinitions: '',
  pageObject: '',
  testData: '',
  cicdTemplate: '',
  cicdFilename: '',

  // ─── UI state ─────────────────────────────────────────────────────────────
  currentStep: 1,
  loading: {},
  errors: {},

  // ─── Actions ──────────────────────────────────────────────────────────────
  setField: (key, value) => set({ [key]: value }),
  setLoading: (key, val) => set(s => ({ loading: { ...s.loading, [key]: val } })),
  setError: (key, val) => set(s => ({ errors: { ...s.errors, [key]: val } })),
  clearError: (key) => set(s => { const e = { ...s.errors }; delete e[key]; return { errors: e }; }),
  nextStep: () => set(s => ({ currentStep: Math.min(s.currentStep + 1, 10) })),
  prevStep: () => set(s => ({ currentStep: Math.max(s.currentStep - 1, 1) })),
  goToStep: (n) => set({ currentStep: n }),
  reset: () => set({
    selectedProject: null, selectedEpic: null, selectedStory: null,
    storyDetail: null, figmaUrl: '', figmaMetadata: null, figmaTexts: [],
    analysis: null, gaps: null, testCases: [],
    featureFile: '', stepDefinitions: '', pageObject: '', testData: '',
    cicdTemplate: '', cicdFilename: '', currentStep: 1, loading: {}, errors: {},
  }),
}));
