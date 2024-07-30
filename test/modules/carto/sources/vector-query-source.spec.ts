import {vectorQuerySource} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';

test('vectorQuerySource', async t => {
  await withMockFetchMapsV3(async calls => {
    const tilejson = await vectorQuerySource({
      connectionName: 'carto_dw',
      accessToken: '<token>',
      sqlQuery: 'SELECT * FROM a.b.vector_table',
      columns: ['a', 'b'],
      spatialDataColumn: 'mygeom',
      queryParameters: {type: 'Supermarket', minRevenue: 1000000}
    });

    t.is(calls.length, 2, 'calls fetch() x2');

    const [initCall, tilesetCall] = calls;

    t.match(initCall.url, /v3\/maps\/carto_dw\/query/, 'connection');
    t.match(initCall.url, /q=SELECT\+\*\+FROM\+a\.b\.vector_table/, 'query');
    t.match(initCall.url, /columns=a%2Cb/, 'columns');
    t.match(initCall.url, /spatialDataColumn=mygeom/, 'spatialDataColumn');
    t.match(initCall.url, /spatialDataType=geo/, 'spatialDataType');
    t.match(
      initCall.url,
      /queryParameters=%7B%22type%22%3A%22Supermarket%22%2C%22minRevenue%22%3A1000000%7D/,
      'queryParameters'
    );

    t.match(tilesetCall.url, /^https:\/\/xyz\.com\/\?format\=tilejson\&cache\=/, 'tileset URL');

    t.ok(tilejson, 'returns tilejson');
    t.deepEqual(
      tilejson.tiles,
      ['https://xyz.com/{z}/{x}/{y}?formatTiles=binary'],
      'tilejson.tiles'
    );
    t.equal(tilejson.accessToken, '<token>', 'tilejson.accessToken');
  }).catch(t.fail);
  t.end();
});
