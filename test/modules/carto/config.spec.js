import test from 'tape-catch';
import {getDefaultCredentials, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';

test('config#default values v2', t => {
  setDefaultCredentials({apiVersion: API_VERSIONS.V2});

  const credentials = getDefaultCredentials();
  t.notOk(credentials === null, 'default credentials available');
  t.is(credentials.apiVersion, API_VERSIONS.V2, 'version is retained');
  t.is(credentials.apiKey, 'default_public', 'default_public is the default apiKey');
  t.is(credentials.username, 'public', 'public is the default username');
  t.is(credentials.region, 'us', 'us region is the default');
  t.is(credentials.mapsUrl, undefined, 'mapsUrl has no default value');
  setDefaultCredentials({});
  t.end();
});

test('config#default values v3', t => {
  setDefaultCredentials({});

  const credentials = getDefaultCredentials();
  t.notOk(credentials === null, 'default credentials available');
  t.is(credentials.apiVersion, API_VERSIONS.V3, 'v3 is the default');
  t.is(
    credentials.apiBaseUrl,
    'https://gcp-us-east1.api.carto.com',
    'us-east1 region is the default'
  );
  t.is(credentials.mapsUrl, undefined, 'mapsUrl has no default value');

  setDefaultCredentials({});
  t.end();
});

test('config#setDefaultCredentials', t => {
  t.throws(
    () => setDefaultCredentials({apiVersion: -123}),
    /Invalid API version -123/,
    'should throw on invalid API_VERSION'
  );
  setDefaultCredentials({});

  t.end();
});
