import {WebMercatorViewport} from '@deck.gl/core';

///////////////////////////////////////////////////////////////////////////////
// UTILITIES (see script tags in index.html)
//

// Support h3 v3/v4 (https://h3geo.org/docs/library/migration-3.x/functions)
const kRing = h3.kRing || h3.gridDisk;
const geoToH3 = h3.geoToH3 || h3.latLngToCell;
const getH3UnidirectionalEdgesFromHexagon =
  h3.getH3UnidirectionalEdgesFromHexagon || h3.originToDirectedEdges;
const exactEdgeLength = h3.exactEdgeLength || h3.edgeLength;
const h3ToGeoBoundary = h3.h3ToGeoBoundary || h3.cellToBoundary;
const polyfill = h3.polyfill || h3.polygonToCells;
const getRes0Indexes = h3.getRes0Indexes;

// H3 helpers
export function getHexagonsInView(view, resolution: number) {
  const viewport = new WebMercatorViewport(view);
  if (resolution >= 15) {
    const center = geoToH3(viewport.latitude, viewport.longitude, 15);
    return kRing(center, 1);
  }

  let polygon = [
    viewport.unproject([0, 0]),
    viewport.unproject([viewport.width, 0]),
    viewport.unproject([viewport.width, viewport.height]),
    viewport.unproject([0, viewport.height])
  ];
  polygon.push([...polygon[0]]);

  const lonList = polygon.map(c => c[0]);
  const [west, east] = [Math.min(...lonList), Math.max(...lonList)];

  polygon = turf.polygon([polygon]);

  let hexagons = [];
  const el = document.getElementById('textfield2');

  if (east - west > 140) {
    // 140 is heuristic
    // For longitude spans greater than 180 h3 polyfill doesn't work
    // and turf.buffer has issues also, so just take all hexagons
    hexagons = getRes0Indexes();
    el.innerHTML = `Edge length: -`;
  } else {
    // Probably overkill to consider all edges
    // hexagons = getHexagonsInPolygon(polygon, resolution);
    if (!hexagons.length) {
      hexagons.push(geoToH3(viewport.latitude, viewport.longitude, resolution));
    }

    let edges = [];
    hexagons.forEach(h => {
      edges = edges.concat(getH3UnidirectionalEdgesFromHexagon(h));
    });
    const edgeLengths = edges.map(e => exactEdgeLength(e, 'km'));
    const maxEdgeLength = Math.max(...edgeLengths);
    el.innerHTML = `Edge length: ${Math.round(1000 * maxEdgeLength)}m`;

    const buffered = turf.buffer(polygon, maxEdgeLength); // Doesn't work for polygons wider than world
    hexagons = getHexagonsInPolygon(buffered, resolution);
  }

  const visible = hexagons.filter(h => {
    const boundary = h3ToGeoBoundary(h, true);
    return turf.booleanIntersects(turf.lineString(boundary), polygon);
  });

  const el2 = document.getElementById('textfield3');
  el2.innerHTML = `Culled: ${hexagons.length - visible.length}`;
  return visible;
}

export function getHexagonsInPolygon(polygon, resolution) {
  return polyfill(polygon.geometry.coordinates, resolution, true);
}
