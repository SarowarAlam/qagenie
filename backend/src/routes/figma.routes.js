const express = require('express');
const router = express.Router();
const figmaService = require('../services/figma.service');

const wrap = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

router.post('/metadata', wrap(async (req, res) => {
  const { figmaUrl } = req.body;
  if (!figmaUrl) return res.status(400).json({ error: 'figmaUrl is required' });
  const metadata = await figmaService.getFileMetadata(figmaUrl);
  res.json({ metadata });
}));

router.post('/images', wrap(async (req, res) => {
  const { fileKey, nodeIds } = req.body;
  if (!fileKey) return res.status(400).json({ error: 'fileKey is required' });
  const images = await figmaService.getFrameImages(fileKey, nodeIds || []);
  res.json({ images });
}));

router.post('/text-content', wrap(async (req, res) => {
  const { figmaUrl } = req.body;
  if (!figmaUrl) return res.status(400).json({ error: 'figmaUrl is required' });
  const texts = await figmaService.getFileTextContent(figmaUrl);
  res.json({ texts });
}));

module.exports = router;
