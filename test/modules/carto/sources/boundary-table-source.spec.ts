import {boundaryTableSource} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';

test('boundaryTableSource', async t => {
  await withMockFetchMapsV3(async calls => {
    const tilejson = await boundaryTableSource({
      connectionName: 'carto_dw',
      accessToken: '<token>',
      tilesetTableName: 'a.b.tileset_table',
      matchingColumn: 'custom_id',
      columns: ['column1', 'column2'],
      propertiesTableName: 'a.b.properties_table'
    });

    t.is(calls.length, 2, 'calls fetch() x2');

    const [initCall, tilesetCall] = calls;

    t.match(initCall.url, /v3\/maps\/carto_dw\/boundary/, 'connection');
    t.match(initCall.url, /tilesetTableName=a.b.tileset_table/, 'tilesetTableName');
    t.match(initCall.url, /matchingColumn=custom_id/, 'matchingColumn');
    t.match(initCall.url, /propertiesTableName=a.b.properties_table/, 'propertiesTableName');
    t.match(initCall.url, /columns=column1%2Ccolumn2/, 'columns');

    t.match(tilesetCall.url, /^https:\/\/xyz\.com\/\?format\=tilejson\&cache\=/, 'tileset URL');

    t.ok(tilejson, 'returns source');
    t.deepEqual(tilejson.tiles, ['https://xyz.com/{z}/{x}/{y}?formatTiles=binary'], 'source.tiles');
    t.equal(tilejson.accessToken, '<token>', 'source.accessToken');
    t.equal(tilejson.matchingColumn, 'custom_id', 'source.matchingColumn');
  }).catch(t.fail);
  t.end();
});
