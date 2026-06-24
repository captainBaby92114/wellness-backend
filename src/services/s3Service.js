const {S3Client} = require('@aws-sdk/client-s3');
const {getConfig} = require('../config');

function createS3Client() {
  const config = getConfig();

  if (!config.useS3) {
    return null;
  }

  return new S3Client({
    region: config.aws.region,
    credentials: {
      accessKeyId: config.aws.accessKeyId,
      secretAccessKey: config.aws.secretAccessKey,
    },
  });
}

module.exports = {createS3Client};
