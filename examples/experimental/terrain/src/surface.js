const STREET = 'https://c.tile.openstreetmap.org';
const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

export const getSurface = ({x, y, z}, surface) => {
  let surfaceImage = null;
  switch (surface) {
    case 'sectional':
      surfaceImage = `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
      break;
    case 'satellite':
      surfaceImage = `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
      break;
    case 'street':
      surfaceImage = `${STREET}/${z}/${x}/${y}.png`;
      break;
    case 'none':
    default:
      surfaceImage = null;
      break;
  }
  return surfaceImage;
};
