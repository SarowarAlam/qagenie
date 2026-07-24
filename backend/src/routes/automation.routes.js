const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude.service');
const { generateGitHubActions, generateJenkinsfile } = require('../services/cicd.service');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/cucumber-feature', wrap(async (req, res) => {
  const { summary, testCases } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary is required' });
  const featureFile = await claudeService.generateCucumberFeature({ summary, testCases });
  res.json({ featureFile });
}));

router.post('/step-definitions', wrap(async (req, res) => {
  const { featureFile, framework } = req.body;
  if (!featureFile) return res.status(400).json({ error: 'featureFile is required' });
  const stepDefinitions = await claudeService.generateStepDefinitions({ featureFile, framework: framework || 'java' });
  res.json({ stepDefinitions });
}));

router.post('/page-object', wrap(async (req, res) => {
  const { summary, frames, framework } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary is required' });
  const pageObject = await claudeService.generatePageObject({ summary, frames, framework: framework || 'java' });
  res.json({ pageObject });
}));

router.post('/test-data', wrap(async (req, res) => {
  const { testCases } = req.body;
  if (!testCases) return res.status(400).json({ error: 'testCases is required' });
  const testData = await claudeService.generateTestData({ testCases });
  res.json({ testData });
}));

router.post('/cicd', wrap(async (req, res) => {
  const { type, projectName, framework } = req.body;
  if (!type) return res.status(400).json({ error: 'type (github|jenkins) is required' });
  let template;
  if (type === 'github') {
    template = generateGitHubActions({ projectName: projectName || 'MyProject', framework });
  } else if (type === 'jenkins') {
    template = generateJenkinsfile({ projectName: projectName || 'MyProject', framework });
  } else {
    return res.status(400).json({ error: 'type must be "github" or "jenkins"' });
  }
  res.json({ template, filename: type === 'github' ? 'pipeline.yml' : 'Jenkinsfile' });
}));

module.exports = router;
