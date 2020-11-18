const defaultCredentials = {
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
  const localCreds = creds || credentials;
  if (localCreds.mapsVersion) {
    return localCreds.mapsVersion;
  }

  return localCreds.mapsUrl.includes('api/v1/map') ? 'v1' : 'v2';
}
