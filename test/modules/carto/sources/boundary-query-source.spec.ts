import {boundaryQuerySource} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';

test('boundaryQuerySource', async t => {
  await withMockFetchMapsV3(async calls => {
    const tilejson = await boundaryQuerySource({
      connectionName: 'carto_dw',
      accessToken: '<token>',
      tilesetTableName: 'a.b.tileset_table',
      columns: ['column1', 'column2'],
      propertiesSqlQuery: 'select * from `a.b.properties_table`'
    });

    t.is(calls.length, 2, 'calls fetch() x2');

    const [initCall, tilesetCall] = calls;

    t.match(initCall.url, /v3\/maps\/carto_dw\/boundary/, 'connection');
    t.match(initCall.url, /tilesetTableName=a.b.tileset_table/, 'tilesetTableName');
    t.match(
      initCall.url,
      /propertiesSqlQuery=select\+\*\+from\+%60a.b.properties_table%60/,
      'propertiesSqlQuery'
    );
    t.match(initCall.url, /columns=column1%2Ccolumn2/, 'columns');

    t.match(tilesetCall.url, /^https:\/\/xyz\.com\/\?format\=tilejson\&cache\=/, 'tileset URL');

    t.ok(tilejson, 'returns source');
    t.deepEqual(tilejson.tiles, ['https://xyz.com/{z}/{x}/{y}?formatTiles=binary'], 'source.tiles');
    t.equal(tilejson.accessToken, '<token>', 'source.accessToken');
  }).catch(t.fail);
  t.end();
});
