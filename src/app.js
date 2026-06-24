const express = require('express');
const cors = require('cors');
const {createV1Router} = require('./routes/v1');

function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use('/api', createV1Router());

  return app;
}

module.exports = {createApp};
