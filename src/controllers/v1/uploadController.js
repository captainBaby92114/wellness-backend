const logger = require('../../logging');
const {processUpload} = require('../../services/uploadService');
const {deriveMimeType} = require('../../utils/mime');

function buildMetadata(body) {
  return {
    userId: body.userId || '',
    consentTimestamp: body.consentTimestamp || '',
    consentVersion: body.consentVersion || '',
    captureTimestamp: body.captureTimestamp || '',
    deviceModel: body.deviceModel || '',
  };
}

async function uploadVideo(req, res) {
  if (!req.file) {
    return res.status(400).json({error: 'No video file provided'});
  }

  const metadata = buildMetadata(req.body);
  const mimeType = deriveMimeType(req.file.originalname);
  const source = req.body.source || 'picker';
  let sdkMetrics = null;
  if (req.body.sdkMetrics) {
    try {
      sdkMetrics = JSON.parse(req.body.sdkMetrics);
    } catch (parseErr) {
      logger.error('Invalid sdkMetrics payload:', {message: parseErr.message});
    }
  }

  try {
    const result = await processUpload({
      file: req.file,
      metadata,
      mimeType,
      source,
      sdkMetrics,
    });
    return res.json(result);
  } catch (err) {
    logger.error('Upload error:', {message: err.message});
    return res.status(500).json({error: err.message});
  }
}

module.exports = {uploadVideo};
