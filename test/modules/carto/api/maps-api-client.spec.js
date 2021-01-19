import test from 'tape-catch';
import {_getTileJSON, setDefaultCredentials} from '@deck.gl/carto';

const SQL_RESPONSE = {
  tilejson: '2.2.0',
  tiles: [
    'https://maps-api-v2.us.carto.com/user/public/tile/map-config/bebb71dac05816a8234ab721a6fd407a/1600089410773/{z}/{x}/{y}.mvt?api_key=default_public'
  ],
  tilestats: {}
};

const CFG = {
  connection: 'carto',
  type: 'table',
  source: 'ne_10m_airports'
};

const TEST_CASES = [
  {
    server: {
      ok: false,
      status: 401
    },
    credentials: {
      username: 'publi',
      apiKey: 'default_public'
    }
  },
  {
    server: {
      ok: false,
      status: 403
    },
    credentials: {
      apiKey: 'defaultpublic'
    }
  },
  {
    server: {
      ok: false,
      status: 'unknown'
    }
  },
  {
    server: {
      ok: true
    }
  }
];

const VERSION_TEST_CASES = ['2', 'v3', 3];

test('mapApiClient#getTileJSON', async t => {
  /* global global, window */
  const _global = typeof global !== 'undefined' ? global : window;
  const fetch = _global.fetch;

  for (const tc of TEST_CASES) {
    _global.fetch = () => {
      return new Promise(resolve => {
        return resolve({
          json: () => SQL_RESPONSE,
          ...tc.server
        });
      });
    };

    if (!tc.server.ok) {
      setDefaultCredentials(tc.credentials);

      try {
        await _getTileJSON(CFG);
      } catch (err) {
        t.pass(`Correctly throws ${err}`);
      }
      /* eslint-disable-next-line no-continue */
      continue;
    }

    const func = await _getTileJSON(CFG);
    t.ok(func.tiles[0] === SQL_RESPONSE.tiles[0], 'getTileJSON correctly returns tiles endpoint');
  }

  for (const tc of VERSION_TEST_CASES) {
    setDefaultCredentials({
      username: 'public',
      apiKey: 'default_public',
      mapsVersion: tc
    });

    try {
      await _getTileJSON(CFG);
    } catch (err) {
      t.pass(`Correctly throws ${err}`);
    }
  }

  t.end();

  _global.fetch = fetch;
});
