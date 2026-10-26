// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterAll, beforeAll, expect, test} from 'vitest';
import {GPUDataEvaluator} from '@luma.gl/gpgpu';
import type {Layer} from '@deck.gl/core';
import {device, testLayer, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {Buffer, type Texture} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUConstant, GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import GPUVectorModel from '@deck.gl/core/lib/luma-upstream/gpu-vector-model';
import ArcLayer from '@deck.gl/layers/arc-layer/arc-layer';
import LineLayer from '@deck.gl/layers/line-layer/line-layer';
import PointCloudLayer from '@deck.gl/layers/point-cloud-layer/point-cloud-layer';
import IconLayer from '@deck.gl/layers/icon-layer/icon-layer';
import TextLayer from '@deck.gl/layers/text-layer/text-layer';
import TextBackgroundLayer from '@deck.gl/layers/text-layer/text-background-layer/text-background-layer';

const bufferPoolSize = GPUDataEvaluator.bufferPoolSize;
beforeAll(() => {
  GPUDataEvaluator.bufferPoolSize = 0;
});
afterAll(() => {
  GPUDataEvaluator.bufferPoolSize = bufferPoolSize;
});

const COLOR = [128, 64, 255, 255] as const;
const DATA = [
  {position: [0, 0, 0], sourcePosition: [0, 0, 0], targetPosition: [1, 1, 0], color: COLOR},
  {position: [1, 1, 0], sourcePosition: [1, 1, 0], targetPosition: [2, 2, 0], color: COLOR}
];

function createFixtures(iconAtlas: Texture) {
  const props = {data: DATA};
  return [
    {
      Layer: ArcLayer,
      props: {...props, getSourceColor: COLOR},
      accessor: 'getSourceColor',
      colorAttribute: 'instanceSourceColors',
      positionAttribute: 'instanceSourcePositions'
    },
    {
      Layer: LineLayer,
      props: {...props, getColor: COLOR},
      accessor: 'getColor',
      colorAttribute: 'instanceColors',
      positionAttribute: 'instanceSourcePositions'
    },
    {
      Layer: PointCloudLayer,
      props: {...props, getColor: COLOR},
      accessor: 'getColor',
      colorAttribute: 'instanceColors',
      positionAttribute: 'instancePositions'
    },
    {
      Layer: IconLayer,
      props: {
        ...props,
        iconAtlas,
        iconMapping: {dot: {x: 0, y: 0, width: 1, height: 1}},
        getIcon: 'dot',
        getColor: COLOR
      },
      accessor: 'getColor',
      colorAttribute: 'instanceColors',
      positionAttribute: 'instancePositions'
    },
    {
      Layer: TextBackgroundLayer,
      props: {
        ...props,
        getFillColor: COLOR,
        getBoundingRect: [0, 0, 1, 1]
      },
      accessor: 'getFillColor',
      colorAttribute: 'instanceFillColors',
      positionAttribute: 'instancePositions'
    }
  ];
}

function getAttributeBuffer(model: Model, attributeName: string): Buffer {
  if (model.device.type === 'webgl') {
    const attribute = model.pipeline.shaderLayout.attributes!.find(
      definition => definition.name === attributeName
    );
    expect(attribute).toBeDefined();
    return model.vertexArray.attributes[attribute!.location] as Buffer;
  }
  const layout = model.bufferLayout.find(candidate =>
    candidate.attributes?.some(definition => definition.attribute === attributeName)
  );
  expect(layout).toBeDefined();
  const slot = model.vertexArray.getBufferSlot(layout!.name);
  expect(slot).not.toBeNull();
  return model.vertexArray.attributes[slot!] as Buffer;
}

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Standard layers bind typed columns across updates on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) {
      skip();
      return;
    }
    const iconAtlas = testDevice.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([255, 255, 255, 255])
    });
    try {
      for (const {Layer, props, accessor, colorAttribute, positionAttribute} of createFixtures(
        iconAtlas
      )) {
        await testLayerAsync<Layer>({
          Layer,
          device: testDevice,
          draw: false,
          testCases: [
            {props},
            {
              updateProps: {
                [accessor]: (row: (typeof DATA)[number]) => row.color,
                updateTriggers: {[accessor]: 1}
              }
            },
            {updateProps: {[accessor]: COLOR, updateTriggers: {[accessor]: 2}}}
          ].map((testCase, index) => ({
            ...testCase,
            title: `attribute update ${index}`,
            onAfterUpdate: ({layer}) => {
              const model = layer.getModels()[0];
              expect(model).toBeInstanceOf(GPUVectorModel);
              const attributeManager = layer.getAttributeManager()!;
              const columns = attributeManager.getGPUVectors();
              const varying = index === 1;
              expect(columns[colorAttribute]).toBeInstanceOf(varying ? GPUVector : GPUConstant);
              if (varying) {
                expect((columns[colorAttribute] as GPUVector).length).toBe(DATA.length);
                const group = attributeManager.getAttributes()[colorAttribute].settings.bufferGroup;
                if (backend === 'webgpu' && group) {
                  expect(model.bufferLayout.some(layout => layout.name === group)).toBe(true);
                }
              } else {
                expect(Array.from((columns[colorAttribute] as GPUConstant).value)).toEqual(COLOR);
                if (backend === 'webgl') {
                  const location = model.pipeline.shaderLayout.attributes!.find(
                    attribute => attribute.name === colorAttribute
                  )!.location;
                  expect(model.vertexArray.attributes[location]).toEqual(
                    new Float32Array(COLOR).map(value => value / 255)
                  );
                }
              }
              const position = columns[positionAttribute] as GPUVector;
              expect(position).toBeInstanceOf(GPUVector);
              expect(position.ownsBuffer).toBe(false);
              expect(getAttributeBuffer(model, positionAttribute)).toBe(position.data[0].buffer);
            }
          }))
        });
      }
    } finally {
      expect(iconAtlas.destroyed).toBe(false);
      iconAtlas.destroy();
    }
  });
}

test('LineLayer borrows caller-owned position buffers', () => {
  const buffer = device.createBuffer({data: new Float32Array(12)});
  try {
    testLayer({
      Layer: LineLayer,
      testCases: [
        {
          props: {
            data: {
              length: 2,
              attributes: {
                getSourcePosition: {buffer, size: 3, stride: 24},
                getTargetPosition: {buffer, size: 3, stride: 24, offset: 12}
              }
            }
          },
          onAfterUpdate: ({layer}) => {
            const model = layer.getModels()[0];
            expect(model).toBeInstanceOf(GPUVectorModel);
            expect(getAttributeBuffer(model, 'instanceSourcePositions')).toBe(buffer);
            expect(getAttributeBuffer(model, 'instanceTargetPositions')).toBe(buffer);
          }
        }
      ],
      onError: error => {
        throw error;
      }
    });
    expect(buffer.destroyed).toBe(false);
  } finally {
    buffer.destroy();
  }
});

test('TextLayer uses typed models for glyphs and backgrounds', () => {
  testLayer({
    Layer: TextLayer,
    testCases: [
      {
        props: {data: [{position: [0, 0, 0], text: 'typed'}], background: true},
        onAfterUpdate: ({subLayers}) => {
          expect(subLayers).toHaveLength(2);
          for (const subLayer of subLayers) {
            expect(subLayer.getModels()[0]).toBeInstanceOf(GPUVectorModel);
          }
        }
      }
    ],
    onError: error => {
      throw error;
    }
  });
});
