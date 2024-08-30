import test from 'tape-promise/tape';
import {Attribute} from '@deck.gl/core';
import {WebGLAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils';

import {IncomeSurvey} from './data-sample';
import {getResourceCounts, binaryAttributeToArray} from './test-utils';

test('WebGLAggregator#resources', t => {
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

  t.doesNotThrow(() => aggregator.update(), 'Calling update() without setting props');
  t.notOk(aggregator.getResult(0));
  t.notOk(aggregator.getBin(0));

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
  t.ok(aggregator.getResult(0));
  t.ok(aggregator.getBin(0));

  // Resize buffers
  aggregator.setProps({
    binIdRange: [[0, 15]]
  });
  aggregator.update();
  t.ok(aggregator.getResult(0));
  t.ok(aggregator.getBin(0));

  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();

  t.deepEqual(getResourceCounts(), oldResourceCounts, 'GPU resources are deleted');

  t.end();
});

test('WebGLAggregator#1D', t => {
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
    vs: `
      uniform float ageGroupSize;
      in float age;
      in float income;
      in float education;

      void getBin(out int binId) {
        binId = int(floor(age / ageGroupSize));
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
  aggregator.preDraw({moduleSettings: {}});

  t.is(aggregator.binCount, 15, 'binCount');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getBins(), aggregator.binCount),
    // prettier-ignore
    [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    'getBins()'
  );

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    // prettier-ignore
    [NaN, 1, 5, 5, 3, 2, 3, 2, 2, 2, 1, 2, 1, 1, 2],
    'getResult() - total counts'
  );
  if (device.info.gpu !== 'apple') {
    t.deepEqual(aggregator.getResultDomain(0), [1, 5], 'getResultDomain() - counts');
  }

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    // prettier-ignore
    [NaN, 25, 48, 54, 100, 145, 250, 72.5, 252.5, 107.5, 0, 127.5, 0, 40, 25],
    'getResult() - mean income'
  );

  if (device.info.gpu !== 'apple') {
    t.deepEqual(aggregator.getResultDomain(1), [0, 252.5], 'getResultDomain() - mean income');
  }

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(2), aggregator.binCount),
    // prettier-ignore
    [NaN, 1, 3, 4, 5, 4, 5, 3, 3, 5, 3, 4, 1, 2, 3],
    'getResult() - max education'
  );
  if (device.info.gpu !== 'apple') {
    t.deepEqual(aggregator.getResultDomain(2), [1, 5], 'getResultDomain() - max education');
  }

  // Empty bin
  t.deepEqual(
    aggregator.getBin(0),
    {id: [2], count: 0, value: [NaN, NaN, NaN]},
    'getBin() - empty'
  );
  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 42, household: 2, income: 110, education: 5},
  // {age: 44, household: 4, income: 500, education: 4},
  t.deepEqual(aggregator.getBin(6), {id: [8], count: 3, value: [3, 250, 5]}, 'getBin()');

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();
  t.end();
});

test('WebGLAggregator#2D', t => {
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
    vs: `
      uniform float ageGroupSize;
      in float age;
      in float income;
      in float education;

      void getBin(out ivec2 binId) {
        binId.x = int(floor(age / ageGroupSize));
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
  aggregator.preDraw({moduleSettings: {}});

  t.is(aggregator.binCount, 20, 'binCount');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getBins(), aggregator.binCount),
    // prettier-ignore
    [ 2, 1, 3, 1, 4, 1, 5, 1,
      2, 2, 3, 2, 4, 2, 5, 2,
      2, 3, 3, 3, 4, 3, 5, 3,
      2, 4, 3, 4, 4, 4, 5, 4,
      2, 5, 3, 5, 4, 5, 5, 5 ],
    'getBins()'
  );

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    // prettier-ignore
    [ NaN, NaN, NaN, NaN, 4,
      NaN, 1, NaN, 4, 2,
      1, 3, 2, 2, 2,
      NaN, NaN, 1, 1, 1 ],
    'getResult() - total counts'
  );
  if (device.info.gpu !== 'apple') {
    t.deepEqual(aggregator.getResultDomain(0), [1, 4], 'getResultDomain() - counts');
  }

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    // prettier-ignore
    [ NaN, NaN, NaN, NaN, 25,
      NaN, 65, NaN, 97.5, 90,
      80, 200, 10, 175, 320,
      NaN, NaN, 60, 110, 120 ],
    'getResult() - mean income'
  );
  if (device.info.gpu !== 'apple') {
    t.deepEqual(aggregator.getResultDomain(1), [10, 320], 'getResultDomain() - mean income');
  }

  // Empty bin
  t.deepEqual(aggregator.getBin(0), {id: [2, 1], count: 0, value: [0, NaN]}, 'getBin() - empty');
  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 44, household: 4, income: 500, education: 4},
  t.deepEqual(aggregator.getBin(14), {id: [4, 4], count: 2, value: [2, 320]}, 'getBin()');

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();
  t.end();
});

test('CPUAggregator#setNeedsUpdate', t => {
  const aggregator = new WebGLAggregator(device, {
    dimensions: 1,
    channelCount: 2,
    bufferLayout: [
      {name: 'age', format: 'float32', stepMode: 'vertex'},
      {name: 'income', format: 'float32', stepMode: 'vertex'},
      {name: 'education', format: 'float32', stepMode: 'vertex'}
    ],
    vs: `
      uniform float ageGroupSize;
      in float age;
      in float income;
      in float education;

      void getBin(out int binId) {
        binId = int(floor(age / ageGroupSize));
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

  t.ok(binIds, 'calculated bin IDs');
  t.ok(result0, 'calculated channel 0');
  t.ok(result1, 'calculated channel 1');

  aggregator.update();
  t.is(aggregator.getBins(), binIds, 'did not update bins');
  t.is(aggregator.getResult(0), result0, 'did not update channel 0');
  t.is(aggregator.getResult(1), result1, 'did not update channel 1');

  aggregator.setNeedsUpdate(1);
  aggregator.update();
  t.is(aggregator.getBins(), binIds, 'did not update bins');
  t.is(aggregator.getResult(0), result0, 'did not update channel 0');
  t.is(aggregator.getResult(1), result1, 'did not update channel 1 (buffer ref unchanged)');

  aggregator.setProps({
    binIdRange: [[2, 17]] // age: 10..84
  });
  aggregator.update();
  t.not(aggregator.getBins(), binIds, 'updated bins');
  t.not(aggregator.getResult(0), result0, 'updated channel 0');
  t.not(aggregator.getResult(1), result1, 'updated channel 1');

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
  aggregator.destroy();

  t.end();
});
