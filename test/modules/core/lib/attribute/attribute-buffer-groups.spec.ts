// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import AttributeManager from '@deck.gl/core/lib/attribute/attribute-manager';
import {Layer} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {beforeAll, test, expect, vi} from 'vitest';
import {device} from '@deck.gl/test-utils/vitest';

import type {Device} from '@luma.gl/core';
import type Attribute from '@deck.gl/core/lib/attribute/attribute';

let webgpuDevice: Device;

beforeAll(async () => {
  const testDevice = await getWebGPUTestDevice();
  if (!testDevice) {
    return;
  }
  webgpuDevice = testDevice;
});

function addSimpleGroup(attributeManager: AttributeManager) {
  attributeManager.addInstanced({
    a: {size: 1, accessor: 'getA', bufferGroup: 'group-a'},
    b: {size: 1, accessor: 'getB', bufferGroup: 'group-a'}
  });
}

function updateSimpleGroup(
  attributeManager: AttributeManager,
  data: Array<{a: number; b: number}>,
  buffers = {}
) {
  attributeManager.update({
    numInstances: data.length,
    data,
    props: {
      getA: (object: {a: number}) => object.a,
      getB: (object: {b: number}) => object.b
    },
    transitions: {},
    buffers,
    context: {}
  });
}

test('AttributeManager buffer groups are ignored on WebGL', () => {
  const attributeManager = new AttributeManager(device);
  addSimpleGroup(attributeManager);
  updateSimpleGroup(attributeManager, [
    {a: 1, b: 2},
    {a: 3, b: 4}
  ]);

  expect(attributeManager.hasBufferGroups()).toBe(false);
  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['a', 'b']
  );

  attributeManager.finalize();
});

test('AttributeManager without groups keeps WebGPU layouts unchanged', () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  attributeManager.addInstanced({
    a: {size: 1, accessor: 'getA'},
    b: {size: 1, accessor: 'getB'}
  });
  updateSimpleGroup(attributeManager, [
    {a: 1, b: 2},
    {a: 3, b: 4}
  ]);

  expect(attributeManager.hasBufferGroups()).toBe(false);
  expect(attributeManager.getBufferLayouts({isInstanced: true}).map(layout => layout.name)).toEqual(
    ['a', 'b']
  );

  attributeManager.finalize();
});

test('AttributeManager buffer groups pack IconLayer-style shader attributes', async () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  attributeManager.addInstanced({
    a: {size: 1, accessor: 'getA', bufferGroup: 'group-a'},
    iconDefs: {
      size: 7,
      accessor: 'getIcon',
      bufferGroup: 'group-a',
      shaderAttributes: {
        offsets: {size: 2, elementOffset: 0},
        frames: {size: 4, elementOffset: 2},
        modes: {size: 1, elementOffset: 6}
      }
    },
    colors: {
      size: 4,
      type: 'unorm8',
      accessor: 'getColor',
      bufferGroup: 'group-a'
    }
  });

  attributeManager.update({
    numInstances: 2,
    data: [
      {a: 1, icon: 10, color: [1, 2, 3, 4]},
      {a: 2, icon: 20, color: [5, 6, 7, 8]}
    ],
    props: {
      getA: (object: {a: number}) => object.a,
      getIcon: (object: {icon: number}) => [
        object.icon,
        object.icon + 1,
        object.icon + 2,
        object.icon + 3,
        object.icon + 4,
        object.icon + 5,
        object.icon + 6
      ],
      getColor: (object: {color: number[]}) => object.color
    },
    transitions: {},
    buffers: {},
    context: {}
  });

  const layouts = attributeManager.getBufferLayouts({isInstanced: true});
  expect(layouts.map(layout => layout.name)).toEqual(['group-a']);
  expect(layouts[0].byteStride).toBe(36);
  expect(
    Object.fromEntries(
      (layouts[0].attributes || []).map(attribute => [attribute.attribute, attribute.byteOffset])
    )
  ).toEqual({
    a: 0,
    offsets: 4,
    frames: 12,
    modes: 28,
    colors: 32
  });

  const attributes = attributeManager.getAttributes();
  expect(attributes.a.getBuffer(), 'standalone buffers remain allocated').toBeTruthy();

  let bindings = attributeManager.getBufferGroupBindings(attributes, {isInstanced: true});
  const packedBuffer = bindings.buffers['group-a'];
  const destroySpy = vi.spyOn(packedBuffer, 'destroy');
  let packedBytes = await packedBuffer.readAsync(0, 72);
  let dataView = new DataView(packedBytes.buffer, packedBytes.byteOffset, packedBytes.byteLength);

  expect(dataView.getFloat32(0, true)).toBe(1);
  expect(dataView.getFloat32(4, true)).toBe(10);
  expect(Array.from(packedBytes.slice(32, 36))).toEqual([1, 2, 3, 4]);
  expect(dataView.getFloat32(36, true)).toBe(2);
  expect(dataView.getFloat32(40, true)).toBe(20);
  expect(Array.from(packedBytes.slice(68, 72))).toEqual([5, 6, 7, 8]);

  attributeManager.invalidate('getA');
  attributeManager.update({
    numInstances: 2,
    data: [
      {a: 3, icon: 10, color: [1, 2, 3, 4]},
      {a: 4, icon: 20, color: [5, 6, 7, 8]}
    ],
    props: {
      getA: (object: {a: number}) => object.a,
      getIcon: (object: {icon: number}) => [
        object.icon,
        object.icon + 1,
        object.icon + 2,
        object.icon + 3,
        object.icon + 4,
        object.icon + 5,
        object.icon + 6
      ],
      getColor: (object: {color: number[]}) => object.color
    },
    transitions: {},
    buffers: {},
    context: {}
  });

  bindings = attributeManager.getBufferGroupBindings(
    attributeManager.getChangedAttributes({clearChangedFlags: true}),
    {isInstanced: true}
  );
  expect(bindings.buffers['group-a']).toBe(packedBuffer);
  expect(destroySpy, 'repacking keeps the Deck-owned target buffer alive').not.toHaveBeenCalled();
  packedBytes = await packedBuffer.readAsync(0, 72);
  dataView = new DataView(packedBytes.buffer, packedBytes.byteOffset, packedBytes.byteLength);
  expect(dataView.getFloat32(0, true)).toBe(3);
  expect(dataView.getFloat32(4, true), 'untouched column is repacked').toBe(10);

  attributeManager.finalize();
  expect(destroySpy, 'finalize destroys the Deck-owned target buffer').toHaveBeenCalledOnce();
});

test('AttributeManager buffer groups broadcast constant inputs', async () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  attributeManager.addInstanced({
    varying: {size: 1, accessor: 'getVarying', bufferGroup: 'group-a'},
    constant: {size: 1, accessor: 'getConstant', bufferGroup: 'group-a'},
    color: {
      size: 4,
      type: 'unorm8',
      accessor: 'getColor',
      bufferGroup: 'group-a'
    }
  });
  attributeManager.update({
    numInstances: 2,
    data: [{varying: 1}, {varying: 2}],
    props: {
      getVarying: (object: {varying: number}) => object.varying,
      getConstant: 9,
      getColor: [255, 128, 0, 255]
    },
    transitions: {},
    buffers: {},
    context: {}
  });

  const attributes = attributeManager.getAttributes();
  expect(attributes.constant.isConstant).toBeTruthy();
  expect(attributes.color.isConstant).toBeTruthy();
  expect(attributes.constant.getBuffer()?.byteLength).toBe(4);
  expect(attributes.color.getBuffer()?.byteLength).toBe(4);

  const bindings = attributeManager.getBufferGroupBindings(attributes, {isInstanced: true});
  expect(bindings.bufferLayouts.map(layout => layout.name)).toEqual(['group-a']);
  expect(bindings.bufferLayouts[0].byteStride).toBe(12);

  const packedBytes = await bindings.buffers['group-a'].readAsync(0, 24);
  const dataView = new DataView(packedBytes.buffer, packedBytes.byteOffset, packedBytes.byteLength);
  expect(dataView.getFloat32(0, true)).toBe(1);
  expect(dataView.getFloat32(4, true)).toBe(9);
  expect(Array.from(packedBytes.slice(8, 12))).toEqual([255, 128, 0, 255]);
  expect(dataView.getFloat32(12, true)).toBe(2);
  expect(dataView.getFloat32(16, true)).toBe(9);
  expect(Array.from(packedBytes.slice(20, 24))).toEqual([255, 128, 0, 255]);

  attributeManager.finalize();
});

test('AttributeManager all-constant buffer groups use one row with zero stride', async () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  addSimpleGroup(attributeManager);
  attributeManager.update({
    numInstances: 2,
    data: [{}, {}],
    props: {getA: 3, getB: 4},
    transitions: {},
    buffers: {},
    context: {}
  });

  const bindings = attributeManager.getBufferGroupBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(bindings.bufferLayouts[0].byteStride).toBe(0);
  const packedBytes = await bindings.buffers['group-a'].readAsync(0, 8);
  expect(Array.from(new Float32Array(packedBytes.buffer, packedBytes.byteOffset, 2))).toEqual([
    3, 4
  ]);

  attributeManager.finalize();
});

test('AttributeManager buffer groups are shared across model step modes', () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  attributeManager.add({
    a: {size: 1, stepMode: 'dynamic', accessor: 'getA', bufferGroup: 'group-a'},
    b: {size: 1, stepMode: 'dynamic', accessor: 'getB', bufferGroup: 'group-a'}
  });
  updateSimpleGroup(attributeManager, [
    {a: 1, b: 2},
    {a: 3, b: 4}
  ]);

  const attributes = attributeManager.getAttributes();
  const instancedBindings = attributeManager.getBufferGroupBindings(attributes, {
    isInstanced: true
  });
  const packedBuffer = instancedBindings.buffers['group-a'];
  const destroySpy = vi.spyOn(packedBuffer, 'destroy');

  const vertexBindings = attributeManager.getBufferGroupBindings(attributes, {
    isInstanced: false
  });

  expect(instancedBindings.bufferLayouts[0].stepMode).toBe('instance');
  expect(vertexBindings.bufferLayouts[0].stepMode).toBe('vertex');
  expect(vertexBindings.buffers['group-a']).toBe(packedBuffer);
  expect(destroySpy).not.toHaveBeenCalled();

  attributeManager.finalize();
  expect(destroySpy).toHaveBeenCalledOnce();
});

test('AttributeManager buffer groups fall back for transitions and external buffers', () => {
  if (!webgpuDevice) return;

  const testDevice = webgpuDevice;
  const attributeManager = new AttributeManager(testDevice);
  addSimpleGroup(attributeManager);
  updateSimpleGroup(attributeManager, [
    {a: 1, b: 2},
    {a: 3, b: 4}
  ]);

  const transitionManager = (attributeManager as any).attributeTransitionManager;
  const transitionSpy = vi
    .spyOn(transitionManager, 'hasAttribute')
    .mockImplementation((attributeName: string) => attributeName === 'a');
  (attributeManager.getAttributes().a as Attribute).value = new Float32Array([999, 999]);

  let bindings = attributeManager.getBufferGroupBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(bindings.buffers['group-a'], 'active transitions are not packed').toBeUndefined();
  expect(bindings.groupedAttributeIds.size).toBe(0);
  expect(bindings.bufferLayouts.map(layout => layout.name)).toEqual(['a', 'b']);
  transitionSpy.mockRestore();

  const externalBuffer = testDevice.createBuffer({byteLength: 16});
  updateSimpleGroup(
    attributeManager,
    [
      {a: 5, b: 6},
      {a: 7, b: 8}
    ],
    {a: externalBuffer}
  );
  bindings = attributeManager.getBufferGroupBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(bindings.buffers['group-a'], 'GPU-only values are not packed').toBeUndefined();
  expect(bindings.groupedAttributeIds.size).toBe(0);
  expect(bindings.bufferLayouts.map(layout => layout.name)).toEqual(['a', 'b']);

  updateSimpleGroup(
    attributeManager,
    [
      {a: 5, b: 6},
      {a: 7, b: 8}
    ],
    {a: {value: new Float32Array([0, 5, 0, 7]), offset: 4, stride: 8}}
  );
  bindings = attributeManager.getBufferGroupBindings(attributeManager.getAttributes(), {
    isInstanced: true
  });
  expect(bindings.buffers['group-a'], 'custom binary views are not packed').toBeUndefined();
  expect(bindings.groupedAttributeIds.size).toBe(0);
  expect(bindings.bufferLayouts.map(layout => layout.name)).toEqual(['a', 'b']);

  externalBuffer.delete();
  attributeManager.finalize();
});

test('Layer grouped bindings preserve legacy fallback and index binding', () => {
  if (!webgpuDevice) return;

  const attributeManager = new AttributeManager(webgpuDevice);
  attributeManager.add({
    indices: {size: 1, isIndexed: true, accessor: 'getIndex'},
    constant: {size: 1, accessor: 'getConstant'}
  });
  addSimpleGroup(attributeManager);
  attributeManager.update({
    numInstances: 2,
    data: [
      {index: 0, a: 1, b: 2},
      {index: 1, a: 3, b: 4}
    ],
    props: {
      getIndex: (object: {index: number}) => object.index,
      getA: (object: {a: number}) => object.a,
      getB: (object: {b: number}) => object.b,
      getConstant: [9]
    },
    transitions: {},
    buffers: {},
    context: {}
  });

  const layer = new Layer({id: 'grouped-layer'});
  vi.spyOn(layer as any, 'getAttributeManager').mockReturnValue(attributeManager);
  const model = {
    userData: {},
    setBufferLayout: vi.fn(),
    setAttributes: vi.fn(),
    setConstantAttributes: vi.fn(),
    setIndexBuffer: vi.fn()
  };

  (layer as any)._setModelAttributes(model, attributeManager.getAttributes());

  expect(model.setBufferLayout.mock.calls[0][0].map(layout => layout.name)).toEqual([
    'constant',
    'group-a'
  ]);
  expect(model.setAttributes).toHaveBeenCalledWith(
    expect.objectContaining({'group-a': expect.anything(), constant: expect.anything()})
  );
  expect(model.setIndexBuffer).toHaveBeenCalledTimes(1);

  const excludedModel = {
    userData: {excludeAttributes: {b: true}},
    setBufferLayout: vi.fn(),
    setAttributes: vi.fn(),
    setConstantAttributes: vi.fn(),
    setIndexBuffer: vi.fn()
  };
  (layer as any)._setModelAttributes(excludedModel, attributeManager.getAttributes());

  expect(excludedModel.setBufferLayout.mock.calls[0][0].map(layout => layout.name)).toEqual([
    'constant',
    'a'
  ]);
  expect(excludedModel.setAttributes.mock.calls[0][0]['group-a']).toBeUndefined();
  expect(excludedModel.setAttributes.mock.calls[0][0].a).toBeTruthy();
  expect(excludedModel.setAttributes.mock.calls[0][0].b).toBeUndefined();

  attributeManager.finalize();
});

test('IconLayer opts into grouped WebGPU layouts without changing WebGL layouts', () => {
  if (!webgpuDevice) return;

  const getLayouts = (testDevice: Device) => {
    const attributeManager = new AttributeManager(testDevice);
    const layer = new IconLayer({id: 'icon-layer', data: []});
    (layer as any).context = {device: testDevice};
    vi.spyOn(layer as any, 'getAttributeManager').mockReturnValue(attributeManager);
    (layer as any).initializeState();

    const layouts = attributeManager
      .getBufferLayouts({isInstanced: true})
      .map(layout => layout.name);

    layer.state.iconManager.finalize();
    attributeManager.finalize();
    return layouts;
  };

  const webglLayouts = getLayouts(device);
  const webgpuLayouts = getLayouts(webgpuDevice);

  expect(webglLayouts).toEqual([
    'instancePositions',
    'instanceSizes',
    'instanceIconDefs',
    'instanceColors',
    'instanceAngles',
    'instancePixelOffset'
  ]);
  expect(webgpuLayouts).toEqual(['instancePositions', 'icon-instance-data']);
});
