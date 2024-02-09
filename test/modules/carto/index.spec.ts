import test from 'tape-catch';
import {CartoLayer} from '@deck.gl/carto';

test('global#CartoLayerLibrary', t => {
  t.ok(globalThis.CartoLayerLibrary, 'CartoLayerLibrary is exported');
  t.ok(globalThis.CartoLayerLibrary.CartoLayer, 'CartoLayerLibrary contains CartoLayer');
  t.same(globalThis.CartoLayerLibrary.CartoLayer, CartoLayer, 'CartoLayer is valid');

  t.end();
});
