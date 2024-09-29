// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {testLayer} from '@deck.gl/test-utils';
import {_PointLabelLayer as PointLabelLayer} from '@deck.gl/carto';
import * as FIXTURES from 'deck.gl-test/data';

test('PointLabelLayer', t => {
  const testCases = [
    {
      props: {
        data: FIXTURES.geojson
      },
      onAfterUpdate: ({subLayers}) => {
        t.equal(subLayers.length, 1, 'Single sublayer created');
        const [textLayer] = subLayers;
        t.equal(textLayer.constructor.layerName, 'EnhancedTextLayer', 'Correct subLayer created');

        const [textBackgroundLayer, multiIconLayer] = subLayers[0].getSubLayers();
        t.equal(
          textBackgroundLayer.constructor.layerName,
          'EnhancedTextBackgroundLayer',
          'Correct background subLayer created'
        );
        t.equal(
          multiIconLayer.constructor.layerName,
          'MultiIconLayer',
          'Correct icon subLayer created'
        );

        const {vs} = textBackgroundLayer.getShaders();
        t.ok(
          vs.includes('_padding = textBackground.padding + instancePixelOffsets.xyxy'),
          'text background layer shader patched'
        );

        t.ok(
          !textLayer.filterSubLayer({layer: textBackgroundLayer, renderPass: 'draw'}),
          'background not drawn in draw pass'
        );
        t.ok(
          textLayer.filterSubLayer({layer: multiIconLayer, renderPass: 'draw'}),
          'text drawn in draw pass'
        );
        t.ok(
          textLayer.filterSubLayer({layer: textBackgroundLayer, renderPass: 'collision'}),
          'background drawn in collision pass'
        );
        t.ok(
          !textLayer.filterSubLayer({layer: multiIconLayer, renderPass: 'collision'}),
          'text not drawn in collision pass'
        );
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSecondaryText: 'SECONDARY'
      },
      onAfterUpdate: ({subLayers}) => {
        t.equal(subLayers.length, 2, 'Two sublayers created');
        for (const i of [0, 1]) {
          t.equal(
            subLayers[i].constructor.layerName,
            'EnhancedTextLayer',
            `Correct subLayer[${i}] created`
          );
        }
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSecondaryText: 'SECONDARY',
        getTextAnchor: 'start',
        getAlignmentBaseline: 'top',
        getRadius: 10
      },
      onAfterUpdate: ({subLayers}) => {
        const [textLayer, secondaryTextLayer] = subLayers;
        t.deepEqual(textLayer.props.getPixelOffset, [12.75, -13.75], 'correct pixel offset');
        t.deepEqual(
          secondaryTextLayer.props.getPixelOffset,
          [12.75, -12.55],
          'correct secondary pixel offset'
        );

        const [textBackgroundLayer] = textLayer.getSubLayers();
        t.deepEqual(textBackgroundLayer.props.padding, [12, 3, 0, 0], 'correct background padding');
      }
    }
  ];
  testLayer({Layer: PointLabelLayer, testCases, onError: t.notOk});
  t.end();
});
