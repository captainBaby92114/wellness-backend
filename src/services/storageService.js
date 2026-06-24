const fs = require('fs');
const {PutObjectCommand} = require('@aws-sdk/client-s3');
const {getConfig} = require('../config');
const {localSavePath} = require('../utils/paths');
const {createS3Client} = require('./s3Service');

const s3 = createS3Client();

async function saveToS3({buffer, key, mimeType, metadata}) {
  const config = getConfig();

  await s3.send(
    new PutObjectCommand({
      Bucket: config.aws.bucket,
      Key: key,
      Body: buffer,
      ContentType: mimeType,
      ContentDisposition: 'attachment',
      ServerSideEncryption: 'AES256',
      Metadata: metadata,
    }),
  );

  return {
    s3Key: key,
    s3Url: `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`,
  };
}

async function saveLocally({buffer, userId, captureTimestamp}) {
  const config = getConfig();
  const savedPath = localSavePath(config, userId, captureTimestamp);
  await fs.promises.writeFile(savedPath, buffer);
  return {savedPath};
}

module.exports = {saveToS3, saveLocally};
