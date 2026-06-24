const {loadEnv} = require('./startup/loadEnv');
const {getConfig} = require('./config');
const {createApp} = require('./app');

loadEnv();

const config = getConfig();
const app = createApp();

app.listen(config.port, '0.0.0.0', () => {
  console.log(
    `Server listening on http://0.0.0.0:${config.port} (USE_S3=${config.useS3})`,
  );
});
