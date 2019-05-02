const path = require('path');

const PORT = 3000;
const INPUT_DIR = 'src';
const IMAGE_DIR = 'images';

/* eslint-disable */
const MAPBOX_TOKEN = process.env.MapboxAccessToken;
if (!MAPBOX_TOKEN) {
  console.log('Missing environment variable: MapboxAccessToken');
  process.exit(1);
}
/* eslint-enable */

const LOCAL_BUNDLE = path.resolve(__dirname, '../../../modules/main/dist/dist.dev.js');

module.exports = {
  INPUT_DIR,
  IMAGE_DIR,
  MAPBOX_TOKEN,
  LOCAL_BUNDLE,
  PORT
};
