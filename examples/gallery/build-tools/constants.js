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

const MAPTILER_API_KEY = process.env.MapTilerApiKey;
if (!MAPTILER_API_KEY) {
  console.log('Missing environment variable: MapTilerApiKey');
  process.exit(1);
}
/* eslint-enable */

const LOCAL_BUNDLE = path.resolve(__dirname, '../../../modules/main/dist/dist.dev.js');

module.exports = {
  INPUT_DIR,
  IMAGE_DIR,
  MAPBOX_TOKEN,
  MAPTILER_API_KEY,
  LOCAL_BUNDLE,
  PORT
};
