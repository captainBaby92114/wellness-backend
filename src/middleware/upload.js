const multer = require('multer');

function createUploadMiddleware() {
  return multer({storage: multer.memoryStorage()});
}

module.exports = {createUploadMiddleware};
