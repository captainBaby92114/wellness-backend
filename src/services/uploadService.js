const {getConfig} = require('../config');
const {getMetrics} = require('./circadifyService');
const {saveLocally, saveToS3} = require('./storageService');

async function processUpload({file, metadata, mimeType}) {
  const config = getConfig();
  const buffer = file.buffer;
  const uploadedAt = new Date().toISOString();

  if (config.useS3) {
    const key = `videos/${metadata.userId}/${Date.now()}.mp4`;

    const [storage, metrics] = await Promise.all([
      saveToS3({buffer, key, mimeType, metadata}),
      getMetrics(buffer, mimeType),
    ]);

    return {
      savedTo: 's3',
      s3Key: storage.s3Key,
      s3Url: storage.s3Url,
      fileSizeBytes: file.size,
      uploadedAt,
      metadata,
      metrics,
    };
  }

  const [storage, metrics] = await Promise.all([
    saveLocally({
      buffer,
      userId: metadata.userId,
      captureTimestamp: metadata.captureTimestamp,
    }),
    getMetrics(buffer, mimeType),
  ]);

  return {
    savedTo: 'local',
    savedPath: storage.savedPath,
    fileSizeBytes: file.size,
    uploadedAt,
    metadata,
    metrics,
  };
}

module.exports = {processUpload};
