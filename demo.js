const {classicNameResolver} = require('typescript');

setDefaultCredentials({
  username: 'alasarr',
  apiKey: 'XXXX',
  mapsUrl: '....'
});

CartoSQLLayer({
  data: 'select * from ...'
});

CartoBQTilerLayer({
  data: 'select * from ...'
});

// propuesta 1

setConfig({
  mode: 'carto classic',
  username: 'alasarr',
  apiKey: 'XXXX',
  mapsUrlTemplate: '....',
  region: 'us'
});

setConfig({
  mode: 'carto cloud native',
  email: 'albertoasuero@gmail.com',
  accessToken: '',
  mapsUrlTemplate: '',
  cloud: 'gcp',
  region: 'eu-west-1'
});

CartoLayer({
  provider: '',
  connection: '',
  type: '',
  format: '',
  renderSubLayers: '',
  credentials: {},
  data: ''
});

// Propuesta 2
CartoLayer({
  mode: 'carto-classic',
  type: 'tileset|sql|table',
  data: 'select * from airports'
});

CartoLayer({
  mode: 'carto-cloud-native',
  provider: 'bigquery|snowflake|redshift',
  type: 'tileset|table|sql',
  format: 'tilejson|json|geojson',
  data: 'select * from airports'
});
