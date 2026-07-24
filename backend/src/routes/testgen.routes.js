const express = require('express');
const router = express.Router();
const claudeService = require('../services/claude.service');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/test-cases', wrap(async (req, res) => {
  const { summary, description, acceptanceCriteria, analysis, gaps } = req.body;
  if (!summary) return res.status(400).json({ error: 'summary is required' });
  const result = await claudeService.generateTestCases({ summary, description, acceptanceCriteria, analysis, gaps });
  res.json(result);
}));

module.exports = router;
