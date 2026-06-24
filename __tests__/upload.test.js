const fs = require('fs');
const os = require('os');
const path = require('path');
const request = require('supertest');
const { createApp } = require('../src/app');

describe('POST /api/upload', () => {
  let app;
  let uploadsDir;

  beforeAll(() => {
    uploadsDir = path.join(os.tmpdir(), `wellness-upload-test-${Date.now()}`);
    process.env.UPLOADS_DIR = uploadsDir;
    app = createApp();
  });

  afterAll(() => {
    if (uploadsDir && fs.existsSync(uploadsDir)) {
      fs.rmSync(uploadsDir, { recursive: true, force: true });
    }
    delete process.env.UPLOADS_DIR;
  });

  it('rejects requests without a video file', async () => {
    const response = await request(app)
      .post('/api/upload')
      .field('userId', 'user-test');

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'No video file provided' });
  });

  it('saves an uploaded video locally with metadata', async () => {
    const captureTimestamp = '2026-06-24T12:00:00.000Z';
    const response = await request(app)
      .post('/api/upload')
      .field('userId', 'user-test')
      .field('consentTimestamp', '2026-06-24T11:59:00.000Z')
      .field('consentVersion', '1.0')
      .field('captureTimestamp', captureTimestamp)
      .field('deviceModel', 'Test Device')
      .attach('video', Buffer.from('fake-video-data'), {
        filename: 'scan.mp4',
        contentType: 'video/mp4',
      });

    expect(response.status).toBe(200);
    expect(response.body.savedTo).toBe('local');
    expect(response.body.fileSizeBytes).toBeGreaterThan(0);
    expect(response.body.metadata).toEqual({
      userId: 'user-test',
      consentTimestamp: '2026-06-24T11:59:00.000Z',
      consentVersion: '1.0',
      captureTimestamp,
      deviceModel: 'Test Device',
    });
    expect(fs.existsSync(response.body.savedPath)).toBe(true);
  });
});
