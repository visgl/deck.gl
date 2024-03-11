import {rasterSource} from '@deck.gl/carto';
import test from 'tape-catch';
import {withMockFetchMapsV3} from '../mock-fetch';

test('rasterSource', async t => {
  await withMockFetchMapsV3(async calls => {
    const tilejson = await rasterSource({
      connectionName: 'carto_dw',
      accessToken: '<token>',
      tableName: 'a.b.raster_table'
    });

    t.is(calls.length, 2, 'calls fetch() x2');

    const [initCall, tilesetCall] = calls;

    t.match(initCall.url, /v3\/maps\/carto_dw\/raster/, 'connection');
    t.match(initCall.url, /name=a\.b\.raster_table/, 'table');

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
