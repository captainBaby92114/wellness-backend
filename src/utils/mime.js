const path = require('path');
const {MIME} = require('../constants');

function deriveMimeType(originalname = '') {
  const ext = path.extname(originalname).toLowerCase();
  if (ext === '.mov') {
    return MIME.MOV;
  }
  return MIME.MP4;
}

module.exports = {deriveMimeType};
