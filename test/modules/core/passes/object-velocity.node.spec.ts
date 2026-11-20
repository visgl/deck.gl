// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {Matrix4} from '@math.gl/core';
import {WebMercatorViewport, Viewport, getShaderAssembler} from '@deck.gl/core';
import {NullDevice} from '@luma.gl/core/test-utils';
import {SimpleMeshLayer, ScenegraphLayer} from '@deck.gl/mesh-layers';
import {Model} from '@luma.gl/engine';
import {packObjectVelocity, unpackObjectVelocity} from '@deck.gl/core/shaderlib/velocity/velocity';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';
import {
  findTemporalViewportOverlap,
  getClipFromCommon,
  getLayerMotionDelta,
  getReprojectionMatrix
} from '@deck.gl/core/passes/temporal-utils';
import type {LayerTransform} from '@deck.gl/core/passes/temporal-utils';
import simpleSource from '../../../../modules/mesh-layers/src/simple-mesh-layer/simple-mesh-layer.wgsl';
import sceneSource from '../../../../modules/mesh-layers/src/scenegraph-layer/scenegraph-layer.wgsl';

test('object velocity packing reserves clear, clamps, and preserves exact zero', () => {
  expect(unpackObjectVelocity(packObjectVelocity([0, 0]))).toEqual([0, 0]);
  for (const x of [-1, -0.5, -0.137, 0, 0.0001, 0.5, 1]) {
    const packed = packObjectVelocity([x, -x]);
    expect(packed[0] * 256 + packed[1]).toBeGreaterThan(0);
    const result = unpackObjectVelocity(packed);
    expect(Math.abs(result[0] - Math.max(-0.5, Math.min(0.5, x)))).toBeLessThan(0.5 / 32767);
    expect(Math.abs(result[1] - Math.max(-0.5, Math.min(0.5, -x)))).toBeLessThan(0.5 / 32767);
  }
});

test('overlap clips to the target, permits touching edges, and retains fractional area', () => {
  const a = {id: 'a', x: 0, y: 0, width: 10, height: 10};
  const b = {...a, id: 'b', x: 10};
  expect(findTemporalViewportOverlap([a, b], 0.5, [20, 20])).toBeNull();
  expect(findTemporalViewportOverlap([a, {...b, x: 9.99}], 0.5, [20, 20])).toEqual(['a', 'b']);
  expect(
    findTemporalViewportOverlap(
      [
        {...a, x: -30},
        {...b, x: -25}
      ],
      1,
      [20, 20]
    )
  ).toBeNull();
});

test('clip from common agrees with project matrix plus center and camera reprojection', () => {
  for (const zoom of [4, 16]) {
    const viewport = new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122,
      latitude: 37,
      zoom
    });
    const previous = new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122.001,
      latitude: 37,
      zoom
    });
    for (const coordinateSystem of ['lnglat', 'meter-offsets', 'cartesian'] as const) {
      const uniforms = getUniformsFromViewport({
        viewport,
        coordinateSystem,
        coordinateOrigin: [-122, 37, 0]
      });
      const matrix = getClipFromCommon(viewport.viewProjectionMatrix, uniforms.commonOrigin);
      for (const point of [
        [0, 0, 0, 1],
        [0.01, -0.02, 0.003, 1],
        [1, 2, 3, 1]
      ]) {
        const expected = new Matrix4(uniforms.viewProjectionMatrix)
          .transform(point)
          .map((v, i) => v + uniforms.center[i]);
        const actual = new Matrix4(Array.from(matrix, Math.fround)).transform(point);
        actual.forEach((v, i) =>
          expect(Math.abs(v - expected[i])).toBeLessThan(2e-6 * Math.max(1, Math.abs(expected[i])))
        );
        const oldClip = getClipFromCommon(
          previous.viewProjectionMatrix,
          uniforms.commonOrigin
        ).transform(point);
        const reprojected = getReprojectionMatrix(
          viewport.viewProjectionMatrix,
          previous.viewProjectionMatrix
        ).transform(matrix.transform(point));
        oldClip.forEach((v, i) => expect(v).toBeCloseTo(reprojected[i], 6));
      }
    }
  }
});

test('first frame and changed coordinate system use identity; meter translation has expected motion', () => {
  const viewport = new WebMercatorViewport({
    width: 800,
    height: 600,
    longitude: -122,
    latitude: 37,
    zoom: 16
  });
  const previous: LayerTransform = {
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: [-122, 37, 0],
    modelMatrix: new Matrix4()
  };
  const current = {...previous, modelMatrix: new Matrix4().translate([10, 0, 0])};
  expect(getLayerMotionDelta(viewport, current)).toEqual(new Matrix4());
  expect(getLayerMotionDelta(viewport, current, {...previous, coordinateSystem: 'lnglat'})).toEqual(
    new Matrix4()
  );
  const uniforms = getUniformsFromViewport({viewport, ...current});
  const point = [10 * uniforms.commonUnitsPerWorldUnit[0], 0, 0, 1];
  const oldClip = getClipFromCommon(
    viewport.viewProjectionMatrix,
    uniforms.commonOrigin,
    getLayerMotionDelta(viewport, current, previous)
  ).transform(point);
  const newClip = getClipFromCommon(viewport.viewProjectionMatrix, uniforms.commonOrigin).transform(
    point
  );
  const pixels = (oldClip[0] / oldClip[3] - newClip[0] / newClip[3]) * 400;
  expect(pixels).toBeCloseTo(-10 * uniforms.commonUnitsPerWorldUnit[0] * viewport.scale, 5);
});

for (const LayerClass of [SimpleMeshLayer, ScenegraphLayer]) {
  test(`${LayerClass.layerName} column inputs keep the original WGSL`, () => {
    const device = new NullDevice({});
    Object.defineProperty(device, 'type', {value: 'webgpu'});
    Object.defineProperty(device.info, 'shadingLanguage', {value: 'wgsl'});
    const layer = new LayerClass({_motionVectors: true} as never);
    layer.context = {
      device,
      viewport: new Viewport({width: 64, height: 64}),
      defaultShaderModules: [],
      defaultShaderPlugins: [],
      shaderAssembler: getShaderAssembler('wgsl')
    } as never;
    layer.state = {columns: {}} as never;
    expect(layer.getShaders().source).toBe(
      LayerClass === SimpleMeshLayer ? simpleSource : sceneSource
    );
    device.destroy();
  });

  for (const enabled of [false, true]) {
    test(`${LayerClass.layerName} WGSL motion variant ${enabled}`, () => {
      const device = new NullDevice({});
      // Exercise WebGPU getShaders and WGSL assembly without a GPU.
      Object.defineProperty(device, 'type', {value: 'webgpu'});
      Object.defineProperty(device.info, 'shadingLanguage', {value: 'wgsl'});
      const layer = new LayerClass({_motionVectors: enabled} as never);
      layer.context = {
        device,
        viewport: new Viewport({width: 64, height: 64}),
        defaultShaderModules: [],
        defaultShaderPlugins: [],
        shaderAssembler: getShaderAssembler('wgsl')
      } as never;
      const shaders = layer.getShaders();
      if (!enabled) {
        expect(shaders.source).toBe(LayerClass === SimpleMeshLayer ? simpleSource : sceneSource);
        for (const name of [
          'velocity',
          'previousClip',
          'currentClip',
          'instancePreviousPositions',
          '@invariant'
        ]) {
          expect(shaders.source).not.toContain(name);
        }
      } else {
        expect(shaders.source).toContain('@invariant @builtin(position)');
        expect(shaders.source).toContain('instancePreviousPositions64Low');
      }
      const error = vi.spyOn(console, 'error');
      const model = new Model(device, {
        ...shaders,
        defines: {...shaders.defines, HAS_NORMALS: 1, HAS_UV: 1}
      });
      if (enabled) {
        expect(model.source).toContain('var<uniform> velocity');
        expect(model.source).toContain('previousClipFromCommon: mat4x4<f32>');
        expect(model.source).toContain('fn velocity_color');
        expect(model.shaderInputs.getModules().map(module => module.name)).toContain('velocity');
      } else {
        expect(model.source).not.toContain('var<uniform> velocity');
      }
      expect(error).not.toHaveBeenCalled();
      error.mockRestore();
      model.destroy();
      device.destroy();
    });
  }
}

test('SimpleMesh initial motion layout includes fp64 lows and stays within WebGPU limits', async () => {
  const {LayerManager, _MotionVectors: MotionVectors} = await import('@deck.gl/core');
  const {CubeGeometry} = await import('@luma.gl/engine');
  const device = new NullDevice({});
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  Object.defineProperty(device.info, 'shadingLanguage', {value: 'wgsl'});
  const manager = new LayerManager(device, {viewport: new Viewport({width: 64, height: 64})});
  const layer = new SimpleMeshLayer({
    id: 'mesh',
    mesh: new CubeGeometry(),
    data: [[0, 0, 0]],
    getPosition: d => d,
    _motionVectors: true
  });
  manager.setLayers([layer]);
  const model = layer.getModels()[0];
  const initialLayout = model.bufferLayout.find(
    layout => layout.name === 'instancePreviousPositions'
  );
  expect(initialLayout?.attributes?.map(attribute => attribute.attribute)).toEqual([
    'instancePreviousPositions',
    'instancePreviousPositions64Low'
  ]);
  const motion = new MotionVectors();
  motion.bind(model, layer.getAttributeManager()!.getAttributes().instancePositions);
  expect(model.bufferLayout.length).toBeLessThanOrEqual(8);
  expect(model.bufferLayout.flatMap(layout => layout.attributes || []).length).toBeLessThanOrEqual(
    16
  );
  expect(model.bufferLayout.some(layout => layout.name === 'instancePreviousPositions')).toBe(true);
  motion.copy();
  motion.destroy();
  manager.finalize();
  device.destroy();
});

test('position snapshots preserve layouts, reset on changes, and fall back for uncopyable buffers', async () => {
  const {Buffer} = await import('@luma.gl/core');
  const {default: MotionVectors} = await import('@deck.gl/core/lib/motion-vectors');
  const {default: Attribute} = await import('@deck.gl/core/lib/attribute/attribute');
  const device = new NullDevice({});
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  const attribute = new Attribute(device, {
    id: 'instancePositions',
    noAlloc: true,
    size: 3,
    type: 'float64',
    fp64: true
  });
  attribute.setData({constant: true, value: new Float64Array([1.1, 2.2, 3.3])});
  const source = attribute.getBuffer()!;
  const copy = vi.spyOn(device.commandEncoder, 'copyBufferToBuffer');
  const model = {
    bufferLayout: [] as any[],
    setBufferLayout(layout) {
      this.bufferLayout = layout;
    },
    setAttributes: vi.fn()
  };
  const motion = new MotionVectors();
  motion.bind(model, attribute, 1);
  expect(model.setAttributes).toHaveBeenLastCalledWith({instancePreviousPositions: source});
  expect(copy).not.toHaveBeenCalled();
  motion.copy();
  expect(copy).toHaveBeenCalledOnce();
  motion.bind(model, attribute, 1);
  const snapshot = model.setAttributes.mock.calls.at(-1)![0].instancePreviousPositions;
  expect(snapshot).not.toBe(source);
  expect(model.bufferLayout[0].byteStride).toBe(0);
  expect(model.bufferLayout[0].attributes.map(a => a.attribute)).toEqual([
    'instancePreviousPositions',
    'instancePreviousPositions64Low'
  ]);
  motion.bind(model, attribute, 2);
  expect(model.setAttributes).toHaveBeenLastCalledWith({instancePreviousPositions: source});
  expect(snapshot.destroyed).toBe(true);
  const external = device.createBuffer({byteLength: 24, usage: Buffer.VERTEX | Buffer.COPY_DST});
  attribute.setData({buffer: external});
  motion.bind(model, attribute, 2);
  expect(model.setAttributes).toHaveBeenLastCalledWith({instancePreviousPositions: external});
  const calls = copy.mock.calls.length;
  motion.copy();
  expect(copy).toHaveBeenCalledTimes(calls);
  motion.destroy();
  expect(external.destroyed).toBe(false);
  attribute.delete();
  external.destroy();
  device.destroy();
});

test('motion shader replacements require exactly one occurrence of every target', async () => {
  const {withMotionVectors} = await import(
    '../../../../modules/mesh-layers/src/utils/motion-vectors'
  );
  for (const [source, scenegraph] of [
    [simpleSource, false],
    [sceneSource, true]
  ] as const) {
    expect(() => withMotionVectors(source, scenegraph)).not.toThrow();
    const targets = [
      '  @location(0) positions:',
      '  @builtin(position) position:',
      `  return ${scenegraph ? 'outputs' : 'varyings'};`,
      '  if (picking.isActive > 0.5)',
      ...(scenegraph ? ['  if (scenegraph.composeModelMatrix', '    var sizeAdjustedPos ='] : [])
    ];
    for (const target of targets) {
      expect(() => withMotionVectors(source.replace(target, ''), scenegraph)).toThrow(
        'Motion vector shader target must occur exactly once'
      );
      expect(() => withMotionVectors(source + target, scenegraph)).toThrow(
        'Motion vector shader target must occur exactly once'
      );
    }
  }
});

test('Float32 layer deltas bound Mercator projection error at zoom 12 and 18', async () => {
  const {addMetersToLngLat} = await import('@math.gl/web-mercator');
  for (const zoom of [12, 18]) {
    const viewport = new WebMercatorViewport({
      width: 800,
      height: 600,
      longitude: -122,
      latitude: 37,
      zoom,
      pitch: 45
    });
    const anchor: [number, number, number] = [-122, 37, 0];
    const scale = viewport.getDistanceScales(anchor).unitsPerMeter;
    for (const coordinateSystem of ['meter-offsets', 'cartesian'] as const) {
      const meters = coordinateSystem === 'meter-offsets';
      const current: LayerTransform = {
        coordinateSystem,
        coordinateOrigin: meters ? anchor : viewport.projectPosition(anchor),
        modelMatrix: new Matrix4()
      };
      const point = meters ? [100, 100, 20] : [100 * scale[0], 100 * scale[1], 20];
      const geographic = (transform: LayerTransform) => {
        const moved = transform.modelMatrix.transformAsPoint(point);
        if (meters) return addMetersToLngLat(transform.coordinateOrigin, moved);
        const absolute = moved.map((value, i) => value + transform.coordinateOrigin[i]);
        return [...viewport.unprojectFlat(absolute), absolute[2]];
      };
      const uniforms = getUniformsFromViewport({viewport, ...current});
      const common = viewport.projectPosition(geographic(current));
      const relative = [...common.map((value, i) => value - uniforms.commonOrigin[i]), 1];
      const shiftedOrigin = [...current.coordinateOrigin] as [number, number, number];
      shiftedOrigin[1] += meters ? 0.0001 : 10 * scale[1];
      shiftedOrigin[2] += 5;
      const cases = [
        [
          'north',
          {...current, modelMatrix: new Matrix4().translate([0, meters ? 10 : 10 * scale[1], 0])},
          0.05
        ],
        ['vertical', {...current, modelMatrix: new Matrix4().translate([0, 0, 10])}, 0.05],
        ['origin', {...current, coordinateOrigin: shiftedOrigin}, 0.001],
        ['rotation', {...current, modelMatrix: new Matrix4().rotateZ(Math.PI / 6)}, 0.005]
      ] as const;
      for (const [name, previous, bound] of cases) {
        const floatMatrix = new Float32Array(
          getClipFromCommon(
            viewport.viewProjectionMatrix,
            uniforms.commonOrigin,
            getLayerMotionDelta(viewport, current, previous)
          )
        );
        const clip = new Matrix4(Array.from(floatMatrix)).transform(relative);
        const actual = [(clip[0] / clip[3] + 1) * 400, (1 - clip[1] / clip[3]) * 300];
        const expected = viewport.project(geographic(previous));
        const error = Math.hypot(actual[0] - expected[0], actual[1] - expected[1]);
        expect(error, `${coordinateSystem} ${name} zoom ${zoom}`).toBeLessThan(bound);
      }
    }
  }
  // Maximum measured errors across both systems at zoom 12 / 18, in pixels:
  // north 0.000008 / 0.000419; vertical 0.000006 / 0.000418;
  // origin 0.000005 / 0.000293; rotation 0.000037 / 0.001251.
});

test('object pass releases absent owners and copies only after every viewport draw', async () => {
  const {LayerManager, _MotionVectors: MotionVectors} = await import('@deck.gl/core');
  const {CubeGeometry} = await import('@luma.gl/engine');
  const {default: ObjectVelocityPass} = await import('@deck.gl/core/passes/object-velocity-pass');
  const {default: LayersPass} = await import('@deck.gl/core/passes/layers-pass');
  const device = new NullDevice({});
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  Object.defineProperty(device.info, 'shadingLanguage', {value: 'wgsl'});
  const createFramebuffer = device.createFramebuffer.bind(device);
  vi.spyOn(device, 'createFramebuffer').mockImplementation(props => {
    const buffer = createFramebuffer(props);
    (buffer as any).autoCreateAttachmentTextures();
    return buffer;
  });
  const viewport = new Viewport({id: 'a', width: 64, height: 64});
  const manager = new LayerManager(device, {viewport});
  const layer = new SimpleMeshLayer({
    id: 'mesh',
    mesh: new CubeGeometry(),
    data: [[0, 0, 0]],
    getPosition: d => d,
    _motionVectors: true
  });
  manager.setLayers([layer]);
  const motion = new MotionVectors();
  layer.state.motionVectors = motion;
  const pass = new ObjectVelocityPass(device);
  const copy = vi.spyOn(motion, 'copy');
  const draw = vi.fn();
  // Isolate rasterization while exercising the pass's real per-view history and copy sequencing.
  const render = vi.spyOn(LayersPass.prototype as any, '_render').mockImplementation(function (
    this: any
  ) {
    this.getShaderModuleProps(layer);
    draw();
    return [];
  });
  const depth = device.createTexture({width: 64, height: 64, format: 'depth24plus'});
  const options = {
    pass: 'screen',
    layers: [layer],
    views: {},
    viewports: [viewport, new Viewport({id: 'b', width: 64, height: 64})],
    onViewportActive() {},
    temporal: {targetId: 'a', depthTexture: depth, renderSize: [64, 64], reset: false}
  } as any;
  pass.renderVelocity(options);
  expect(draw).toHaveBeenCalledTimes(2);
  expect(copy).toHaveBeenCalledOnce();
  for (const order of draw.mock.invocationCallOrder) {
    expect(order).toBeLessThan(copy.mock.invocationCallOrder[0]);
  }
  expect(motion.targetId).toBe('a');
  pass.renderVelocity({...options, layers: []});
  expect(motion.targetId).toBeNull();
  const other = new ObjectVelocityPass(device);
  other.renderVelocity({...options, temporal: {...options.temporal, targetId: 'other'}});
  expect(motion.targetId).toBe('other');
  const {default: DeckRenderer} = await import('@deck.gl/core/lib/deck-renderer');
  const renderer = new DeckRenderer(device);
  for (const temporal of [{objectVelocity: false}, {velocity: false}, null]) {
    renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {}});
    other.renderVelocity({...options, temporal: {...options.temporal, targetId: 'other'}});
    expect(motion.targetId).toBe('other');
    (renderer as any).targetStates.set(device, {objectVelocityPass: other, buffers: []});
    renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: temporal});
    expect(motion.targetId).toBeNull();
  }
  renderer.finalize();
  // A spread of `layer.props` drops the default props, so each case states all gate inputs.
  const gate = {
    ...layer.props,
    _motionVectors: true,
    opacity: 1,
    extensions: [],
    operation: 'draw'
  };
  expect(other.shouldDrawLayer({props: gate, state: layer.state} as any)).toBe(true);
  expect(other.shouldDrawLayer({props: {...gate, opacity: 0.5}, state: layer.state} as any)).toBe(
    false
  );
  expect(
    other.shouldDrawLayer({props: {...gate, extensions: [{}]}, state: layer.state} as any)
  ).toBe(false);
  expect(
    other.shouldDrawLayer({props: {...gate, _motionVectors: false}, state: layer.state} as any)
  ).toBe(false);
  render.mockRestore();
  pass.delete();
  other.delete();
  depth.destroy();
  manager.finalize();
  device.destroy();
});

test('Scenegraph initial model layout includes previous positions and fp64 lows', async () => {
  const {LayerManager} = await import('@deck.gl/core');
  const device = new NullDevice({});
  Object.defineProperty(device, 'type', {value: 'webgpu'});
  Object.defineProperty(device.info, 'shadingLanguage', {value: 'wgsl'});
  const manager = new LayerManager(device, {viewport: new Viewport({width: 64, height: 64})});
  const layer = new ScenegraphLayer({_motionVectors: true, data: [[0, 0, 0]], getPosition: d => d});
  manager.setLayers([layer]);
  const options = (layer as any)._getModelOptions().modelOptions;
  expect(
    options.bufferLayout
      .find(layout => layout.name === 'instancePreviousPositions')
      .attributes.map(attribute => attribute.attribute)
  ).toEqual(['instancePreviousPositions', 'instancePreviousPositions64Low']);
  const warn = vi.spyOn(console, 'warn');
  const error = vi.spyOn(console, 'error');
  const model = new Model(device, options);
  expect(warn).not.toHaveBeenCalled();
  expect(error).not.toHaveBeenCalled();
  warn.mockRestore();
  error.mockRestore();
  model.destroy();
  manager.finalize();
  device.destroy();
});
