import {getResolution, cellToParent, hexToBigInt} from 'quadbin';
import {_Tile2DHeader as Tile2DHeader} from '@deck.gl/geo-layers';
import {getQuadbinPolygon} from './quadbin-utils';

export function aggregateTile(tile: Tile2DHeader<any>, aggregationLevels: number) {
  // Aggregate on demand and cache result
  if (!tile.userData) tile.userData = {};
  if (tile.userData[aggregationLevels]) return;
  const weightParam = Object.keys(tile.data[0].properties).find(k => k.includes('_count'));

  const out: any = {};
  for (const cell of tile.data) {
    let id = cell.id;
    const {properties} = cell;

    // TODO don't hardcode
    const havePosition =
      ('lon_average' in properties && 'lat_average' in properties) ||
      ('longitude_average' in properties && 'latitude_average' in properties);
    const position = havePosition
      ? [
          properties.lon_average || properties.longitude_average,
          properties.lat_average || properties.latitude_average
        ]
      : getQuadbinPolygon(id, 0.5).slice(2, 4);

    // Aggregate by parent id
    for (let i = 0; i < aggregationLevels - 1; i++) {
      id = cellToParent(id);
    }

    if (!(id in out)) {
      // TODO better to store sourceTile elsewhere?
      out[id] = {id, count: 0, position: [0, 0], __sourceTile: tile};
    }

    const prevTotalW = out[id].count;
    out[id].count += cell.properties[weightParam];

    const totalW = out[id].count;
    const W = totalW - prevTotalW;
    out[id].position[0] = (prevTotalW * out[id].position[0] + W * position[0]) / totalW;
    out[id].position[1] = (prevTotalW * out[id].position[1] + W * position[1]) / totalW;
  }

  tile.userData[aggregationLevels] = Object.values(out);
}

// TODO remove once API fixed
export function brokenCell(d) {
  // Hide broken cells
  const parent = d.__sourceTile.index.q;
  const parentRes = getResolution(parent);
  let id = d.id;
  while (getResolution(id) > parentRes) {
    id = cellToParent(id);
  }
  return id !== parent;
}

export function formatCount(count: number): string {
  if (count < 1000) {
    return `${count}`;
  }
  if (count < 1000000) {
    const thousands = Math.floor(count / 1000);
    return `${thousands}k`;
  }
  const millions = Math.floor(count / 1000000);
  return `${millions}M`;
}

export function highlightBroken(layers) {
  return layers.map(
    l =>
      l?.clone({
        getFillColor: d => {
          const parent = hexToBigInt(d.tile);
          const parentRes = getResolution(parent);
          let id = d.id;
          while (getResolution(id) > parentRes) {
            id = cellToParent(id);
          }
          const tileTint = (0 * (parseInt(d.tile.slice(4, 6), 16) * 57)) % 255;
          if (id !== parent) {
            console.log(`tile: ${d.tile}, cell: ${bigIntToHex(d.id)}`);
          }
          return id === parent ? [0, 255, tileTint] : [255, 0, tileTint];
        },
        stroked: true,
        getLineColor: [0, 0, 0],
        lineWidthMinPixels: 1
      })
  );
}
