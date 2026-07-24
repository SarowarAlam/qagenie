require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const logger = require('./utils/logger');
const jiraRoutes = require('./routes/jira.routes');
const figmaRoutes = require('./routes/figma.routes');
const analysisRoutes = require('./routes/analysis.routes');
const testgenRoutes = require('./routes/testgen.routes');
const exportRoutes = require('./routes/export.routes');
const automationRoutes = require('./routes/automation.routes');

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Security & Middleware ───────────────────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// ─── Rate Limiting ───────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// ─── Routes ──────────────────────────────────────────────────────────────────
app.use('/api/jira', jiraRoutes);
app.use('/api/figma', figmaRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/testgen', testgenRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/automation', automationRoutes);

// ─── Health Check ────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    services: {
      jira: !!process.env.JIRA_API_TOKEN,
      figma: !!process.env.FIGMA_ACCESS_TOKEN,
      claude: !!process.env.ANTHROPIC_API_KEY,
    },
  });
});

// ─── Error Handler ───────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  logger.info(`🚀 QAGenie Backend running on http://localhost:${PORT}`);
});

module.exports = app;
