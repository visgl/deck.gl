// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_Tileset2D as Tileset2D} from '@deck.gl/geo-layers';
import {bigIntToHex, cellToParent, cellToTile, getResolution, tileToCell} from 'quadbin';

// Shape returned by the base Tileset2D.getTileIndices and consumed by quadbin's
// tileToCell/cellToTile — same as TileIndex from geo-layers, inlined here to avoid
// a dependency on the internal type.
type XYZTileIndex = {x: number; y: number; z: number};

// For calculations bigint representation is used, but
// for constructing URL also provide the hexidecimal value
type QuadbinTileIndex = {q: bigint; i?: string};

export default class QuadbinTileset2D extends Tileset2D<QuadbinTileIndex> {
  getTileIndices(opts): QuadbinTileIndex[] {
    // super.getTileIndices is typed as QuadbinTileIndex[] (from the generic) but the
    // default base implementation actually returns {x,y,z} tiles, which we convert here.
    return (super.getTileIndices(opts) as unknown as XYZTileIndex[])
      .map(tileToCell)
      .map(q => ({q, i: bigIntToHex(q)}));
  }

  getTileId({q, i}: QuadbinTileIndex): string {
    return i || bigIntToHex(q);
  }

  getTileMetadata({q}: QuadbinTileIndex) {
    // Base impl reads {x,y,z}; quadbin's cellToTile returns that shape.
    return super.getTileMetadata(cellToTile(q) as unknown as QuadbinTileIndex);
  }

  getTileZoom({q}: QuadbinTileIndex): number {
    return Number(getResolution(q));
  }

  getParentIndex({q}: QuadbinTileIndex): QuadbinTileIndex {
    return {q: cellToParent(q)};
  }
}
