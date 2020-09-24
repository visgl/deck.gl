const defaultCredentials = {
  username: 'public',
  apiKey: 'default_public',
  serverUrlTemplate: 'https://{user}.carto.com'
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
