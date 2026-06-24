const {getConfig} = require('../../config');

function health(_req, res) {
  res.json({status: 'ok', useS3: getConfig().useS3});
}

module.exports = {health};
