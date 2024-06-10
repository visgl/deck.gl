import test from 'tape-promise/tape';
import {Attribute} from '@deck.gl/core';
import {CPUAggregator} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils';

import {IncomeSurvey} from './data-sample';
import {binaryAttributeToArray} from './test-utils';

test('CPUAggregator#1D', t => {
  // An aggregator that calculates:
  // [0] total count [1] average income [2] highest education, grouped by age
  const aggregator = new CPUAggregator({
    dimensions: 1,
    getBin: {
      sources: ['age'],
      getValue: ({age}, index, {ageGroupSize}) => Math.floor(age / ageGroupSize)
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

  t.is(aggregator.numBins, 14, 'numBins');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getBins(), aggregator.numBins),
    // prettier-ignore
    [3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
    'getBins()'
  );

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.numBins),
    // prettier-ignore
    [1, 5, 5, 3, 2, 3, 2, 2, 2, 1, 2, 1, 1, 2],
    'getResult() - total counts'
  );
  t.deepEqual(aggregator.getResultDomain(0), [1, 5], 'getResultDomain() - counts');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.numBins),
    // prettier-ignore
    [25, 48, 54, 100, 145, 250, 72.5, 252.5, 107.5, 0, 127.5, 0, 40, 25],
    'getResult() - mean income'
  );
  t.deepEqual(aggregator.getResultDomain(1), [0, 252.5], 'getResultDomain() - mean income');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(2), aggregator.numBins),
    // prettier-ignore
    [1, 3, 4, 5, 4, 5, 3, 3, 5, 3, 4, 1, 2, 3],
    'getResult() - max education'
  );
  t.deepEqual(aggregator.getResultDomain(2), [1, 5], 'getResultDomain() - max education');

  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 42, household: 2, income: 110, education: 5},
  // {age: 44, household: 4, income: 500, education: 4},
  t.deepEqual(
    aggregator.getBin(5),
    {id: 8, count: 3, value: [3, 250, 5], points: [16, 17, 18]},
    'getBin()'
  );

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();

  t.end();
});

test.only('CPUAggregator#2D', t => {
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

  t.is(aggregator.numBins, 12, 'numBins');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getBins(), aggregator.numBins),
    // prettier-ignore
    [ 2, 2, 2, 3, 2, 4,
      3, 3, 3, 4, 3, 5,
      4, 4, 4, 5, 4, 3, 4, 2,
      5, 3, 5, 5 ],
    'getBins()'
  );

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(0), aggregator.numBins),
    // prettier-ignore
    [ 4, 4, 2, 2, 2, 1, 2, 1, 1, 1, 3, 1 ],
    'getResult() - total counts'
  );
  t.deepEqual(aggregator.getResultDomain(0), [1, 4], 'getResultDomain() - counts');

  t.deepEqual(
    binaryAttributeToArray(aggregator.getResult(1), aggregator.numBins),
    // prettier-ignore
    [25, 97.5, 10, 90, 175, 60, 320, 110, 80, 65, 200, 120 ],
    'getResult() - mean income'
  );
  t.deepEqual(aggregator.getResultDomain(1), [10, 320], 'getResultDomain() - mean income');

  // {age: 40, household: 4, income: 140, education: 4},
  // {age: 44, household: 4, income: 500, education: 4},
  t.deepEqual(
    aggregator.getBin(6),
    {id: [4, 4], count: 2, value: [2, 320], points: [16, 18]},
    'getBin()'
  );

  attributes.age.delete();
  attributes.income.delete();
  attributes.education.delete();

  t.end();
});
