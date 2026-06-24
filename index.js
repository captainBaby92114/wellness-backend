require('dotenv').config();

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');

const app = express();
const PORT = process.env.PORT || 3001;
const USE_S3 = process.env.USE_S3 === 'true';

app.use(cors());
app.use(express.json());

const upload = multer(
  USE_S3
    ? { storage: multer.memoryStorage() }
    : {
        storage: multer.diskStorage({
          destination: (req, _file, cb) => {
            const dir = path.join(
              __dirname,
              'uploads',
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
      },
);

const s3 = USE_S3
  ? new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  : null;

app.post('/upload', upload.single('video'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No video file provided' });
  }

  const metadata = {
    userId: req.body.userId || '',
    consentTimestamp: req.body.consentTimestamp || '',
    consentVersion: req.body.consentVersion || '',
    captureTimestamp: req.body.captureTimestamp || '',
    deviceModel: req.body.deviceModel || '',
  };

  try {
    if (USE_S3) {
      const key = `videos/${req.body.userId}/${Date.now()}.mp4`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
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
        s3Url: `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
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

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', useS3: USE_S3 });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${PORT} (USE_S3=${USE_S3})`);
});
