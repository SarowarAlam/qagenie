const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude.service');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/requirements', wrap(async (req, res) => {
  const { summary, description, acceptanceCriteria, figmaContext } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary is required' });
  const analysis = await claudeService.analyzeRequirements({ summary, description, acceptanceCriteria, figmaContext });
  res.json({ analysis });
}));

router.post('/gaps', wrap(async (req, res) => {
  const { summary, description, acceptanceCriteria, analysis } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary is required' });
  const gaps = await claudeService.analyzeGaps({ summary, description, acceptanceCriteria, analysis });
  res.json({ gaps });
}));

module.exports = router;
