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
import {lngLatToWorld, worldToLngLat} from '@math.gl/web-mercator';
import {Ellipsoid} from '@math.gl/geospatial';

const normalizationScale = 512 / 40075016.6855;
const projection = {forward: p => p.slice(), inverse: p => p.slice()};
const options = {
  projection,
  fromCrs: '+units=m',
  toBounds: [0, 0, 512, 512] as [number, number, number, number]
};

test.each(['throw', 'nonfinite', 'degenerate'])(
  'failed %s derivative samples stay invalid while viewport sizing falls back',
  failure => {
    let fail = false;
    const viewport = new CustomProjectionViewport({
      ...options,
      projection: {
        inverse: p => p.slice(),
        forward: p => {
          // Texel centers round-trip, but their one-meter derivative probes fail.
          if (fail && (p[0] % 128 !== 0 || p[1] % 128 !== 0)) {
            if (failure === 'throw') throw new Error('Unavailable derivative');
            return failure === 'nonfinite' ? [NaN, NaN] : [128, 128];
          }
          return p.slice();
        }
      }
    });
    fail = true;
    expect(viewport.getDistanceScales([128, 128])).toBe(viewport.distanceScales);
    expect(Array.from(viewport.getSizeScaleData(2))).toEqual(new Array(16).fill(0));
  }
);

test('unavailable callback scales use camera sizing without entering the sampled field', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    getDistanceScale: ([x, y]) => {
      if (x === 0 && y === 0) return [2, 2];
      throw new Error('Unavailable scale');
    }
  });
  expect(viewport.getDistanceScales([128, 128])).toBe(viewport.distanceScales);
  expect(Array.from(viewport.getSizeScaleData(2))).toEqual(new Array(16).fill(0));
});

test('ViewManager releases removed views scale resources while retaining active views', () => {
  const resources = new ProjectionScaleResources(device);
  const first = resources.get(new CustomProjectionViewport({...options, id: 'first'}))!;
  const second = resources.get(new CustomProjectionViewport({...options, id: 'second'}))!;
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
    const recreated = resources.get(new CustomProjectionViewport({...options, id: 'first'}))!;
    expect(recreated).not.toBe(first);
    expect(recreated.destroyed).toBe(false);
  } finally {
    viewManager.finalize();
    resources.destroy();
  }
});

test('sampler bounds are independent of common-space normalization', () => {
  const defaultViewport = new CustomProjectionViewport({projection, fromCrs: '+units=m'});
  expect(defaultViewport.sizeScaleTransform).toEqual([
    normalizationScale,
    normalizationScale,
    256,
    256
  ]);
  const viewport = new CustomProjectionViewport({...options, toBounds: [1000, -3000, 2024, 1096]});
  expect(viewport.sizeScaleTransform).toEqual([0.5, 0.125, -500, 375]);
  expect(viewport.projectPosition([1500, -2000, 10])).toEqual(
    defaultViewport.projectPosition([1500, -2000, 10])
  );
  expect(viewport.projectionSignature).toBe(defaultViewport.projectionSignature);
  expect(viewport.sizeScaleSignature).not.toBe(defaultViewport.sizeScaleSignature);
  for (const toBounds of [
    [0, 0, 0, 1],
    [0, 2, 1, 1],
    [0, 0, Infinity, 1]
  ]) {
    expect(
      () =>
        new CustomProjectionViewport({
          ...options,
          toBounds: toBounds as [number, number, number, number]
        })
    ).toThrow('toBounds');
  }
});

test('local meter sizing preserves altitude and picking across camera changes', () => {
  for (const centerX of [1200, 1800]) {
    const viewport = new CustomProjectionViewport({
      ...options,
      width: 800,
      height: 600,
      pitch: 35,
      bearing: 20,
      zoom: 10,
      center: [centerX, -1000, 0],
      toBounds: [1000, -3000, 2024, 1096],
      projection: {
        forward: ([x, y, z = 0]) => [x, y, z * 0.3048],
        inverse: ([x, y, z = 0]) => [x, y, z / 0.3048]
      },
      getDistanceScale: ([x]) => [1000 / x, 1000 / x]
    });
    const world = [1500, -1000, 100];
    expect(viewport.preproject!(world)[2]).toBe(30.48);
    expect(viewport.projectPosition(world)[2] / normalizationScale).toBeCloseTo(30.48, 9);
    const pixel = viewport.project(world);
    viewport.unproject(pixel).forEach((value, i) => expect(value).toBeCloseTo(world[i], 5));
  }
});

test.each([
  {name: 'area-preserving shear', a: 1, b: 2, c: 0, d: 1, scale: 1},
  {name: 'anisotropic shear', a: 2, b: 3, c: 0, d: 8, scale: 4},
  {name: 'reflected axes', a: -2, b: 3, c: 0, d: 8, scale: 4},
  {name: 'rotated axes', a: 0, b: -2, c: 8, d: 0, scale: 4}
])('external scalar uses projected area for $name', ({a, b, c, d, scale}) => {
  const determinant = a * d - b * c;
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {
      forward: ([x, y]) => [a * x + b * y, c * x + d * y],
      inverse: ([x, y]) => [(d * x - b * y) / determinant, (a * y - c * x) / determinant]
    }
  });
  const data = viewport.getSizeScaleData(4);
  for (let offset = 0; offset < data.length; offset += 4) {
    [scale, 0, 0, scale].forEach((value, i) => expect(data[offset + i]).toBeCloseTo(value, 6));
  }
  // CPU axis-specific estimates remain available for aggregation etc.
  [Math.hypot(a, c), Math.hypot(b, d), scale].forEach((value, i) =>
    expect(viewport.getDistanceScales().unitsPerMeter[i]).toBeCloseTo(
      value * normalizationScale,
      12
    )
  );
});

test('external scale field bleeds scale and Z from valid neighbors', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {forward: projection.forward, inverse: p => (p[0] < 256 ? null : p)},
    center: [384, 256, 0],
    getDistanceScale: ([x]) => [1 / x, 1 / x]
  });
  expect(Array.from(viewport.getSizeScaleData(2))).toEqual([
    384, 0, 0, 384, 384, 0, 0, 384, 384, 0, 0, 384, 384, 0, 0, 384
  ]);
});

test('external scale field does not clamp invalid samples onto input boundaries', () => {
  const getDistanceScale = vi.fn(() => [1, 1] as [number, number]);
  const viewport = new CustomProjectionViewport({
    ...options,
    fromBounds: [0, 0, 256, 256],
    getDistanceScale
  });
  getDistanceScale.mockClear();
  expect(Array.from(viewport.getSizeScaleData(2))).toEqual([
    1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1
  ]);
  expect(getDistanceScale).toHaveBeenCalledTimes(1);
});

test('scale bleeding extrapolates one ring, including diagonals, without extra projection calls', () => {
  const inverse = vi.fn(p => p.slice());
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {forward: projection.forward, inverse},
    fromBounds: [192, 192, 320, 320],
    getDistanceScale: ([x, y]) => [1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y)]
  });
  inverse.mockClear();
  const data = viewport.getSizeScaleData(8);
  expect(inverse).toHaveBeenCalledTimes(64);
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const record = Array.from(data.slice((y * 8 + x) * 4, (y * 8 + x + 1) * 4));
      expect(record).toEqual(
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

test('scale bleeding leaves nonpositive extrapolations and wholly invalid fields empty', () => {
  const viewport = new CustomProjectionViewport({
    ...options,
    center: [400, 0, 0],
    fromBounds: [256, 0, 512, 512],
    getDistanceScale: ([x]) => [1 / (x - 300), 1 / (x - 300)]
  });
  const data = viewport.getSizeScaleData(4);
  expect(Array.from(data.slice(0, 8))).toEqual(new Array(8).fill(0));
  const invalid = new CustomProjectionViewport({
    ...options,
    projection: {forward: projection.forward, inverse: () => null}
  });
  expect(Array.from(invalid.getSizeScaleData(4))).toEqual(new Array(64).fill(0));
});

test('external scale field estimates latitude-dependent scale for XY and meter altitude', () => {
  const viewport = new CustomProjectionViewport({
    projection,
    toBounds: [-180, -90, 180, 90]
  });
  const data = viewport.getSizeScaleData(8);
  const offset = (5 * 8 + 4) * 4;
  // WGS84 surface distances at 33.75 degrees: 92654.5483 m east and
  // 110917.8786 m north per degree, independently evaluated in Earth-fixed space.
  expect(data[offset]).toBeCloseTo(1 / Math.sqrt(92654.5483 * 110917.8786), 12);
  expect(data[offset + 1]).toBeCloseTo(0, 9);
  expect(data[offset + 2]).toBeGreaterThan(0);
  expect(data[offset + 3]).toBe(data[offset]);
  expect(data[0]).toBeGreaterThan(0);
});

test('scalar slopes use sampler units and require no extra inverse calls', () => {
  const inverse = vi.fn(p => p.slice());
  const viewport = new CustomProjectionViewport({
    ...options,
    projection: {forward: projection.forward, inverse},
    getDistanceScale: ([x, y]) => [1 / (10 + x + 2 * y), 1 / (10 + x + 2 * y)]
  });
  inverse.mockClear();
  const data = viewport.getSizeScaleData(4);
  expect(inverse).toHaveBeenCalledTimes(16);
  for (let i = 0; i < 16; i++) {
    expect(data[i * 4 + 1]).toBe(1);
    expect(data[i * 4 + 2]).toBe(2);
    expect(data[i * 4 + 3]).toBe(data[i * 4]);
  }
});

test('64x64 nearest-slope Mercator sizing stays within 0.14 percent including boundaries', () => {
  const viewport = new CustomProjectionViewport({
    projection: {forward: lngLatToWorld, inverse: worldToLngLat},
    toBounds: [0, 0, 512, 512]
  });
  const data = viewport.getSizeScaleData();
  const a = Ellipsoid.WGS84.radii[0];
  const b = Ellipsoid.WGS84.radii[2];
  let maxError = 0;
  for (let i = 0; i <= 20000; i++) {
    const y = (i * 512) / 20000;
    const row = Math.min(63, Math.floor(y / 8));
    const offset = (row * 64 + 32) * 4;
    const scale = data[offset] + data[offset + 1] * -4 + data[offset + 2] * (y - (row + 0.5) * 8);
    const latitude = (worldToLngLat([256, y])[1] * Math.PI) / 180;
    const w = 1 - (1 - (b / a) ** 2) * Math.sin(latitude) ** 2;
    // Analytic area scale of spherical Mercator relative to WGS84 ground area.
    const exact = ((512 / 40075016.6855) * (a * w)) / (b * Math.cos(latitude));
    maxError = Math.max(maxError, Math.abs(scale / exact - 1));
  }
  expect(maxError).toBeLessThan(0.0014);
});

test('external scale resource is reused across camera changes and released on replacement/finalize', () => {
  const textures = new ProjectionScaleResources(device);
  const viewport = new CustomProjectionViewport(options);
  const generate = vi.spyOn(viewport, 'getSizeScaleData');
  const texture = textures.get(viewport)!;
  if (texture instanceof Buffer) {
    expect(texture.byteLength).toBe(64 * 64 * 16);
    expect(texture.usage & Buffer.STORAGE).toBeTruthy();
  } else {
    expect(texture.width).toBe(64);
  }
  const camera = new CustomProjectionViewport({
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
  const replacement = textures.get(new CustomProjectionViewport({...options, toCrs: 'changed'}))!;
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
    const viewport = new CustomProjectionViewport(options);
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

test('external scale identity tracks CRS, and bounds, but not callbacks, camera or tessellation', () => {
  const original = new CustomProjectionViewport(options);
  expect(
    new CustomProjectionViewport({...options, resolution: 1, zoom: 4}).sizeScaleSignature
  ).toBe(original.sizeScaleSignature);
  expect(
    new CustomProjectionViewport({...options, projection: {...options.projection}})
      .sizeScaleSignature
  ).toBe(original.sizeScaleSignature);
  for (const change of [
    {
      getDistanceScale: () => [2, 3] as [number, number]
    }
  ]) {
    expect(new CustomProjectionViewport({...options, ...change}).sizeScaleSignature).toBe(
      original.sizeScaleSignature
    );
  }
  for (const change of [
    {toCrs: 'changed'},
    {fromCrs: '+proj=utm +zone=10 +units=m'},
    {toBounds: [0, 0, 1024, 512] as [number, number, number, number]}
  ]) {
    expect(new CustomProjectionViewport({...options, ...change}).sizeScaleSignature).not.toBe(
      original.sizeScaleSignature
    );
  }
});
