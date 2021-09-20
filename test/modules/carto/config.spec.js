import test from 'tape-catch';
import {getDefaultCredentials, setDefaultCredentials, API_VERSIONS} from '@deck.gl/carto';

test('config#default values', t => {
  const credentials = getDefaultCredentials();
  t.notOk(credentials === null, 'default credentials available');
  t.is(credentials.apiVersion, API_VERSIONS.V2, 'v2 is the default');
  t.is(credentials.region, 'us', 'us region is the default');
  t.is(credentials.username, 'public', 'public is the default username');
  t.end();
});

test('config#setDefaultCredentials', t => {
  setDefaultCredentials({apiVersion: API_VERSIONS.V1});
  let credentials = getDefaultCredentials();
  t.is(credentials.mapsUrl, 'https://{user}.carto.com/api/v1/map', 'right endpoint for v1');

  setDefaultCredentials({apiVersion: API_VERSIONS.V1, mapsUrl: 'http://onprem'});
  credentials = getDefaultCredentials();
  t.is(credentials.mapsUrl, 'http://onprem', 'should allow to override mapsUrl for v1');

  setDefaultCredentials({apiVersion: API_VERSIONS.V2});
  credentials = getDefaultCredentials();
  t.is(
    credentials.mapsUrl,
    'https://maps-api-v2.{region}.carto.com/user/{user}',
    'right endpoint for v2'
  );

  setDefaultCredentials({apiVersion: API_VERSIONS.V2, mapsUrl: 'http://onprem'});
  credentials = getDefaultCredentials();
  t.is(credentials.mapsUrl, 'http://onprem', 'should allow to override mapsUrl for v2');

  setDefaultCredentials({apiVersion: API_VERSIONS.V3, apiBaseUrl: 'http://server'});
  credentials = getDefaultCredentials();
  t.is(credentials.mapsUrl, 'http://server/v3/maps', 'right endpoint for v3');

  setDefaultCredentials({
    apiVersion: API_VERSIONS.V3,
    apiBaseUrl: 'http://server',
    mapsUrl: 'http://server2'
  });
  credentials = getDefaultCredentials();
  t.is(credentials.mapsUrl, 'http://server2', 'should allow to override mapsUrl for v3');

  t.throws(
    () => {
      setDefaultCredentials({apiVersion: API_VERSIONS.V3});
    },
    /requires to define apiBaseUrl/i,
    'should throw when apiBaseUrl is not defined at v3'
  );

  t.throws(
    () => {
      setDefaultCredentials({apiVersion: 'INVALID'});
    },
    /Invalid API version/i,
    'should throw when apiVersion is invalid'
  );

  credentials = getDefaultCredentials();

  setDefaultCredentials({});
  t.end();
});
