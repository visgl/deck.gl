import {query} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3, QUERY_RESPONSE} from '../mock-fetch';

test('query', async t => {
  await withMockFetchMapsV3(async calls => {
    const response = await query({
      connectionName: 'carto_dw',
      clientId: 'CUSTOM_CLIENT',
      accessToken: '<token>',
      sqlQuery: 'SELECT * FROM a.b.h3_table'
    });

    t.is(calls.length, 1, 'calls fetch() x1');

    const [queryCall] = calls;

    t.match(queryCall.url, /v3\/sql\/carto_dw\/query/, 'connection');
    t.match(queryCall.url, /q=SELECT%20\*%20FROM%20a\.b\.h3_table/, 'query');
    t.match(queryCall.url, /client\=CUSTOM_CLIENT/, 'clientId');

    t.ok(response, 'returns response');
    t.deepEqual(response, QUERY_RESPONSE, 'correct response');
  }).catch(t.fail);
  t.end();
});
