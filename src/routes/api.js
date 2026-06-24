const express = require('express');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const { getConfig } = require('../config');
const { createS3Client } = require('../lib/s3');
const { createUploadMiddleware } = require('../middleware/upload');

function createApiRouter() {
  const router = express.Router();
  const upload = createUploadMiddleware();
  const s3 = createS3Client();

  router.post('/upload', upload.single('video'), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file provided' });
    }

    const config = getConfig();
    const metadata = {
      userId: req.body.userId || '',
      consentTimestamp: req.body.consentTimestamp || '',
      consentVersion: req.body.consentVersion || '',
      captureTimestamp: req.body.captureTimestamp || '',
      deviceModel: req.body.deviceModel || '',
    };

    try {
      if (config.useS3) {
        const key = `videos/${req.body.userId}/${Date.now()}.mp4`;
        await s3.send(
          new PutObjectCommand({
            Bucket: config.aws.bucket,
            Key: key,
            Body: req.file.buffer,
            ContentType: 'video/mp4',
            ContentDisposition: 'attachment',
            ServerSideEncryption: 'AES256',
            Metadata: metadata,
          }),
        );

        return res.json({
          savedTo: 's3',
          s3Key: key,
          s3Url: `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`,
          fileSizeBytes: req.file.size,
          uploadedAt: new Date().toISOString(),
          metadata,
        });
      }

      return res.json({
        savedTo: 'local',
        savedPath: req.file.path,
        fileSizeBytes: req.file.size,
        uploadedAt: new Date().toISOString(),
        metadata,
      });
    } catch (err) {
      console.error('Upload error:', err);
      return res.status(500).json({ error: err.message });
    }
  });

  router.get('/health', (_req, res) => {
    res.json({ status: 'ok', useS3: getConfig().useS3 });
  });

  return router;
}

module.exports = { createApiRouter };
