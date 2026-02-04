// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {testLayer} from '@deck.gl/test-utils';
import {PointLabelLayer} from '@deck.gl/carto';
import * as FIXTURES from 'deck.gl-test/data';

test('PointLabelLayer', () => {
  const testCases = [
    {
      props: {
        data: FIXTURES.geojson
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'Single sublayer created').toBe(1);
        const [textLayer] = subLayers;
        expect(textLayer.constructor.layerName, 'Correct subLayer created').toBe(
          'EnhancedTextLayer'
        );

        const [textBackgroundLayer, multiIconLayer] = subLayers[0].getSubLayers();
        expect(
          textBackgroundLayer.constructor.layerName,
          'Correct background subLayer created'
        ).toBe('EnhancedTextBackgroundLayer');
        expect(multiIconLayer.constructor.layerName, 'Correct icon subLayer created').toBe(
          'MultiIconLayer'
        );

        const {vs} = textBackgroundLayer.getShaders();
        expect(
          vs.includes('_padding = textBackground.padding + instancePixelOffsets.xyxy'),
          'text background layer shader patched'
        ).toBeTruthy();

        expect(
          !textLayer.filterSubLayer({layer: textBackgroundLayer, renderPass: 'draw'}),
          'background not drawn in draw pass'
        ).toBeTruthy();
        expect(
          textLayer.filterSubLayer({layer: multiIconLayer, renderPass: 'draw'}),
          'text drawn in draw pass'
        ).toBeTruthy();
        expect(
          textLayer.filterSubLayer({layer: textBackgroundLayer, renderPass: 'collision'}),
          'background drawn in collision pass'
        ).toBeTruthy();
        expect(
          !textLayer.filterSubLayer({layer: multiIconLayer, renderPass: 'collision'}),
          'text not drawn in collision pass'
        ).toBeTruthy();
      }
    },
    {
      props: {
        data: FIXTURES.geojson,
        getSecondaryText: 'SECONDARY'
      },
      onAfterUpdate: ({subLayers}) => {
        expect(subLayers.length, 'Two sublayers created').toBe(2);
        for (const i of [0, 1]) {
          expect(subLayers[i].constructor.layerName, `Correct subLayer[${i}] created`).toBe(
            'EnhancedTextLayer'
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
        expect(textLayer.props.getPixelOffset, 'correct pixel offset').toEqual([12.75, -13.75]);
        expect(secondaryTextLayer.props.getPixelOffset, 'correct secondary pixel offset').toEqual([
          12.75, -12.55
        ]);

        const [textBackgroundLayer] = textLayer.getSubLayers();
        expect(textBackgroundLayer.props.padding, 'correct background padding').toEqual([
          12, 3, 0, 0
        ]);
      }
    }
  ];
  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: PointLabelLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});
