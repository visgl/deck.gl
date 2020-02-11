const STREET = 'https://c.tile.openstreetmap.org';
const SECTIONAL = 'https://wms.chartbundle.com/tms/1.0.0/sec';
const SATELLITE = 'https://api.mapbox.com/v4/mapbox.satellite';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const getStreetSurfaceImage = ({x, y, z}) => {
  return `${STREET}/${z}/${x}/${y}.png`;
};

const getSatelliteSurfaceImage = ({x, y, z}) => {
  return `${SATELLITE}/${z}/${x}/${y}@2x.png?access_token=${MAPBOX_TOKEN}`;
};

const getSectionalSurfaceImage = ({x, y, z}) => {
  return `${SECTIONAL}/${z}/${x}/${y}.png?origin=nw`;
};

export const getSurface = (tile, surface) => {
  let surfaceImage = null;
  switch (surface) {
    case 'sectional':
      surfaceImage = getSectionalSurfaceImage(tile);
      break;
    case 'satellite':
      surfaceImage = getSatelliteSurfaceImage(tile);
      break;
    case 'street':
      surfaceImage = getStreetSurfaceImage(tile);
      break;
    case 'none':
    default:
      surfaceImage = null;
      break;
  }
  return surfaceImage;
};
