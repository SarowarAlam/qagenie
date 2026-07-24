const express = require('express');
const router = express.Router();
const jiraService = require('../services/jira.service');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.get('/projects', wrap(async (req, res) => {
  const projects = await jiraService.getProjects();
  res.json({ projects });
}));

router.get('/projects/:projectKey/epics', wrap(async (req, res) => {
  const epics = await jiraService.getEpics(req.params.projectKey);
  res.json({ epics });
}));

router.get('/epics/:epicKey/stories', wrap(async (req, res) => {
  const stories = await jiraService.getStories(req.params.epicKey);
  res.json({ stories });
}));

router.get('/stories/:issueKey', wrap(async (req, res) => {
  const story = await jiraService.getStoryDetail(req.params.issueKey);
  res.json({ story });
}));

module.exports = router;
