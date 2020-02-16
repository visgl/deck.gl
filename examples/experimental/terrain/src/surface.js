const STREET = 'https://c.tile.openstreetmap.org';
const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const getSurface = (surface, tile) => {
  let surfaceImage = 0;
  switch (surface) {
    case 'sectional':
      surfaceImage = `${SECTIONAL}/{z}/{x}/{y}.png?origin=nw`;
      if (tile) {
        const {x, y, z} = tile;
        surfaceImage = `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
      }
      break;
    case 'satellite':
      surfaceImage = `${SATELLITE}/{z}/{x}/{y}@2x.png?access_token=${MAPBOX_TOKEN}`;
      if (tile) {
        const {x, y, z} = tile;
        surfaceImage = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
      }
      break;
    case 'street':
      surfaceImage = `${STREET}/{z}/{x}/{y}.png`;
      if (tile) {
        const {x, y, z} = tile;
        surfaceImage = `${STREET}/${z}/${x}/${y}.png`;
      }
      break;
    case 'none':
    default:
      surfaceImage = 0;
      break;
  }
  return surfaceImage;
};
