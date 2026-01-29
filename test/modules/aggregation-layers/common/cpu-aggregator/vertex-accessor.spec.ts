// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Attribute} from '@deck.gl/core';
import {
  VertexAccessor,
  evaluateVertexAccessor
} from '@deck.gl/aggregation-layers/common/aggregator/cpu-aggregator/vertex-accessor';
import {device} from '@deck.gl/test-utils';

test('evaluateVertexAccessor#sources', () => {
  const attributes = {
    size: new Attribute(device, {
      id: 'size',
      size: 1,
      accessor: 'getSize'
    }),
    position: new Attribute(device, {
      id: 'position',
      size: 3,
      type: 'float64',
      accessor: 'getPosition'
    })
  };

  attributes.size.setData({value: new Float32Array([1])});
  attributes.position.setData({value: new Float32Array(3)});

  let getter = evaluateVertexAccessor(
    {
      sources: ['size'],
      getValue: data => {
        expect(data.size, 'size is present in data').toBeTruthy();
        expect(data.position, 'position is not present in data').toBeFalsy();
      }
    },
    attributes,
    {}
  );
  getter(0);

  getter = evaluateVertexAccessor(
    {
      sources: ['size', 'position'],
      getValue: data => {
        expect(data.size, 'size is present in data').toBeTruthy();
        expect(data.position, 'position is present in data').toBeTruthy();
      }
    },
    attributes,
    {}
  );
  getter(0);

  expect(
    () =>
      evaluateVertexAccessor(
        {
          sources: ['count'],
          getValue: data => 0
        },
        attributes,
        {}
      ),
    'should throw on missing attribute'
  ).toThrow();

  attributes.size.delete();
  attributes.position.delete();
});

test('evaluateVertexAccessor#size=1', () => {
  const attributes = {
    size: new Attribute(device, {
      id: 'size',
      size: 1,
      accessor: 'getSize'
    })
  };
  const accessor: VertexAccessor<number, any> = {
    sources: ['size'],
    getValue: ({size}) => size
  };

  attributes.size.setData({value: new Float32Array([6, 7, 8, 9])});
  let getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'Basic attribute').toBe(7);

  attributes.size.setData({value: new Float32Array([6, 7, 8, 9]), stride: 8, offset: 4});
  getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'With stride and offset').toBe(9);

  attributes.size.setData({value: new Float32Array([6]), constant: true});
  getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'From constant').toBe(6);

  attributes.size.delete();
});

test('evaluateVertexAccessor#size=3', () => {
  const attributes = {
    position: new Attribute(device, {
      id: 'position',
      size: 3,
      type: 'float64',
      accessor: 'getPosition'
    })
  };
  const accessor: VertexAccessor<number[], any> = {
    sources: ['position'],
    getValue: ({position}) => position
  };

  // prettier-ignore
  attributes.position.setData({value: new Float64Array([0, 0, 0.5, 1, 0, 0.75, 1, 1, 0.25, 0, 1, 0.45])});
  let getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'Basic attribute').toEqual([1, 0, 0.75]);

  // prettier-ignore
  attributes.position.setData({value: new Float64Array([0, 0, 0.5, 1, 0, 0.75, 1, 1, 0.25, 0, 1, 0.45]), stride: 48, offset: 8});
  getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'With stride and offset').toEqual([1, 0.25, 0]);

  attributes.position.setData({value: new Float32Array([0, 1, 0.5]), constant: true});
  getter = evaluateVertexAccessor(accessor, attributes, {});
  expect(getter(1), 'With stride and offset').toEqual([0, 1, 0.5]);

  attributes.position.delete();
});
