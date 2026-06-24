const fs = require('fs');
const path = require('path');

function localSavePath(config, userId, captureTimestamp) {
  const dir = path.join(config.uploadsDir, userId || 'anonymous');
  fs.mkdirSync(dir, {recursive: true});
  const ts = (captureTimestamp || Date.now().toString()).replace(/[:.]/g, '-');
  return path.join(dir, `${ts}.mp4`);
}

module.exports = {localSavePath};
