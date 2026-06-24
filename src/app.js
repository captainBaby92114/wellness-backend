const express = require('express');
const cors = require('cors');
const { createApiRouter } = require('./routes/api');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', createApiRouter());

  return app;
}

module.exports = { createApp };
