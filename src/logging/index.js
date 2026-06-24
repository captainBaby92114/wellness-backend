function log(level, message, meta) {
  const entry = meta ? `${message} ${JSON.stringify(meta)}` : message;
  if (level === 'error') {
    console.error(entry);
    return;
  }
  console.log(entry);
}

module.exports = {
  info: (message, meta) => log('info', message, meta),
  error: (message, meta) => log('error', message, meta),
};
