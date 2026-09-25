// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Layer, LayerManager, Viewport, CompositeLayer} from '@deck.gl/core';
import {_CustomProjectionViewport as CustomProjectionViewport} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {getEmptyPickingInfo} from '@deck.gl/core/lib/picking/pick-info';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';
import {PROJECTION_MODE} from '@deck.gl/core/lib/constants';
import {worldToPixels} from '@math.gl/web-mercator';

class ProjectionViewport extends Viewport {
  constructor(
    readonly signature: string,
    projected = true,
    zoom = 0
  ) {
    super({width: 400, height: 300, position: [10, 20, 0], zoom});
    this.distanceScales = {...this.distanceScales, unitsPerWorldUnit: [1, 1, 1]};
    if (projected) {
      this.preproject = ([x, y, z = 0]) => [x * 2, y * 3, z * 4];
      this.postUnproject = ([x, y, z]) => [x / 2, y / 3, z / 4];
    }
  }

  get projectionSignature() {
    return this.signature;
  }
  get projectionMode() {
    return this.preproject ? PROJECTION_MODE.EXTERNAL : PROJECTION_MODE.IDENTITY;
  }
  projectPosition(position: number[]): [number, number, number] {
    return this.preproject ? this.preproject(position) : super.projectPosition(position);
  }
  unprojectPosition(position: number[]): [number, number, number] {
    return this.postUnproject
      ? this.postUnproject(position) || [NaN, NaN, NaN]
      : super.unprojectPosition(position);
  }
}

class PositionLayer extends Layer<{getPosition?: (point: number[]) => number[]}> {
  static layerName = 'PositionLayer';
  static defaultProps = {getPosition: {type: 'accessor', value: point => point}};

  initializeState() {
    this.getAttributeManager()!.addInstanced({
      positions: {
        size: 3,
        type: 'float64',
        fp64: this.use64bitPositions(),
        accessor: 'getPosition',
        ...this.usePositionTransforms()
      },
      ordinaryPositions: {size: 3, accessor: 'getPosition'}
    });
  }
}

function createManager(viewport: Viewport) {
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  return manager;
}

function getPositions(layer: PositionLayer) {
  return Array.from(layer.getAttributeManager()!.attributes.positions.value!.slice(0, 3));
}

test('Layer transforms accessor-keyed binary positions but bypasses direct attribute buffers', () => {
  const viewport = new ProjectionViewport('initial');
  const manager = createManager(viewport);
  const transform = vi.spyOn(viewport, 'preproject');
  const world = new Float32Array([2, 3, 4]);
  const prepared = new Float32Array([4, 9, 16]);
  const buffer = device.createBuffer({data: prepared});
  const accessor = new PositionLayer({
    id: 'accessor',
    data: {length: 1, attributes: {getPosition: {value: world, size: 3}}}
  });
  const direct = new PositionLayer({
    id: 'direct',
    data: {length: 1, attributes: {positions: prepared}}
  });
  const gpu = new PositionLayer({id: 'gpu', data: {length: 1, attributes: {positions: buffer}}});
  try {
    manager.setLayers([accessor, direct, gpu]);
    expect(transform).toHaveBeenCalledTimes(1);
    expect(getPositions(accessor)).toEqual([4, 9, 16]);
    expect(getPositions(direct)).toEqual([4, 9, 16]);
    expect(gpu.getAttributeManager()!.attributes.positions.getBuffer()).toBe(buffer);
    const changed = new ProjectionViewport('changed');
    changed.preproject = vi.fn(([x, y, z]) => [x + 10, y + 20, z]);
    manager.activateViewport(changed);
    for (const layer of [accessor, direct, gpu]) layer.activateViewport(changed);
    expect(changed.preproject).toHaveBeenCalledTimes(1);
    expect(getPositions(accessor)).toEqual([12, 23, 4]);
    expect(getPositions(direct)).toEqual([4, 9, 16]);
    expect(gpu.getAttributeManager()!.attributes.positions.getBuffer()).toBe(buffer);
    expect(Array.from(world)).toEqual([2, 3, 4]);
  } finally {
    manager.finalize();
    buffer.destroy();
    transform.mockRestore();
  }
});

test('Projection-dependent generated attributes do not acquire position transforms', () => {
  class GeneratedPositionLayer extends PositionLayer {
    static layerName = 'GeneratedPositionLayer';

    initializeState() {
      super.initializeState();
      this.getAttributeManager()!.add({
        generatedPositions: {
          size: 3,
          accessor: 'getPosition',
          transformSource: 'projection'
        }
      });
    }
  }
  const manager = createManager(new ProjectionViewport('initial'));
  let layer = new GeneratedPositionLayer({data: [[2, 3, 4]]});
  try {
    manager.setLayers([layer]);
    const attribute = layer.getAttributeManager()!.attributes.generatedPositions;
    expect('transform' in attribute.settings).toBe(false);
    layer = layer.clone({coordinateSystem: 'cartesian'});
    manager.setLayers([layer]);
    expect('transform' in attribute.settings).toBe(false);
    expect(Array.from(attribute.value!.slice(0, 3))).toEqual([2, 3, 4]);
  } finally {
    manager.finalize();
  }
});

test('Layer refreshes custom projection attributes only when CRS metadata changes', () => {
  const normalizationScale = 512 / 40075016.6855;
  const projection = {forward: p => p.slice(), inverse: p => p.slice()};
  const initial = new CustomProjectionViewport({projection});
  const manager = createManager(initial);
  const accessor = vi.fn(point => point);
  const layer = new PositionLayer({data: [[2, 3, 4]], getPosition: accessor});
  try {
    manager.setLayers([layer]);
    layer.activateViewport(initial);
    accessor.mockClear();
    const changedProjection = {
      forward: ([x, y, z]) => [x * 2, y, z],
      inverse: ([x, y, z]) => [x / 2, y, z]
    };
    for (const crs of [
      {},
      {fromCrs: 'EPSG:4326', toCrs: 'first'},
      {fromCrs: 'WGS84', toCrs: 'first'},
      {fromCrs: 'WGS84', toCrs: 'second'}
    ]) {
      const viewport = new CustomProjectionViewport({
        ...crs,
        projection: changedProjection
      });
      manager.activateViewport(viewport);
      layer.activateViewport(viewport);
      if ('fromCrs' in crs) {
        expect(accessor).toHaveBeenCalledTimes(1);
        expect(getPositions(layer)).toEqual([
          256 + 4 * normalizationScale,
          256 + 3 * normalizationScale,
          4
        ]);
      } else {
        expect(accessor).not.toHaveBeenCalled();
        expect(getPositions(layer)).toEqual([
          256 + 2 * normalizationScale,
          256 + 3 * normalizationScale,
          4
        ]);
      }
      accessor.mockClear();
      const replacement = new CustomProjectionViewport({
        ...crs,
        projection: {...changedProjection}
      });
      manager.activateViewport(replacement);
      layer.activateViewport(replacement);
      expect(accessor).not.toHaveBeenCalled();
    }
  } finally {
    manager.finalize();
  }
});

for (const projected of [false, true]) {
  test(`Layer initializes position attributes with preproject=${projected}`, () => {
    const viewport = new ProjectionViewport('initial', projected);
    const manager = createManager(viewport);
    const point = [2, 3];
    const layer = new PositionLayer({data: [point], coordinateSystem: 'meter-offsets'});
    try {
      manager.setLayers([layer]);
      const attribute = layer.getAttributeManager()!.attributes.positions;
      expect(attribute.settings.transformSource).toBe('projection');
      if (projected) expect(attribute.settings.transform).toBeTypeOf('function');
      else expect(attribute.settings.transform).toBeNull();
      expect(layer.use64bitPositions()).toBe(projected);
      expect(getPositions(layer)).toEqual(projected ? [4, 9, 0] : [2, 3, 0]);
      expect(point).toEqual([2, 3]);
    } finally {
      manager.finalize();
    }
  });

  test(`Layer projection signature and camera updates with preproject=${projected}`, () => {
    const viewport = new ProjectionViewport('initial', projected);
    const manager = createManager(viewport);
    const accessor = vi.fn(point => point);
    const layer = new PositionLayer({data: [[2, 3, 4]], getPosition: accessor});
    try {
      manager.setLayers([layer]);
      manager.activateViewport(viewport);
      layer.activateViewport(viewport);
      const update = vi.spyOn(layer, 'updateState');
      accessor.mockClear();

      const camera = new ProjectionViewport('initial', projected, 1);
      manager.activateViewport(camera);
      layer.activateViewport(camera);
      expect(update).not.toHaveBeenCalled();
      expect(accessor).not.toHaveBeenCalled();

      const changed = new ProjectionViewport('changed', projected, 1);
      expect(changed.equals(camera)).toBe(false);
      if (projected) changed.preproject = ([x, y, z]) => [x + 100, y, z];
      manager.activateViewport(changed);
      layer.activateViewport(changed);
      expect(update).toHaveBeenCalledTimes(1);
      expect(accessor).toHaveBeenCalledTimes(1);
      expect(getPositions(layer)).toEqual(projected ? [102, 3, 4] : [2, 3, 4]);
      expect(update.mock.calls[0][0].changeFlags.projectionChanged).toBe(true);
      expect(
        Array.from(layer.getAttributeManager()!.attributes.ordinaryPositions.value!.slice(0, 3))
      ).toEqual([2, 3, 4]);
      expect(layer.internalState!.changeFlags.projectionChanged).toBe(false);
      layer.activateViewport(changed);
      expect(update).toHaveBeenCalledTimes(1);
    } finally {
      manager.finalize();
      vi.restoreAllMocks();
    }
  });

  test(`Layer clones apply model matrices to position transforms with preproject=${projected}`, () => {
    const manager = createManager(new ProjectionViewport('initial', projected));
    const point = [2, 3, 4];
    const accessor = vi.fn(position => position);
    let layer = new PositionLayer({data: [point], getPosition: accessor});
    try {
      manager.setLayers([layer]);
      accessor.mockClear();
      const attribute = layer.getAttributeManager()!.attributes.positions;
      layer = layer.clone({modelMatrix: new Matrix4().translate([10, 20, 30])});
      manager.setLayers([layer]);
      expect(layer.getAttributeManager()!.attributes.positions).toBe(attribute);
      expect(getPositions(layer)).toEqual(projected ? [24, 69, 136] : point);
      expect(accessor).toHaveBeenCalledTimes(projected ? 1 : 0);
      expect(point).toEqual([2, 3, 4]);
    } finally {
      manager.finalize();
    }
  });

  test(`Layer coordinate helpers with preproject=${projected}`, () => {
    const viewport = new ProjectionViewport('initial', projected);
    const manager = createManager(viewport);
    const layer = new PositionLayer({
      coordinateSystem: 'default',
      coordinateOrigin: [100, 200, 300],
      modelMatrix: new Matrix4().translate([10, 20, 30])
    });
    try {
      manager.setLayers([layer]);
      const point = [2, 3, 4];
      const common = projected ? [24, 69, 136] : [12, 23, 34];
      expect(layer.projectPosition(point, {autoOffset: false})).toEqual(common);
      expect(layer.projectPosition(point)).toEqual([common[0] - 10, common[1] - 20, common[2]]);
      const pixel = layer.project(point);
      worldToPixels(common, viewport.pixelProjectionMatrix)
        .slice(0, 3)
        .forEach((value, index) => expect(pixel[index]).toBeCloseTo(value));
      // unproject returns world coordinates, without reversing the layer model matrix.
      const inverse = projected ? vi.spyOn(viewport, 'postUnproject') : null;
      layer
        .unproject(pixel)
        .forEach((value, index) => expect(value).toBeCloseTo([12, 23, 34][index]));
      if (inverse) expect(inverse).toHaveBeenCalledTimes(1);
      expect(point).toEqual([2, 3, 4]);

      const common2D = projected ? [24, 69, 120] : [12, 23, 30];
      const pixel2D = layer.project([2, 3]);
      expect(pixel2D).toHaveLength(2);
      worldToPixels(common2D, viewport.pixelProjectionMatrix)
        .slice(0, 2)
        .forEach((value, index) => {
          expect(pixel2D[index]).toBeCloseTo(value);
        });

      const override = new ProjectionViewport('override', !projected);
      expect(layer.projectPosition(point, {viewport: override, autoOffset: false})).toEqual(
        projected ? [12, 23, 34] : [24, 69, 136]
      );
    } finally {
      manager.finalize();
      vi.restoreAllMocks();
    }
  });

  test(`Layer coordinate helpers use the activated viewport with preproject=${projected}`, () => {
    const manager = createManager(new ProjectionViewport('context', projected));
    const layer = new PositionLayer({coordinateSystem: 'default'});
    try {
      manager.setLayers([layer]);
      const active = new ProjectionViewport('active', projected, 1);
      layer.activateViewport(active);
      const common = projected ? [4, 9, 16] : [2, 3, 4];
      expect(layer.projectPosition([2, 3, 4], {autoOffset: false})).toEqual(common);
      const pixel = layer.project([2, 3, 4]);
      worldToPixels(common, active.pixelProjectionMatrix)
        .slice(0, 3)
        .forEach((value, index) => expect(pixel[index]).toBeCloseTo(value));
      layer.unproject(pixel).forEach((value, index) => expect(value).toBeCloseTo([2, 3, 4][index]));
    } finally {
      manager.finalize();
    }
  });

  test(`Picking inverse and shader uniforms with preproject=${projected}`, () => {
    const viewport = new ProjectionViewport('initial', projected);
    const input = [2, 3, 4];
    const [x, y, z] = viewport.project(input);
    const pick = () => getEmptyPickingInfo({viewports: [viewport], pixelRatio: 1, x, y, z});
    pick().coordinate!.forEach((value, index) => expect(value).toBeCloseTo(input[index]));
    if (projected) {
      viewport.postUnproject = () => null;
      expect(pick().coordinate).toBeUndefined();
    }
    const modelMatrix = new Matrix4().translate([10, 20, 30]);
    const uniforms = getUniformsFromViewport({viewport, modelMatrix, autoWrapLongitude: true});
    expect(Array.from(uniforms.modelMatrix)).toEqual(
      Array.from(projected ? new Matrix4() : modelMatrix)
    );
    expect(uniforms.wrapLongitude).toBe(!projected);
    if (projected) expect(uniforms.commonUnitsPerWorldUnit).toEqual([1, 1, 1]);
  });
}

test('Layer projectionChanged independently requests an update and is cleared afterwards', () => {
  const manager = createManager(new ProjectionViewport('initial'));
  const layer = new PositionLayer();
  try {
    manager.setLayers([layer]);
    const shouldUpdate = vi.spyOn(layer, 'shouldUpdateState').mockReturnValue(false);
    layer.setChangeFlags({projectionChanged: true});
    expect(layer.internalState!.changeFlags.somethingChanged).toBe(true);
    expect(layer.needsUpdate()).toBe(true);
    expect(shouldUpdate).not.toHaveBeenCalled();
    layer._update();
    expect(layer.internalState!.changeFlags.projectionChanged).toBe(false);
    expect(layer.needsUpdate()).toBe(false);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});

test('Composite layers defer projection updates without an attribute manager', () => {
  class EmptyCompositeLayer extends CompositeLayer {
    static layerName = 'EmptyCompositeLayer';
    renderLayers() {
      return [];
    }
  }
  const viewport = new ProjectionViewport('initial');
  const manager = createManager(viewport);
  const layer = new EmptyCompositeLayer();
  try {
    manager.setLayers([layer]);
    layer.activateViewport(viewport);
    manager.updateLayers();
    const update = vi.spyOn(layer, 'updateState');
    const changed = new ProjectionViewport('changed');
    manager.activateViewport(changed);
    layer.activateViewport(changed);
    expect(layer.getAttributeManager()).toBeNull();
    expect(layer.internalState!.changeFlags.projectionChanged).toBe(true);
    expect(update).not.toHaveBeenCalled();
    manager.updateLayers();
    expect(update).toHaveBeenCalledTimes(1);
    expect(layer.internalState!.changeFlags.projectionChanged).toBe(false);
  } finally {
    manager.finalize();
    vi.restoreAllMocks();
  }
});
