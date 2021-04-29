import {MODES} from './api/maps-api-common';
import {log} from '@deck.gl/core';

const defaultClassicConfig = {
  username: 'public',
  apiKey: 'default_public',
  region: 'us',
  // Set to null to guess from mapsUrl attribute. Other values are 'v1' or 'v2'
  mapsVersion: null,
  // SQL API URL
  sqlUrl: 'https://{user}.carto.com/api/v2/sql',
  // Maps API URL
  mapsUrl: 'https://maps-api-v2.{region}.carto.com/user/{user}'
};

const defaultCloudNativeConfig = {
  accessToken: null,
  tenant: 'gcp-us-east1.app.carto.com',
  mapsUrl: 'https://maps-{tenant}'
};

let config = {};

export function setDefaultCredentials(opts) {
  log.warn(
    'setDefaultCredentials will be deprecated in future versions. Use setConfig method instead.'
  )();
  setConfig({
    mode: MODES.CARTO,
    ...opts
  });
}

export function getDefaultCredentials() {
  return config;
}

export function getMapsVersion(configOpts) {
  const {mapsVersion, mapsUrl} = {...config, ...configOpts};

  if (mapsVersion) {
    return mapsVersion;
  }

  return mapsUrl.includes('api/v1/map') ? 'v1' : 'v2';
}

export function setConfig(opts) {
  switch (opts.mode) {
    case MODES.CARTO:
      config = {
        ...defaultClassicConfig,
        ...opts
      };
      break;
    case MODES.CARTO_CLOUD_NATIVE:
      config = {
        ...defaultCloudNativeConfig,
        ...opts
      };
      break;
    default:
      throw new Error(`Invalid mode ....`);
  }
}

export function getConfig() {
  return config;
}
