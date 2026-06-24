const express = require('express');
const {health} = require('../../controllers/v1/healthController');
const {uploadVideo} = require('../../controllers/v1/uploadController');
const {createUploadMiddleware} = require('../../middlewares/upload');

const upload = createUploadMiddleware();

function createV1Router() {
  const router = express.Router();

  router.post('/upload', upload.single('video'), uploadVideo);
  router.get('/health', health);

  return router;
}

module.exports = {createV1Router};
