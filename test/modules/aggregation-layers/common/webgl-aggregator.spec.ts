// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {WebGLDevice} from '@luma.gl/core/webgl';
import {GPUVector, getGPUVectorData} from '@luma.gl/graph/gpu-data';
import {getAggregatorValueReader} from '../../../../modules/aggregation-layers/src/contour-layer/value-reader';
import type {ShaderModule} from '@luma.gl/shaders';
import {test, expect} from 'vitest';
import {Attribute} from '@deck.gl/core';
import {WebGLAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';

import {IncomeSurvey} from './data-sample';
import {getResourceCounts, binaryAttributeToArray} from './test-utils';

const webglTest = device.type === 'webgl' && WebGLAggregator.isSupported(device) ? test : test.skip;

// luma.gl v9.3 caches GPU resources, so global resource counts no longer
// reliably return to the exact pre-test baseline after destroy().
test.skip('WebGLAggregator#resources', () => {
  const oldResourceCounts = getResourceCounts();
  // An aggregator that calculates average income grouped by education
  const aggregator = new WebGLAggregator(device, {
    dimensions: 1,
    channelCount: 1,
    bufferLayout: [
      {name: 'income', format: 'float32', stepMode: 'vertex'},
      {name: 'education', format: 'float32', stepMode: 'vertex'}
    ],
    vs: `
      in float income;
      in float education;

      void getBin(out int binId) {
        binId = int(education);
      }
      void getValue(out float value) {
        value = income;
      }
    `
  });

  expect(() => aggregator.update(), 'Calling update() without setting props').not.toThrow();
  expect(aggregator.getResult(0)).toBeFalsy();
  expect(aggregator.getBin(0)).toBeFalsy();

  const attributes = {
    income: new Attribute(device, {id: 'income', size: 1, type: 'float32', accessor: 'getIncome'}),
    education: new Attribute(device, {
      id: 'education',
      size: 1,
      type: 'float32',
      accessor: 'getEducation'
    })
  };
  attributes.income.setData({value: new Float32Array(IncomeSurvey.map(d => d.income))});
  attributes.education.setData({value: new Float32Array(IncomeSurvey.map(d => d.education))});

  aggregator.setProps({
    pointCount: IncomeSurvey.length,
    binIdRange: [[4, 9]],
    attributes,
    operations: ['MEAN']
  });

  aggregator.update();
  expect(aggregator.getResult(0)).toBeTruthy();
  expect(aggregator.getBin(0)).toBeTruthy();

  // Resize buffers
  aggregator.setProps({
    binIdRange: [[0, 15]]
  });
  aggregator.update();
  expect(aggregator.getResult(0)).toBeTruthy();
  expect(aggregator.getBin(0)).toBeTruthy();

  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();

  expect(getResourceCounts(), 'GPU resources are deleted').toEqual(oldResourceCounts);
});

const uniformBlock = /* glsl */ `\
uniform binOptionsUniforms {
  float ageGroupSize;
} binOptions;
`;

type BinOptions = {ageGroupSize: number};
const binOptionsUniforms = {
  name: 'binOptions',
  vs: uniformBlock,
  uniformTypes: {ageGroupSize: 'f32'}
} as const satisfies ShaderModule<BinOptions>;

webglTest('WebGLAggregator#1D', () => {
  // An aggregator that calculates:
  // [0] total count [1] average income [2] highest education, grouped by age
  const aggregator = new WebGLAggregator(device, {
    dimensions: 1,
    channelCount: 3,
    bufferLayout: [
      {name: 'age', format: 'float32', stepMode: 'vertex'},
      {name: 'income', format: 'float32', stepMode: 'vertex'},
      {name: 'education', format: 'float32', stepMode: 'vertex'}
    ],
    modules: [binOptionsUniforms],
    vs: `
      in float age;
      in float income;
      in float education;

      void getBin(out int binId) {
        binId = int(floor(age / binOptions.ageGroupSize));
      }
      void getValue(out vec3 value) {
        value = vec3(1.0, income, education);
      }
    `
  });

  const attributes = {
    age: new Attribute(device, {id: 'age', size: 1, type: 'float32', accessor: 'getAge'}),
    income: new Attribute(device, {id: 'income', size: 1, type: 'float32', accessor: 'getIncome'}),
    education: new Attribute(device, {
      id: 'education',
      size: 1,
      type: 'float32',
      accessor: 'getEducation'
    })
  };
  attributes.age.setData({value: new Float32Array(IncomeSurvey.map(d => d.age))});
  attributes.income.setData({value: new Float32Array(IncomeSurvey.map(d => d.income))});
  attributes.education.setData({value: new Float32Array(IncomeSurvey.map(d => d.education))});

  aggregator.setProps({
    pointCount: IncomeSurvey.length,
    binIdRange: [[2, 17]], // age: 10..84
    attributes,
    operations: ['SUM', 'MEAN', 'MAX'],
    binOptions: {ageGroupSize: 5}
  });

  aggregator.update();
  aggregator.preDraw();

  expect(aggregator.binCount, 'binCount').toBe(15);

  expect(binaryAttributeToArray(aggregator.getBins(), aggregator.binCount), 'getBins()').toEqual(
    // biome-ignore format: preserve layout
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  );

  expect(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    'getResult() - total counts'
  ).toEqual(
    // biome-ignore format: preserve layout
    [NaN, 1, 5, 5, 3, 2, 3, 2, 2, 2, 1, 2, 1, 1, 2]
  );
  expect(aggregator.getResultDomain(0), 'getResultDomain() - counts').toEqual([1, 5]);

  expect(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    'getResult() - mean income'
  ).toEqual(
    // biome-ignore format: preserve layout
    [NaN, 25, 48, 54, 100, 145, 250, 72.5, 252.5, 107.5, 0, 127.5, 0, 40, 25]
  );

  expect(aggregator.getResultDomain(1), 'getResultDomain() - mean income').toEqual([0, 252.5]);

  expect(
    binaryAttributeToArray(aggregator.getResult(2), aggregator.binCount),
    'getResult() - max education'
  ).toEqual(
    // biome-ignore format: preserve layout
    [NaN, 1, 3, 4, 5, 4, 5, 3, 3, 5, 3, 4, 1, 2, 3]
  );

  expect(aggregator.getResultDomain(2), 'getResultDomain() - max education').toEqual([1, 5]);

  // Empty bin
  expect(aggregator.getBin(0), 'getBin() - empty').toEqual({
    id: [2],
    count: 0,
    value: [NaN, NaN, NaN]
  });
  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 42, household: 2, income: 110, education: 5},
  // {age: 44, household: 4, income: 500, education: 4},
  expect(aggregator.getBin(6), 'getBin()').toEqual({id: [8], count: 3, value: [3, 250, 5]});

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();
});

webglTest('WebGLAggregator#2D', () => {
  // An aggregator that calculates:
  // [0] total count [1] average income, grouped by [age, education]
  const aggregator = new WebGLAggregator(device, {
    dimensions: 2,
    channelCount: 2,
    bufferLayout: [
      {name: 'age', format: 'float32', stepMode: 'vertex'},
      {name: 'income', format: 'float32', stepMode: 'vertex'},
      {name: 'education', format: 'float32', stepMode: 'vertex'}
    ],
    modules: [binOptionsUniforms],
    vs: `
      in float age;
      in float income;
      in float education;

      void getBin(out ivec2 binId) {
        binId.x = int(floor(age / binOptions.ageGroupSize));
        binId.y = int(education);
      }
      void getValue(out vec2 value) {
        value = vec2(5.0, income);
      }
    `
  });

  const attributes = {
    age: new Attribute(device, {id: 'age', size: 1, type: 'float32', accessor: 'getAge'}),
    income: new Attribute(device, {id: 'income', size: 1, type: 'float32', accessor: 'getIncome'}),
    education: new Attribute(device, {
      id: 'education',
      size: 1,
      type: 'float32',
      accessor: 'getEducation'
    })
  };
  attributes.age.setData({value: new Float32Array(IncomeSurvey.map(d => d.age))});
  attributes.income.setData({value: new Float32Array(IncomeSurvey.map(d => d.income))});
  attributes.education.setData({value: new Float32Array(IncomeSurvey.map(d => d.education))});

  aggregator.setProps({
    pointCount: IncomeSurvey.length,
    binIdRange: [
      [2, 6],
      [1, 6]
    ], // age: 20..59, education: 1..5
    attributes,
    operations: ['COUNT', 'MEAN'],
    binOptions: {ageGroupSize: 10}
  });

  aggregator.update();
  aggregator.preDraw();

  expect(aggregator.binCount, 'binCount').toBe(20);

  expect(binaryAttributeToArray(aggregator.getBins(), aggregator.binCount), 'getBins()').toEqual(
    // biome-ignore format: preserve layout
    [ 2, 1, 3, 1, 4, 1, 5, 1,
      2, 2, 3, 2, 4, 2, 5, 2,
      2, 3, 3, 3, 4, 3, 5, 3,
      2, 4, 3, 4, 4, 4, 5, 4,
      2, 5, 3, 5, 4, 5, 5, 5 ]
  );

  expect(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    'getResult() - total counts'
  ).toEqual(
    // biome-ignore format: preserve layout
    [ NaN, NaN, NaN, NaN, 4,
      NaN, 1, NaN, 4, 2,
      1, 3, 2, 2, 2,
      NaN, NaN, 1, 1, 1 ]
  );
  expect(aggregator.getResultDomain(0), 'getResultDomain() - counts').toEqual([1, 4]);

  expect(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    'getResult() - mean income'
  ).toEqual(
    // biome-ignore format: preserve layout
    [ NaN, NaN, NaN, NaN, 25,
      NaN, 65, NaN, 97.5, 90,
      80, 200, 10, 175, 320,
      NaN, NaN, 60, 110, 120 ]
  );
  expect(aggregator.getResultDomain(1), 'getResultDomain() - mean income').toEqual([10, 320]);

  // Empty bin
  expect(aggregator.getBin(0), 'getBin() - empty').toEqual({id: [2, 1], count: 0, value: [0, NaN]});
  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 44, household: 4, income: 500, education: 4},
  expect(aggregator.getBin(14), 'getBin()').toEqual({id: [4, 4], count: 2, value: [2, 320]});

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();
});

webglTest('CPUAggregator#setNeedsUpdate', () => {
  const aggregator = new WebGLAggregator(device, {
    dimensions: 1,
    channelCount: 2,
    bufferLayout: [
      {name: 'age', format: 'float32', stepMode: 'vertex'},
      {name: 'income', format: 'float32', stepMode: 'vertex'},
      {name: 'education', format: 'float32', stepMode: 'vertex'}
    ],
    modules: [binOptionsUniforms],
    vs: `
      in float age;
      in float income;
      in float education;

      void getBin(out int binId) {
        binId = int(floor(age / binOptions.ageGroupSize));
      }
      void getValue(out vec2 value) {
        value = vec2(income, education);
      }
    `
  });

  const attributes = {
    age: new Attribute(device, {id: 'age', size: 1, type: 'float32', accessor: 'getAge'}),
    income: new Attribute(device, {id: 'income', size: 1, type: 'float32', accessor: 'getIncome'}),
    education: new Attribute(device, {
      id: 'education',
      size: 1,
      type: 'float32',
      accessor: 'getEducation'
    })
  };
  attributes.age.setData({value: new Float32Array(IncomeSurvey.map(d => d.age))});
  attributes.income.setData({value: new Float32Array(IncomeSurvey.map(d => d.income))});
  attributes.education.setData({value: new Float32Array(IncomeSurvey.map(d => d.education))});

  aggregator.setProps({
    pointCount: IncomeSurvey.length,
    binIdRange: [[4, 14]], // age: 20..69
    attributes,
    operations: ['MIN', 'MAX'],
    binOptions: {ageGroupSize: 5}
  });

  aggregator.update();

  let binIds = aggregator.getBins();
  let result0 = aggregator.getResult(0);
  let result1 = aggregator.getResult(1);

  expect(binIds, 'calculated bin IDs').toBeTruthy();
  expect(result0, 'calculated channel 0').toBeTruthy();
  expect(result1, 'calculated channel 1').toBeTruthy();

  aggregator.update();
  expect(aggregator.getBins(), 'did not update bins').toBe(binIds);
  expect(aggregator.getResult(0), 'did not update channel 0').toBe(result0);
  expect(aggregator.getResult(1), 'did not update channel 1').toBe(result1);

  aggregator.setNeedsUpdate(1);
  aggregator.update();
  expect(aggregator.getBins(), 'did not update bins').toBe(binIds);
  expect(aggregator.getResult(0), 'did not update channel 0').toBe(result0);
  expect(aggregator.getResult(1), 'did not update channel 1 (buffer ref unchanged)').toBe(result1);

  aggregator.setProps({
    binIdRange: [[2, 17]] // age: 10..84
  });
  aggregator.update();
  expect(aggregator.getBins(), 'updated bins').not.toBe(binIds);
  expect(aggregator.getResult(0), 'updated channel 0').not.toBe(result0);
  expect(aggregator.getResult(1), 'updated channel 1').not.toBe(result1);

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();
});

webglTest.each([1, 2] as const)('WebGLAggregator#GPUVector outputs (%i dimensions)', dimensions => {
  const aggregator = new WebGLAggregator(device, {
    dimensions,
    channelCount: 2,
    bufferLayout: [],
    vs:
      dimensions === 1
        ? 'void getBin(out int id) { id = 0; } void getValue(out vec2 value) { value = vec2(1.0); }'
        : 'void getBin(out ivec2 id) { id = ivec2(0); } void getValue(out vec2 value) { value = vec2(1.0); }'
  });
  const range = (count: number): [number, number][] =>
    dimensions === 1
      ? [[0, count]]
      : [
          [0, count],
          [0, 1]
        ];
  expect(aggregator.getBins()).toBeNull();
  expect(aggregator.getResult(0)).toBeNull();
  aggregator.setProps({binIdRange: range(4)});
  const bins = aggregator.getBins()!;
  const first = aggregator.getResult(0)!;
  const second = aggregator.getResult(1)!;
  expect(bins).toBeInstanceOf(GPUVector);
  expect(bins.format).toBe(dimensions === 1 ? 'float32' : 'float32x2');
  expect(bins.length).toBe(4);
  expect(first.format).toBe('float32');
  expect(second.length).toBe(4);
  const firstData = getGPUVectorData(first);
  const secondData = getGPUVectorData(second);
  expect(secondData.buffer).toBe(firstData.buffer);
  expect(secondData.byteOffset).toBe(4);
  expect(secondData.byteStride).toBe(8);
  expect(aggregator.getResult(2)).toBeNull();
  expect(aggregator.getBins()).toBe(bins);
  expect(aggregator.getResult(1)).toBe(second);

  if (dimensions === 2) {
    firstData.buffer.write(new Float32Array([1, 10, 2, 20, 3, 30, 4, 40]));
    const reader = getAggregatorValueReader({aggregator, binIdRange: range(4), channel: 1})!;
    expect([reader(0, 0), reader(3, 0)]).toEqual([10, 40]);
    expect(reader(4, 0)).toBeNaN();
  }

  // Shrinking reuses storage, but the vector must expose the new logical length.
  for (const count of [2, 0, 4]) {
    aggregator.setProps({binIdRange: range(count)});
    const resized = aggregator.getResult(1)!;
    expect(resized.length).toBe(count);
    expect(aggregator.getBins()!.length).toBe(count);
    expect(getGPUVectorData(resized).buffer).toBe(firstData.buffer);
    expect(resized).not.toBe(second);
    expect(firstData.buffer.destroyed).toBe(false);
  }
  // Borrowed vectors never dispose of the aggregator's storage.
  aggregator.getResult(1)!.destroy();
  expect(firstData.buffer.destroyed).toBe(false);
  aggregator.setProps({binIdRange: range(8)});
  expect(aggregator.getResult(0)!.length).toBe(8);
  expect(getGPUVectorData(aggregator.getResult(0)!).buffer).not.toBe(firstData.buffer);
  expect(firstData.buffer.destroyed).toBe(true);
  const finalBuffer = getGPUVectorData(aggregator.getResult(0)!).buffer;
  aggregator.setProps({binIdRange: range(NaN)});
  expect(aggregator.binCount).toBe(0);
  expect(aggregator.getBins()!.length).toBe(0);
  expect(aggregator.getResult(0)!.length).toBe(0);
  aggregator.destroy();
  expect(finalBuffer.destroyed).toBe(true);
});

webglTest.each([
  {dimensions: 1 as const, emptyEnd: 1},
  {dimensions: 2 as const, emptyEnd: 1},
  {dimensions: 1 as const, emptyEnd: NaN},
  {dimensions: 2 as const, emptyEnd: Infinity}
])(
  'WebGLAggregator#empty draws ($dimensions dimensions, end=$emptyEnd)',
  ({dimensions, emptyEnd}) => {
    const gl = (device as WebGLDevice).gl;
    // Other suites share this context; only attribute errors from this test to these draws.
    while (gl.getError() !== gl.NO_ERROR) {}
    const aggregator = new WebGLAggregator(device, {
      dimensions,
      channelCount: 2,
      bufferLayout: [],
      operations: ['SUM', 'SUM'],
      vs:
        dimensions === 1
          ? 'void getBin(out int id) { id = 1; } void getValue(out vec2 value) { value = vec2(2.0, 5.0); }'
          : 'void getBin(out ivec2 id) { id = ivec2(1, 0); } void getValue(out vec2 value) { value = vec2(2.0, 5.0); }'
    });
    try {
      // Start empty, recover, empty populated storage, then recover with new values.
      for (const [end, pointCount] of [
        [emptyEnd, 3],
        [3, 3],
        [emptyEnd, 5],
        [3, 7]
      ]) {
        const binIdRange: [number, number][] =
          dimensions === 1
            ? [[1, end]]
            : [
                [1, end],
                [0, 1]
              ];
        aggregator.setProps({binIdRange, pointCount});
        expect(gl.getError(), 'allocation errors').toBe(gl.NO_ERROR);
        aggregator.update();
        aggregator.preDraw();
        expect(gl.getError(), 'draw errors').toBe(gl.NO_ERROR);
        const count = end === 3 ? 2 : 0;
        expect(aggregator.binCount).toBe(count);
        expect(aggregator.getBins()!.length).toBe(count);
        expect(aggregator.getResult(0)!.length).toBe(count);
        expect(aggregator.getResult(1)!.length).toBe(count);
        expect(binaryAttributeToArray(aggregator.getBins(), count)).toEqual(
          count ? (dimensions === 1 ? [1, 2] : [1, 0, 2, 0]) : []
        );
        expect(binaryAttributeToArray(aggregator.getResult(0), count)).toEqual(
          count ? [pointCount * 2, NaN] : []
        );
        expect(binaryAttributeToArray(aggregator.getResult(1), count)).toEqual(
          count ? [pointCount * 5, NaN] : []
        );
        if (dimensions === 2) {
          const reader = getAggregatorValueReader({aggregator, binIdRange, channel: 1});
          if (count) {
            expect(reader!(1, 0)).toBe(pointCount * 5);
            expect(
              getAggregatorValueReader({
                aggregator,
                binIdRange: [
                  [1, Infinity],
                  [0, 1]
                ],
                channel: 1
              })
            ).toBeNull();
          } else {
            expect(reader).toBeNull();
          }
        }
        expect(gl.getError(), `GPU errors after range end ${end}`).toBe(gl.NO_ERROR);
      }
    } finally {
      aggregator.destroy();
    }
  }
);
