import test from 'tape-catch';
import Tile2DHeader from '@deck.gl/geo-layers/tile-layer/tile-2d-header';

test('Tile2DHeader', t => {
  let onTileErrorCalled = false;

  const getTileData = () => {
    throw new Error('Synchronous getTileData with error');
  };

  const tile2d = new Tile2DHeader({
    onTileError: () => {
      onTileErrorCalled = true;
    }
  });
  tile2d.loadData(getTileData);

  t.ok(tile2d.isLoaded, 'Tile is loaded');
  t.ok(onTileErrorCalled, 'onTileError called');
  t.end();
});
