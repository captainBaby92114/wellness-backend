const fetch = require('node-fetch');
const {CIRCADIFY_POLL} = require('../constants');
const logger = require('../logging');

const BASE = process.env.CIRCADIFY_API_URL;
const KEY = process.env.CIRCADIFY_API_KEY;
const HEADERS = {'X-API-Key': KEY, 'Content-Type': 'application/json'};

async function startSession() {
  const res = await fetch(`${BASE}/sdk/session/start`, {
    method: 'POST',
    headers: HEADERS,
  });
  if (!res.ok) {
    throw new Error(`startSession failed: ${res.status}`);
  }
  return res.json();
}

async function uploadBuffer(uploadUrl, buffer, mimeType) {
  const res = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {'Content-Type': mimeType},
    body: buffer,
  });
  if (!res.ok) {
    throw new Error(`uploadBuffer failed: ${res.status}`);
  }
}

async function notifyComplete(sessionId) {
  const res = await fetch(`${BASE}/sdk/session/upload-complete`, {
    method: 'POST',
    headers: HEADERS,
    body: JSON.stringify({sessionId}),
  });
  if (!res.ok) {
    throw new Error(`notifyComplete failed: ${res.status}`);
  }
}

async function pollResult(sessionId, options = {}) {
  const {maxAttempts, intervalMs} = {...CIRCADIFY_POLL, ...options};

  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(r => setTimeout(r, intervalMs));
    const res = await fetch(`${BASE}/sdk/session/${sessionId}/result`, {
      headers: HEADERS,
    });
    if (!res.ok) {
      return null;
    }
    const data = await res.json();
    if (data.status === 'completed') {
      return data.metrics;
    }
    if (data.status === 'failed') {
      return null;
    }
  }
  return null;
}

async function getMetrics(fileBuffer, mimeType) {
  try {
    const {sessionId, uploadUrl} = await startSession();
    await uploadBuffer(uploadUrl, fileBuffer, mimeType);
    await notifyComplete(sessionId);
    const metrics = await pollResult(sessionId);
    if (!metrics) {
      return null;
    }
    return {...metrics, sessionId};
  } catch (err) {
    logger.error('[Circadify] error:', {message: err.message});
    return null;
  }
}

module.exports = {getMetrics};
