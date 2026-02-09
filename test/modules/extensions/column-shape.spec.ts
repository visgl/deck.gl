// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {ColumnShapeExtension} from '@deck.gl/extensions';
import {ColumnLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

const SAMPLE_DATA = [
  {position: [0, 0], elevation: 100},
  {position: [1, 1], elevation: 200},
  {position: [2, 2], elevation: 300}
];

test('ColumnShapeExtension#flat bevel', t => {
  const testCases = [
    {
      props: {
        id: 'column-shape-flat',
        data: SAMPLE_DATA,
        extruded: true,
        getPosition: d => d.position,
        getElevation: d => d.elevation,
        extensions: [new ColumnShapeExtension()],
        getBevel: 'flat',
        getRadius: 1
      },
      onAfterUpdate: ({layer}) => {
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceBevelSegs, 'instanceBevelSegs attribute exists');
        t.ok(attributes.instanceBevelHeights, 'instanceBevelHeights attribute exists');
        t.ok(attributes.instanceBevelBulge, 'instanceBevelBulge attribute exists');
        t.ok(attributes.instanceRadii, 'instanceRadii attribute exists');
      }
    }
  ];

  testLayer({Layer: ColumnLayer, testCases, onError: t.notOk});
  t.end();
});

test('ColumnShapeExtension#dome bevel', t => {
  const testCases = [
    {
      props: {
        id: 'column-shape-dome',
        data: SAMPLE_DATA,
        extruded: true,
        getPosition: d => d.position,
        getElevation: d => d.elevation,
        extensions: [new ColumnShapeExtension()],
        getBevel: 'dome',
        getRadius: d => 1.5
      },
      onAfterUpdate: ({layer}) => {
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceRadii, 'instanceRadii attribute exists for dome');
      }
    }
  ];

  testLayer({Layer: ColumnLayer, testCases, onError: t.notOk});
  t.end();
});

test('ColumnShapeExtension#custom bevel object', t => {
  const testCases = [
    {
      props: {
        id: 'column-shape-custom',
        data: SAMPLE_DATA,
        extruded: true,
        getPosition: d => d.position,
        getElevation: d => d.elevation,
        extensions: [new ColumnShapeExtension()],
        getBevel: {segs: 6, height: 0.8, bulge: 0.3},
        getRadius: d => d.elevation / 100
      },
      onAfterUpdate: ({layer}) => {
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(attributes.instanceBevelSegs, 'instanceBevelSegs attribute exists for custom bevel');
      }
    }
  ];

  testLayer({Layer: ColumnLayer, testCases, onError: t.notOk});
  t.end();
});
