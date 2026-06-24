const path = require('path');
const {DEFAULT_PORT} = require('../constants');

function getConfig() {
  return {
    port: Number(process.env.PORT) || DEFAULT_PORT,
    useS3: process.env.USE_S3 === 'true',
    aws: {
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: process.env.S3_BUCKET,
    },
    uploadsDir: process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads'),
  };
}

module.exports = {getConfig};
