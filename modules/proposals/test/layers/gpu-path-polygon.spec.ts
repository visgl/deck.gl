// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrbitView, OrthographicView, type PickingInfo} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {StoragePathLayer} from '@deck.gl/proposals/layers/path-layer';
import {StoragePolygonLayer} from '@deck.gl/proposals/layers/polygon-layer';
import {Buffer, Texture} from '@luma.gl/core';
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
  const layer = new StoragePathLayer({
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
  const polygon = new StoragePolygonLayer({
    id: 'polygon',
    pathFeatureIds: [0, 0, 1]
  } as never);
  const outline = new StoragePathLayer({id: 'polygon-stroke'} as never);
  const info = {index: 1} as PickingInfo;
  expect(polygon.getPickingInfo({info, sourceLayer: outline, mode: 'query'}).index).toBe(0);
});

test.for([false, true])(
  'polygon fill and outline pick the same feature (raw rings: %s)',
  async (raw, {skip}) => {
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
    const layer = new StoragePolygonLayer({
      id: 'polygon',
      ...(raw
        ? {
            polygons: vectorFromArray(
              [
                [
                  [...outer, outer[0]],
                  [...inner, inner[0]]
                ]
              ],
              new List(new Field('rings', new List(new Field('points', xy))))
            )
          }
        : {polygonMeshes: {positions, rowIndices, indices}}),
      paths,
      pathFeatureIds: raw ? [0, 0] : [7, 7],
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
      expect([fill?.index, stroke?.index]).toEqual(raw ? [0, 0] : [7, 7]);
      expect(await deck.pickObjectAsync({x: 64, y: 64})).toBeNull();
    } finally {
      deck.finalize();
      parent.remove();
      for (const vector of [positions, rowIndices, indices, paths]) vector.destroy();
    }
  }
);

function countDifferentPixels(first: Uint8Array, second: Uint8Array): number {
  let count = 0;
  for (let index = 0; index < first.length; index += 4) {
    if (Math.abs(first[index] - second[index]) > 8) count++;
  }
  return count;
}

test('GPU path matches both standard stroke modes in a tilted view', async ({skip}) => {
  const device = await getWebGPUTestDevice('core');
  if (!device) return skip();
  const points = [
    [-28, 0],
    [0, 0],
    [0, 28]
  ];
  const type = new List(new Field('points', new FixedSizeList(2, new Field('xy', new Float32()))));
  const paths = makeGPUVectorFromArrow(device, vectorFromArray([points], type), {
    format: 'vertex-list<float32x2>'
  });
  const style = {
    antialiasing: true,
    capRounded: true,
    jointRounded: true,
    pickable: true,
    widthUnits: 'pixels'
  } as const;
  const standard = new PathLayer({
    ...style,
    id: 'standard',
    data: [points],
    getPath: row => row,
    getWidth: 12,
    getColor: [255, 0, 0, 255]
  });
  const storage = new StoragePathLayer({
    ...style,
    id: 'storage',
    paths,
    widths: 12,
    colors: [255, 0, 0, 255]
  });
  const parent = document.createElement('div');
  document.body.append(parent);
  const texture = device.createTexture({
    width: 128,
    height: 128,
    format: 'rgba8unorm',
    usage: Texture.RENDER_ATTACHMENT | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: 128,
    height: 128,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth24plus'
  });
  const deck = new Deck({
    parent,
    device,
    width: 128,
    height: 128,
    useDevicePixels: false,
    _framebuffer: framebuffer,
    views: new OrbitView({orbitAxis: 'Z'}),
    initialViewState: {target: [0, 0, 0], zoom: 0, rotationX: 50},
    layers: []
  });
  async function render(layer: PathLayer | StoragePathLayer): Promise<Uint8Array> {
    deck.setProps({layers: [layer]});
    await expect
      .poll(() => layer.getModels()[0]?.pipeline.linkStatus, {timeout: 5000})
      .toBe('success');
    deck.redraw('stroke comparison');
    const readback = device.createBuffer({
      byteLength: 128 * 128 * 4,
      usage: Buffer.COPY_DST | Buffer.MAP_READ
    });
    try {
      texture.readBuffer({}, readback);
      return await readback.readAsync();
    } finally {
      readback.destroy();
    }
  }
  try {
    const captures: Uint8Array[] = [];
    for (const billboard of [false, true]) {
      const expected = await render(standard.clone({billboard}));
      const actual = await render(storage.clone({billboard}));
      captures.push(expected);
      const red = actual.filter((_value, index) => index % 4 === 0);
      expect(red.some(value => value > 0 && value < 255)).toBe(true);
      expect(countDifferentPixels(actual, expected)).toBeLessThan(16);
      const [x, y] = deck.getViewports()[0].project([-30, 0, 0]);
      expect((await deck.pickObjectAsync({x: Math.round(x), y: Math.round(y)}))?.index).toBe(0);
    }
    expect(countDifferentPixels(captures[0], captures[1])).toBeGreaterThan(16);
  } finally {
    deck.finalize();
    framebuffer.destroy();
    texture.destroy();
    parent.remove();
    paths.destroy();
  }
});
