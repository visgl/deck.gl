// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {SolidPolygonLayer, PathLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {
  createPathLayerProps,
  createPolygonFillColorAttribute
} from '@ateliercartographie/geoarrow-deck-stream';
import type {BinaryPolygonData, BinaryPathData} from '@ateliercartographie/geoarrow-deck-stream';
import type {WorkerLike} from '@ateliercartographie/geoarrow-deck-stream/worker';
import {createParseWorkerClient} from '@ateliercartographie/geoarrow-deck-stream/worker';
import {fixtureIPC, names} from './fixtures';
import {createProjection, projectionSpec} from './projections';
import {createRasterMesh} from './raster';
import type {RasterKind} from './raster';

const client = createParseWorkerClient(
  new Worker(new URL('./parse.worker.ts', import.meta.url), {
    type: 'module'
  }) as unknown as WorkerLike
);
const status = document.querySelector<HTMLOutputElement>('#status')!;
const projectionSelect = document.querySelector<HTMLSelectElement>('#projection')!;
const rasterSelect = document.querySelector<HTMLSelectElement>('#raster')!;
const texture = document.createElement('canvas');
texture.width = texture.height = 256;
const context = texture.getContext('2d')!;
for (let y = 0; y < 8; y++)
  for (let x = 0; x < 8; x++) {
    context.fillStyle = (x + y) % 2 ? '#275d8e' : '#64b5b0';
    context.fillRect(x * 32, y * 32, 32, 32);
    context.fillStyle = 'white';
    context.fillText(`${x},${y}`, x * 32 + 3, y * 32 + 18);
  }
const deck = new Deck({
  parent: document.querySelector<HTMLDivElement>('#map')!,
  views: new OrthographicView({flipY: true}),
  initialViewState: {target: [0, 0, 0], zoom: 0},
  controller: true,
  getTooltip: ({index, layer}) =>
    index >= 0 && layer?.id === 'features' ? names[featureIds[index]] : null
});
let featureIds: Uint32Array = new Uint32Array();
let generation = 0;
async function update() {
  const request = ++generation;
  const name = projectionSelect.value;
  const spec = projectionSpec(name);
  status.textContent = 'Projecting and triangulating in worker…';
  try {
    // Fresh IPC for every request: transferInput detaches the sender's buffer.
    const [features, domainResult, outlineResult] = await Promise.all([
      client.parsePolygonsToSolid(fixtureIPC(), spec, {transferInput: true}),
      client.parseSphere(spec, {output: 'polygon'}),
      client.parseSphere(spec, {output: 'path'})
    ]);
    if (request !== generation) return;
    const domain = domainResult as BinaryPolygonData;
    const outline = outlineResult as BinaryPathData;
    const mesh = createRasterMesh(domain, createProjection(name), rasterSelect.value as RasterKind);
    featureIds = features.featureIds;
    // Flat fills consume the worker's hole-aware triangle indices. No side-wall
    // vertexValid buffer is needed; extrusion would require ring-boundary handling.
    const props = {
      _normalize: false,
      data: {
        length: features.length,
        startIndices: features.polygonIndices,
        attributes: {getPolygon: {value: features.positions, size: 2}, indices: features.indices!}
      }
    };
    const colors = [
      [255, 168, 70, 200],
      [220, 80, 120, 200],
      [160, 110, 240, 200]
    ];
    deck.setProps({
      layers: [
        new SimpleMeshLayer({
          id: 'raster',
          data: [0],
          mesh,
          texture,
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getPosition: [0, 0, 0],
          getColor: [255, 255, 255],
          material: false,
          parameters: {depthCompare: 'always'}
        }),
        new SolidPolygonLayer({
          ...props,
          id: 'features',
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          data: {
            ...props.data,
            attributes: {
              ...props.data.attributes,
              getFillColor: createPolygonFillColorAttribute(
                features,
                id => colors[id] as [number, number, number, number]
              )
            }
          },
          pickable: true,
          parameters: {depthCompare: 'always'}
        }),
        new PathLayer({
          ...createPathLayerProps(outline),
          id: 'domain',
          coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
          getColor: [225, 235, 245],
          getWidth: 2,
          widthUnits: 'pixels',
          parameters: {depthCompare: 'always'}
        })
      ]
    });
    status.textContent = `${features.length} polygon pieces; ${(features.indices?.length || 0) / 3} vector triangles; ${mesh.indices.value.length / 3} raster triangles; ${mesh.unresolvedTriangles} unresolved singular triangles omitted. Hover a polygon for its source identity.`;
  } catch (error) {
    if (request === generation) status.textContent = `Failed: ${String(error)}`;
  }
}
projectionSelect.addEventListener('change', update);
rasterSelect.addEventListener('change', update);
window.addEventListener('pagehide', event => {
  // A persisted page resumes with the same module state on Back/Forward navigation.
  if (event.persisted) return;
  client.terminate();
  deck.finalize();
});
void update();
