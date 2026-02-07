// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Attribute, BinaryAttribute, _deepEqual} from '@deck.gl/core';
import {CPUAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';

import {IncomeSurvey} from '../data-sample';
import {binaryAttributeToArray} from '../test-utils';

test('CPUAggregator#1D', () => {
  // An aggregator that calculates:
  // [0] total count [1] average income [2] highest education, grouped by age
  const aggregator = new CPUAggregator({
    dimensions: 1,
    getBin: {
      sources: ['age'],
      getValue: ({age}, index, {ageGroupSize}) => [Math.floor(age / ageGroupSize)]
    },
    getValue: [
      {getValue: () => 1},
      {sources: ['income'], getValue: ({income}) => income},
      {sources: ['education'], getValue: ({education}) => education}
    ]
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
    attributes,
    operations: ['SUM', 'MEAN', 'MAX'],
    binOptions: {ageGroupSize: 5}
  });

  aggregator.update();

  expect(aggregator.binCount, 'binCount').toBe(14);

  expect(binaryAttributeToArray(aggregator.getBins(), aggregator.binCount), 'getBins()').toEqual(
    // prettier-ignore
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]
  );

  expect(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    'getResult() - total counts'
  ).toEqual(
    // prettier-ignore
    [1, 5, 5, 3, 2, 3, 2, 2, 2, 1, 2, 1, 1, 2]
  );
  expect(aggregator.getResultDomain(0), 'getResultDomain() - counts').toEqual([1, 5]);

  expect(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    'getResult() - mean income'
  ).toEqual(
    // prettier-ignore
    [25, 48, 54, 100, 145, 250, 72.5, 252.5, 107.5, 0, 127.5, 0, 40, 25]
  );
  expect(aggregator.getResultDomain(1), 'getResultDomain() - mean income').toEqual([0, 252.5]);

  expect(
    binaryAttributeToArray(aggregator.getResult(2), aggregator.binCount),
    'getResult() - max education'
  ).toEqual(
    // prettier-ignore
    [1, 3, 4, 5, 4, 5, 3, 3, 5, 3, 4, 1, 2, 3]
  );
  expect(aggregator.getResultDomain(2), 'getResultDomain() - max education').toEqual([1, 5]);

  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 42, household: 2, income: 110, education: 5},
  // {age: 44, household: 4, income: 500, education: 4},
  expect(aggregator.getBin(5), 'getBin()').toEqual({
    id: [8],
    count: 3,
    value: [3, 250, 5],
    pointIndices: [16, 17, 18]
  });

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
});

test('CPUAggregator#2D', () => {
  // An aggregator that calculates:
  // [0] total count [1] average income, grouped by [age, education]
  const aggregator = new CPUAggregator({
    dimensions: 2,
    getBin: {
      sources: ['age', 'education'],
      getValue: ({age, education}, index, {ageGroupSize}) => {
        // age: 20..59
        if (age >= 20 && age < 60) {
          return [Math.floor(age / ageGroupSize), education];
        }
        return null;
      }
    },
    getValue: [{getValue: () => 1}, {sources: ['income'], getValue: ({income}) => income}]
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
    attributes,
    operations: ['COUNT', 'MEAN'],
    binOptions: {ageGroupSize: 10}
  });

  aggregator.update();

  expect(aggregator.binCount, 'binCount').toBe(12);

  expect(binaryAttributeToArray(aggregator.getBins(), aggregator.binCount), 'getBins()').toEqual(
    // prettier-ignore
    [ 2, 2, 2, 3, 2, 4,
      3, 3, 3, 4, 3, 5,
      4, 4, 4, 5, 4, 3, 4, 2,
      5, 3, 5, 5 ]
  );

  expect(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.binCount),
    'getResult() - total counts'
  ).toEqual(
    // prettier-ignore
    [ 4, 4, 2, 2, 2, 1, 2, 1, 1, 1, 3, 1 ]
  );
  expect(aggregator.getResultDomain(0), 'getResultDomain() - counts').toEqual([1, 4]);

  expect(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.binCount),
    'getResult() - mean income'
  ).toEqual(
    // prettier-ignore
    [25, 97.5, 10, 90, 175, 60, 320, 110, 80, 65, 200, 120 ]
  );
  expect(aggregator.getResultDomain(1), 'getResultDomain() - mean income').toEqual([10, 320]);

  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 44, household: 4, income: 500, education: 4},
  expect(aggregator.getBin(6), 'getBin()').toEqual({
    id: [4, 4],
    count: 2,
    value: [2, 320],
    pointIndices: [16, 18]
  });

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
});

test('CPUAggregator#setNeedsUpdate', () => {
  const aggregator = new CPUAggregator({
    dimensions: 1,
    getBin: {
      sources: ['age'],
      getValue: ({age}, index, {ageGroupSize}) => [Math.floor(age / ageGroupSize)]
    },
    getValue: [
      {sources: ['income'], getValue: ({income}) => income},
      {sources: ['education'], getValue: ({education}) => education}
    ]
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
  expect(aggregator.getResult(1), 'updated channel 1').not.toBe(result1);

  aggregator.setNeedsUpdate();
  aggregator.update();
  expect(aggregator.getBins(), 'updated bins').not.toBe(binIds);
  expect(aggregator.getResult(0), 'updated channel 0').not.toBe(result0);
  expect(aggregator.getResult(1), 'updated channel 1').not.toBe(result1);

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();
});
