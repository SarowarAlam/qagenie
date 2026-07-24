import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 120000 });

api.interceptors.response.use(
  res => res.data,
  err => Promise.reject(err.response?.data || err)
);

// ─── Jira ─────────────────────────────────────────────────────────────────────
export const jiraApi = {
  getProjects: () => api.get('/jira/projects'),
  getEpics: (projectKey) => api.get(`/jira/projects/${projectKey}/epics`),
  getStories: (epicKey) => api.get(`/jira/epics/${epicKey}/stories`),
  getStoryDetail: (issueKey) => api.get(`/jira/stories/${issueKey}`),
};

// ─── Figma ────────────────────────────────────────────────────────────────────
export const figmaApi = {
  getMetadata: (figmaUrl) => api.post('/figma/metadata', { figmaUrl }),
  getImages: (fileKey, nodeIds) => api.post('/figma/images', { fileKey, nodeIds }),
  getTextContent: (figmaUrl) => api.post('/figma/text-content', { figmaUrl }),
};

// ─── Analysis ─────────────────────────────────────────────────────────────────
export const analysisApi = {
  analyzeRequirements: (data) => api.post('/analysis/requirements', data),
  analyzeGaps: (data) => api.post('/analysis/gaps', data),
};

// ─── Test Generation ──────────────────────────────────────────────────────────
export const testgenApi = {
  generateTestCases: (data) => api.post('/testgen/test-cases', data),
};

// ─── Automation ───────────────────────────────────────────────────────────────
export const automationApi = {
  generateFeature: (data) => api.post('/automation/cucumber-feature', data),
  generateStepDefs: (data) => api.post('/automation/step-definitions', data),
  generatePageObject: (data) => api.post('/automation/page-object', data),
  generateTestData: (data) => api.post('/automation/test-data', data),
  generateCICD: (data) => api.post('/automation/cicd', data),
};

// ─── Export ───────────────────────────────────────────────────────────────────
export const exportApi = {
  downloadExcel: async (data) => {
    const response = await axios.post('/api/export/excel', data, {
      responseType: 'blob',
      timeout: 60000,
    });
    const url = URL.createObjectURL(response.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qagenie_${data.storyKey || 'export'}_${Date.now()}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ─── Health ───────────────────────────────────────────────────────────────────
export const healthApi = {
  check: () => api.get('/health'),
};
