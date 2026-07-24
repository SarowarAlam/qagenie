const express = require('express');
const router = express.Router();
const excelService = require('../services/excel.service');
const path = require('path');
const fs = require('fs');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/excel', wrap(async (req, res) => {
  const { storyKey, summary, testCases, acceptanceCriteria } = req.body;
  if (!testCases?.length) return res.status(400).json({ error: 'testCases array is required' });
  const { filePath, fileName } = await excelService.generateTraceabilityMatrix({
    storyKey: storyKey || 'STORY-001',
    summary: summary || 'Test Story',
    testCases,
    acceptanceCriteria,
  });
  res.download(filePath, fileName, err => {
    if (!err) {
      // Clean up after download
      setTimeout(() => fs.unlink(filePath, () => {}), 30000);
    }
  });
}));

module.exports = router;
