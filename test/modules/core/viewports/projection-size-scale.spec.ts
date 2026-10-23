// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Buffer} from '@luma.gl/core';
import {
  _CustomProjectionViewport as CustomProjectionViewport,
  Viewport,
  MapView
} from '@deck.gl/core';
import ProjectionScaleResources from '@deck.gl/core/lib/projection-scale-resources';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {projectionEngine} from '@math.gl/projection';
import {createTestCRS, createTestViewport} from './test-crs';
import {PROJECTION_MODE} from '@deck.gl/core/shaderlib/project/constants';

const normalizationScale = 512 / 40075016.6855;
const options = {bounds: [0, 0, 512, 512]};

// Scale failure belongs to the descriptor. Texture construction must never sample
// the camera fallback that getDistanceScales exposes to aggregation and navigation.
test('unavailable descriptor samples stay invalid while viewport sizing falls back', () => {
  let unavailable = false;
  const viewport = createTestViewport({
    ...options,
    distanceScale: () => (unavailable ? null : [2, 3, 4])
  });
  unavailable = true;
  expect(viewport.getDistanceScales([128, 128])).toBe(viewport.distanceScales);
  expect(Array.from(viewport.getSizeScaleData(2))).toEqual(new Array(16).fill(0));
});

test('descriptor errors propagate without silently substituting camera scales', () => {
  let fail = false;
  const viewport = createTestViewport({
    ...options,
    distanceScale: () => {
      if (fail) throw new Error('Invalid CRS distance scale');
      return [1, 1, 1];
    }
  });
  fail = true;
  expect(() => viewport.getDistanceScales([128, 128])).toThrow('Invalid CRS distance scale');
  expect(() => viewport.getSizeScaleData(2)).toThrow('Invalid CRS distance scale');
});

test('sampler normalization uses descriptor bounds independently of common-space units', () => {
  const viewport = createTestViewport({bounds: [1000, -3000, 2024, 1096]});
  expect(viewport.sizeScaleTransform).toEqual([0.5, 0.125, -500, 375]);
  expect(viewport.projectFlat([1500, -2000])).toEqual([
    1500 * normalizationScale,
    -2000 * normalizationScale
  ]);
});

test('texture sizing uses the supplied Jacobian scalar instead of the product of XY factors', () => {
  const viewport = createTestViewport({...options, distanceScale: () => [0.25, 1, 2]});
  expect(viewport.distanceScales.unitsPerMeter).toEqual(
    [4, 1, 0.5].map(value => value * normalizationScale)
  );
  const data = viewport.getSizeScaleData(4);
  for (let offset = 0; offset < data.length; offset += 4)
    expect(Array.from(data.slice(offset, offset + 4))).toEqual([0.5, 0, 0, 0.5]);
});

test('texture scales account for feet while positions and sizes retain their physical lengths', () => {
  const viewport = createTestViewport({
    ...options,
    metersPerUnit: [0.3048, 0.3048, 1],
    distanceScale: () => [0.3048, 0.3048, 1]
  });
  expect(viewport.distanceScales.unitsPerWorldUnit).toEqual(
    [0.3048, 0.3048, 1].map(value => value * normalizationScale)
  );
  viewport.distanceScales.unitsPerMeter.forEach(value =>
    expect(value).toBeCloseTo(normalizationScale, 12)
  );
  expect(viewport.getSizeScaleData(2)[0]).toBeCloseTo(1 / 0.3048, 6);
  expect(viewport.getSizeScaleData(2)[3]).toBe(1);
});

test('scalar slopes use sampler units without evaluating converters', () => {
  const inverse = vi.fn(p => p.slice());
  const distanceScale = vi.fn(
    ([x, y]) => [1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y)] as const
  );
  const viewport = createTestViewport({
    ...options,
    converter: {forward: p => p.slice(), inverse},
    distanceScale
  });
  inverse.mockClear();
  distanceScale.mockClear();
  const data = viewport.getSizeScaleData(4);
  expect(inverse).not.toHaveBeenCalled();
  expect(distanceScale).toHaveBeenCalledTimes(16);
  for (let i = 0; i < 16; i++) {
    expect(data[i * 4 + 1]).toBe(1);
    expect(data[i * 4 + 2]).toBe(2);
    expect(data[i * 4 + 3]).toBe(data[i * 4]);
  }
});

test('scale padding extrapolates one ring and preserves the Jacobian scalar in Z units', () => {
  const distanceScale = vi.fn(([x, y]) =>
    x >= 192 && x <= 320 && y >= 192 && y <= 320
      ? ([1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y)] as const)
      : null
  );
  const viewport = createTestViewport({...options, distanceScale});
  distanceScale.mockClear();
  const data = viewport.getSizeScaleData(8);
  expect(distanceScale).toHaveBeenCalledTimes(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      expect(Array.from(data.slice((y * 8 + x) * 4, (y * 8 + x + 1) * 4))).toEqual(
        x >= 2 && x <= 5 && y >= 2 && y <= 5
          ? [
              10 + (x + 0.5) * 64 + 2 * (y + 0.5) * 64,
              1,
              2,
              10 + (x + 0.5) * 64 + 2 * (y + 0.5) * 64
            ]
          : [0, 0, 0, 0]
      );
    }
  }
});

test('scale padding rejects nonpositive extrapolation and leaves a wholly invalid field empty', () => {
  const viewport = createTestViewport({
    ...options,
    distanceScale: ([x]) => (x > 300 ? [1 / (x - 300), 1 / (x - 300), 1 / (x - 300)] : null)
  });
  expect(Array.from(viewport.getSizeScaleData(4).slice(0, 8))).toEqual(new Array(8).fill(0));
  const invalid = createTestViewport({...options, distanceScale: () => null});
  expect(Array.from(invalid.getSizeScaleData(4))).toEqual(new Array(64).fill(0));
});

test('Mercator scalar sizing is uniform in common space and varies with latitude', async () => {
  const crs = await projectionEngine.getCRS('EPSG:3857');
  const viewport = new CustomProjectionViewport({crs});
  const data = viewport.getSizeScaleData(8);
  expect(data[(5 * 8 + 4) * 4]).toBeGreaterThan(data[(4 * 8 + 4) * 4]);
  for (let offset = 0; offset < data.length; offset += 4)
    expect(data[offset + 3]).toBe(data[offset]);
});

test('ViewManager releases removed views scale resources while retaining active views', () => {
  const resources = new ProjectionScaleResources(device);
  const first = resources.get(createTestViewport({...options, id: 'first'}))!;
  const second = resources.get(createTestViewport({...options, id: 'second'}))!;
  const viewManager = new ViewManager({
    views: [new MapView({id: 'first'}), new MapView({id: 'second'})],
    viewState: {longitude: 0, latitude: 0, zoom: 1},
    onViewRemoved: viewId => resources.delete(viewId)
  });
  try {
    viewManager.setProps({views: [new MapView({id: 'second'})]});
    expect(first.destroyed).toBe(true);
    expect(second.destroyed).toBe(false);
    viewManager.setProps({views: []});
    expect(second.destroyed).toBe(true);
    const recreated = resources.get(createTestViewport({...options, id: 'first'}))!;
    expect(recreated).not.toBe(first);
    expect(recreated.destroyed).toBe(false);
  } finally {
    viewManager.finalize();
    resources.destroy();
  }
});

test('external scale resource is reused across camera changes and released on replacement/finalize', () => {
  const textures = new ProjectionScaleResources(device);
  const viewport = createTestViewport(options);
  const generate = vi.spyOn(viewport, 'getSizeScaleData');
  const texture = textures.get(viewport)!;
  if (texture instanceof Buffer) {
    expect(texture.byteLength).toBe(64 * 64 * 16);
    expect(texture.usage & Buffer.STORAGE).toBeTruthy();
  } else {
    expect(texture.width).toBe(64);
  }
  const camera = createTestViewport({
    ...options,
    center: [280, 290, 0],
    zoom: 5,
    pitch: 40,
    bearing: 30
  });
  const cameraGenerate = vi.spyOn(camera, 'getSizeScaleData');
  expect(textures.get(camera)).toBe(texture);
  expect(generate).toHaveBeenCalledTimes(1);
  expect(cameraGenerate).not.toHaveBeenCalled();
  const replacement = textures.get(createTestViewport({...options, signature: 'changed'}))!;
  expect(replacement).not.toBe(texture);
  expect(texture.destroyed).toBe(true);
  const fallback = textures.get(new Viewport());
  expect(fallback).toBeUndefined();
  expect(textures.get(new Viewport())).toBe(fallback);
  textures.destroy();
  expect(replacement.destroyed).toBe(true);
  vi.restoreAllMocks();
});

test('WebGPU external scale uses float storage records and no resource for ordinary views', async t => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    t.skip();
    return;
  }
  const createBuffer = vi.spyOn(webgpuDevice, 'createBuffer');
  const createTexture = vi.spyOn(webgpuDevice, 'createTexture');
  const resources = new ProjectionScaleResources(webgpuDevice);
  try {
    const viewport = createTestViewport(options);
    const resource = resources.get(viewport)!;
    expect(resource).toBeInstanceOf(Buffer);
    expect(createBuffer).toHaveBeenLastCalledWith({
      id: 'project-size-scale',
      data: viewport.getSizeScaleData(),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
    expect(resources.get(viewport)).toBe(resource);
    expect(createBuffer).toHaveBeenCalledTimes(1);
    const fallback = resources.get(new Viewport());
    expect(fallback).toBeUndefined();
    expect(createBuffer).toHaveBeenCalledTimes(1);
    expect(createTexture).not.toHaveBeenCalled();
    resources.destroy();
    expect(resource.destroyed).toBe(true);
  } finally {
    resources.destroy();
    createBuffer.mockRestore();
    createTexture.mockRestore();
  }
});

test('base CRS viewport uses identity shaders without allocating scale resources', () => {
  const viewport = new Viewport({
    crs: createTestCRS({
      converter: {
        forward: ([x, y, z = 0]) => [x * 2, y * 3, z],
        inverse: ([x, y, z = 0]) => [x / 2, y / 3, z]
      }
    })
  });
  expect(viewport.projectionMode).toBe(PROJECTION_MODE.IDENTITY);
  expect(viewport.projectPosition([10, 20, 30])).toEqual([20, 60, 30]);
  expect(viewport.unprojectPosition([20, 60, 30])).toEqual([10, 20, 30]);
  const createBuffer = vi.spyOn(device, 'createBuffer');
  const createTexture = vi.spyOn(device, 'createTexture');
  const resources = new ProjectionScaleResources(device);
  try {
    expect(resources.get(viewport)).toBeUndefined();
    expect(createBuffer).not.toHaveBeenCalled();
    expect(createTexture).not.toHaveBeenCalled();
  } finally {
    resources.destroy();
    createBuffer.mockRestore();
    createTexture.mockRestore();
  }
});
