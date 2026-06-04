import express from 'express';

const app = express();
const host = process.env.HEALTH_SERVER_HOST || '0.0.0.0';
const port = Number(process.env.HEALTH_SERVER_PORT || 8787);

app.get('/health', (_req, res) => {
  res.json({
    steps: 7421,
    sleepScore: 78,
    restingHr: 64,
    stressLevel: 'Medium',
    spo2: 97,
    recovery: 74,
    source: 'local-health-server',
    timestamp: new Date().toISOString(),
  });
});

app.listen(port, host, () => {
  console.log(`Health server running at http://${host}:${port}/health`);
});
