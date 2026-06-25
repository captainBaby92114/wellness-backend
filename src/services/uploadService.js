const {getConfig} = require('../config');
const {getMetrics} = require('./circadifyService');
const {saveLocally, saveToS3} = require('./storageService');

async function resolveMetrics({source, sdkMetrics, buffer, mimeType}) {
  if (source === 'camera' && sdkMetrics) {
    return {metrics: {...sdkMetrics}, metricsSource: 'shenai'};
  }

  const circadify = await getMetrics(buffer, mimeType);
  if (circadify) {
    return {metrics: circadify, metricsSource: 'circadify'};
  }

  return {metrics: null, metricsSource: 'none'};
}

async function processUpload({file, metadata, mimeType, source, sdkMetrics}) {
  const config = getConfig();
  const buffer = file.buffer;
  const uploadedAt = new Date().toISOString();

  const storagePromise = config.useS3
    ? saveToS3({
        buffer,
        key: `videos/${metadata.userId}/${Date.now()}.mp4`,
        mimeType,
        metadata,
      })
    : saveLocally({
        buffer,
        userId: metadata.userId,
        captureTimestamp: metadata.captureTimestamp,
      });

  const [storage, {metrics, metricsSource}] = await Promise.all([
    storagePromise,
    resolveMetrics({source, sdkMetrics, buffer, mimeType}),
  ]);

  return {
    savedTo: config.useS3 ? 's3' : 'local',
    ...(config.useS3
      ? {s3Key: storage.s3Key, s3Url: storage.s3Url}
      : {savedPath: storage.savedPath}),
    fileSizeBytes: file.size,
    uploadedAt,
    metadata,
    metrics,
    metricsSource,
  };
}

module.exports = {processUpload};
