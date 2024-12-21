// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';

function tileToQuadkey(tile) {
  let index = '';
  for (let z = tile.z; z > 0; z--) {
    let b = 0;
    const mask = 1 << (z - 1);
    if ((tile.x & mask) !== 0) b++;
    if ((tile.y & mask) !== 0) b += 2;
    index += b.toString();
  }
  return {q: index};
}

export default class QuadkeyTileset2D extends Tileset2D {
  getTileIndices(opts) {
    return super.getTileIndices(opts).map(tileToQuadkey);
  }

  getTileId({q}) {
    return q;
  }

  getTileMetadata() {
    return {};
  }

  getTileZoom({q}) {
    return q.length;
  }

  getParentIndex(index) {
    const q = index.q.slice(0, -1);
    return {q};
  }
}
