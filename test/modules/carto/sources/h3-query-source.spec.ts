import {h3QuerySource} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';

test('h3QuerySource', async t => {
  await withMockFetchMapsV3(async calls => {
    const tilejson = await h3QuerySource({
      connectionName: 'carto_dw',
      accessToken: '<token>',
      sqlQuery: 'SELECT * FROM a.b.h3_table',
      aggregationExp: 'SUM(population) as pop'
    });

    t.is(calls.length, 2, 'calls fetch() x2');

    const [initCall, tilesetCall] = calls;

    t.match(initCall.url, /v3\/maps\/carto_dw\/query/, 'connection');
    t.match(initCall.url, /aggregationExp=SUM\(population\)%20as%20pop/, 'aggregationExp');
    t.match(initCall.url, /spatialDataColumn=h3/, 'spatialDataColumn');
    t.match(initCall.url, /spatialDataType=h3/, 'spatialDataType');
    t.match(initCall.url, /q=SELECT%20\*%20FROM%20a\.b\.h3_table/, 'query');

    t.match(tilesetCall.url, /^https:\/\/xyz\.com\?format\=tilejson\&cache\=/, 'tileset URL');

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
