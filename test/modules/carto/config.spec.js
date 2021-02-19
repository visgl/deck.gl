import test from 'tape-catch';
import {getDefaultCredentials, setDefaultCredentials, _getMapsVersion} from '@deck.gl/carto';

const VERSION_TEST_CASES = [
  {
    mapsUrl: 'https://{username}.carto.com/api/v1/map/',
    output: 'v1'
  },
  {
    mapsUrl: 'https://maps-api-v2.{region}.carto.com/user/{user}',
    output: 'v2'
  },
  {
    mapsVersion: 'v1',
    output: 'v1'
  },
  {
    mapsVersion: 'v2',
    output: 'v2'
  }
];

test('config#getMapsVersion', t => {
  for (const tc of VERSION_TEST_CASES) {
    setDefaultCredentials({
      mapsVersion: tc.mapsVersion
    });

    const appendVersion = {
      ...getDefaultCredentials(),
      ...tc
    };

    const func = _getMapsVersion(appendVersion);
    t.ok(func === tc.output, `getMapsVersion returned expected result: ${tc.output}`);
  }

  t.end();
});

test('config#getDefaultCredentials', t => {
  const credentials = getDefaultCredentials();

  t.notOk(credentials === null, 'default credentials available');
  t.end();
});

test('config#getDefaultCredentials', t => {
  // partial (keeping other params)
  setDefaultCredentials({username: 'a-new-username'});
  let credentials = getDefaultCredentials();
  t.ok(credentials.username === 'a-new-username', 'user update');
  t.ok(credentials.apiKey === 'default_public', 'keep default apiKey');
  t.ok(
    credentials.mapsUrl === 'https://maps-api-v2.{region}.carto.com/user/{user}',
    'keep default mapsUrl'
  );
  t.ok(credentials.sqlUrl === 'https://{user}.carto.com/api/v2/sql', 'keep default sqlUrl');

  const baseUrl = 'https://a-custom-{user}.carto.com';
  // full
  setDefaultCredentials({
    username: 'a-new-username',
    apiKey: 'a-new-key',
    sqlUrl: `${baseUrl}/sql`,
    mapsUrl: `${baseUrl}/map`
  });

  credentials = getDefaultCredentials();

  t.ok(credentials.username === 'a-new-username', '');
  t.ok(credentials.apiKey === 'a-new-key');
  t.ok(credentials.sqlUrl === `${baseUrl}/sql`);
  t.ok(credentials.mapsUrl === `${baseUrl}/map`);
  t.end();
});
