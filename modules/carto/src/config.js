const defaultCredentials = {
  username: 'public',
  apiKey: 'default_public',
  accessToken: null,
  region: 'us',
  // Set to null to guess from mapsUrl attribute. Other values are 'v1' or 'v2'
  mapsVersion: null,
  // SQL API URL
  sqlUrl: 'https://{user}.carto.com/api/v2/sql',
  // Maps API URL
  mapsUrl: 'https://maps-api-v2.{region}.carto.com'
};

let credentials = defaultCredentials;

export function setDefaultCredentials(opts) {
  credentials = {
    ...credentials,
    ...opts
  };
}

export function getDefaultCredentials() {
  return credentials;
}

export function getMapsVersion(creds) {
  const {mapsVersion, mapsUrl} = {...credentials, ...creds};

  if (mapsVersion) {
    return mapsVersion;
  }

  return mapsUrl.includes('api/v1/map') ? 'v1' : 'v2';
}