import test from 'node:test';
import assert from 'node:assert/strict';
import {tableFromIPC} from 'apache-arrow';
import {parsePolygonsToSolid, parseSphere} from '@ateliercartographie/geoarrow-deck-stream';
import type {BinaryPolygonData} from '@ateliercartographie/geoarrow-deck-stream';
import {fixtureIPC} from '../fixtures.ts';
import {createProjection} from '../projections.ts';
import {clipToImage, createRasterMesh, sourceUV} from '../raster.ts';

test('clipping interpolates target positions at texture boundaries', () => {
  const clipped = clipToImage([
    [-10, 0, -1, 0],
    [10, 0, 1, 0],
    [10, 10, 1, 1]
  ]);
  assert(clipped.some(v => v[0] === 0 && v[2] === 0));
  assert(clipped.some(v => v[0] === 0 && v[1] === 5 && v[2] === 0 && v[3] === 0.5));
  assert(clipped.every(v => v[2] >= 0 && v[2] <= 1 && v[3] >= 0 && v[3] <= 1));
});
test('source fixtures include the south pole and a rotated antimeridian footprint', () => {
  assert.deepEqual(sourceUV('polar', 0, -90), [0.5, 0.5]);
  for (const longitude of [179, -179]) {
    const uv = sourceUV('rotated', longitude, 15);
    assert(uv.every(v => v > 0 && v < 1));
  }
});
for (const name of ['equirectangular', 'orthographic', 'interrupted']) {
  test(`${name}: GeoArrow stream produces finite indexed geometry with source identity`, () => {
    const data = parsePolygonsToSolid(tableFromIPC(fixtureIPC()), {
      projection: createProjection(name)
    });
    assert(data.indices && data.indices.length > 0);
    assert(data.positions.every(Number.isFinite));
    assert(data.indices.every(i => i * 2 < data.positions.length));
    assert(data.featureIds.every(i => i < 3));
    if (name === 'equirectangular') {
      assert(data.featureIds.filter(i => i === 0).length >= 2, 'seam splits preserve source row');
      assert(data.holeIndices.length > data.polygonIndices.length, 'hole is preserved');
    }
  });
  for (const kind of ['world', 'rotated', 'polar'] as const) {
    test(`${name}/${kind}: domain-constrained raster has finite positions and clipped UVs`, () => {
      const projection = createProjection(name);
      const domain = parseSphere(projection, {output: 'polygon'}) as BinaryPolygonData;
      const mesh = createRasterMesh(domain, projection, kind, 12);
      if (name === 'orthographic' && kind === 'rotated') {
        assert.equal(mesh.indices.value.length, 0, 'source image is behind the horizon');
      } else {
        assert(mesh.indices.value.length > 0);
      }
      assert(mesh.attributes.positions.value.every(Number.isFinite));
      assert(mesh.attributes.texCoords.value.every(v => v >= -1e-6 && v <= 1 + 1e-6));
      const uv = mesh.attributes.texCoords.value;
      if (kind === 'world')
        for (let i = 0; i < mesh.indices.value.length; i += 3) {
          const us = Array.from(mesh.indices.value.slice(i, i + 3), index => uv[index * 2]);
          assert(
            Math.max(...us) - Math.min(...us) <= 0.5,
            'no triangle interpolates across the texture seam'
          );
        }
    });
  }
}

test('interrupted polar polygons do not bridge the target-domain gaps', () => {
  const projection = createProjection('interrupted');
  const domain = parseSphere(projection, {output: 'polygon'}) as BinaryPolygonData;
  const features = parsePolygonsToSolid(tableFromIPC(fixtureIPC()), {projection});
  function contains(x: number, y: number) {
    let inside = false;
    for (let ring = 0; ring + 1 < domain.holeIndices.length; ring++) {
      const start = domain.holeIndices[ring],
        end = domain.holeIndices[ring + 1];
      for (let i = start, j = end - 1; i < end; j = i++) {
        const ax = domain.positions[i * 2],
          ay = domain.positions[i * 2 + 1];
        const bx = domain.positions[j * 2],
          by = domain.positions[j * 2 + 1];
        if (ay > y !== by > y && x < ((bx - ax) * (y - ay)) / (by - ay) + ax) inside = !inside;
      }
    }
    return inside;
  }
  for (let i = 0; i < features.indices!.length; i += 3) {
    const vertices = Array.from(features.indices!.slice(i, i + 3));
    const x = vertices.reduce((sum, v) => sum + features.positions[v * 2], 0) / 3;
    const y = vertices.reduce((sum, v) => sum + features.positions[v * 2 + 1], 0) / 3;
    assert(contains(x, y), `triangle centroid ${x},${y} lies in a lobe`);
  }
});
