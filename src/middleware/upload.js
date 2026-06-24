const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { getConfig } = require('../config');

function createUploadMiddleware() {
  const config = getConfig();

  if (config.useS3) {
    return multer({ storage: multer.memoryStorage() });
  }

  return multer({
    storage: multer.diskStorage({
      destination: (req, _file, cb) => {
        const dir = path.join(
          config.uploadsDir,
          req.body.userId || 'anonymous',
        );
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
      },
      filename: (req, _file, cb) => {
        const ts = (req.body.captureTimestamp || Date.now().toString())
          .replace(/[:.]/g, '-');
        cb(null, `${ts}.mp4`);
      },
    }),
  });
}

module.exports = { createUploadMiddleware };
