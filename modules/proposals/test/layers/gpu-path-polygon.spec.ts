// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView, type PickingInfo} from '@deck.gl/core';
import {GPUPathLayer} from '@deck.gl/proposals/layers/path-layer';
import {GPUPolygonLayer, type GPUPolygonLayerProps} from '@deck.gl/proposals/layers/polygon-layer';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {GPUVector, type VertexList} from '@luma.gl/graph/gpu-data';
import {makeGPUVectorFromArrow} from '@luma.gl/graph/arrow';
import {Field, FixedSizeList, Float32, List, Uint32, vectorFromArray} from 'apache-arrow';
import {expect, test} from 'vitest';

test('GPU path joins and width clamps affect rendered picking', async ({skip}) => {
  const device = await getWebGPUTestDevice('core');
  if (!device) return skip();
  const type = new List(new Field('points', new FixedSizeList(2, new Field('xy', new Float32()))));
  const paths = makeGPUVectorFromArrow(
    device,
    vectorFromArray(
      [
        [
          [-32, 0],
          [0, 0],
          [0, 32]
        ]
      ],
      type
    ),
    {format: 'vertex-list<float32x2>'}
  );
  const layer = new GPUPathLayer({
    id: 'path',
    paths,
    widths: 20,
    widthMaxPixels: 12,
    pickable: true
  });
  const parent = document.createElement('div');
  document.body.append(parent);
  const deck = new Deck({
    parent,
    device,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView({near: -1000, far: 100}),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    layers: [layer]
  });
  try {
    await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
    await expect.poll(() => layer.getModels()[0]?.pipeline.linkStatus).toBe('success');
    // Outside both unjoined segment rectangles, but inside the miter corner.
    expect((await deck.pickObjectAsync({x: 67, y: 67}))?.index).toBe(0);
    expect(await deck.pickObjectAsync({x: 48, y: 72})).toBeNull();
  } finally {
    deck.finalize();
    parent.remove();
    paths.destroy();
  }
});

test('GPU polygon outline rows can resolve to the fill feature ID', () => {
  const polygon = new GPUPolygonLayer({
    id: 'polygon',
    pathFeatureIds: [0, 0, 1]
  } as GPUPolygonLayerProps);
  const outline = new GPUPathLayer({id: 'polygon-stroke'} as never);
  const info = {index: 1} as PickingInfo;
  expect(polygon.getPickingInfo({info, sourceLayer: outline, mode: 'query'}).index).toBe(0);
});

test('GPU polygon fill and hole outline pick the same feature', async ({skip}) => {
  const device = await getWebGPUTestDevice('core');
  if (!device) return skip();
  const xy = new FixedSizeList(2, new Field('xy', new Float32()));
  const xyzw = new FixedSizeList(4, new Field('xyzw', new Float32()));
  const outer = [
    [-32, -32],
    [32, -32],
    [32, 32],
    [-32, 32]
  ];
  const inner = [
    [-12, -12],
    [12, -12],
    [12, 12],
    [-12, 12]
  ];
  const positions = makeGPUVectorFromArrow(
    device,
    vectorFromArray(
      [[...outer, ...inner].map(([x, y]) => [x, y, 0, 0])],
      new List(new Field('positions', xyzw))
    ),
    {format: 'vertex-list<float32x4>'}
  );
  const list = new List(new Field('value', new Uint32()));
  const rowIndices = makeGPUVectorFromArrow(
    device,
    vectorFromArray([[7, 7, 7, 7, 7, 7, 7, 7]], list),
    {format: 'vertex-list<uint32>'}
  );
  const indexValues = new Uint32Array([
    0, 1, 5, 0, 5, 4, 1, 2, 6, 1, 6, 5, 2, 3, 7, 2, 7, 6, 3, 0, 4, 3, 4, 7
  ]);
  const indices = new GPUVector<VertexList<'uint32'>>({
    type: 'buffer',
    name: 'indices',
    buffer: device.createBuffer({data: indexValues, usage: Buffer.INDEX}),
    dataType: list,
    format: 'vertex-list<uint32>',
    length: 1,
    valueLength: indexValues.length,
    stride: 1,
    byteStride: 4,
    ownsBuffer: true
  });
  const paths = makeGPUVectorFromArrow(
    device,
    vectorFromArray(
      [
        [...outer, outer[0]],
        [...inner, inner[0]]
      ],
      new List(new Field('paths', xy))
    ),
    {format: 'vertex-list<float32x2>'}
  );
  const layer = new GPUPolygonLayer({
    id: 'polygon',
    positions,
    rowIndices,
    indices,
    paths,
    pathFeatureIds: [7, 7],
    lineWidths: 6,
    pickable: true
  });
  const parent = document.createElement('div');
  document.body.append(parent);
  const deck = new Deck({
    parent,
    device,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView({near: -1000, far: 100}),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    layers: [layer]
  });
  try {
    await expect
      .poll(() =>
        layer
          .getSubLayers()
          .flatMap(sublayer => sublayer.getModels().map(model => model.pipeline.linkStatus))
      )
      .toEqual(['success', 'success']);
    const fill = await deck.pickObjectAsync({x: 86, y: 64});
    const stroke = await deck.pickObjectAsync({x: 75, y: 64});
    expect(fill?.sourceLayer?.id).toBe('polygon-fill');
    expect(stroke?.sourceLayer?.id).toBe('polygon-stroke');
    expect([fill?.index, stroke?.index]).toEqual([7, 7]);
    expect(await deck.pickObjectAsync({x: 64, y: 64})).toBeNull();
  } finally {
    deck.finalize();
    parent.remove();
    for (const vector of [positions, rowIndices, indices, paths]) vector.destroy();
  }
});
