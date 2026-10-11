// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer} from '@deck.gl/test-utils/vitest';
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
          'collision background not drawn in draw pass'
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
        background: true,
        getBackgroundColor: [255, 255, 255, 200],
        getBorderColor: [255, 0, 0, 255],
        getBorderWidth: 2,
        backgroundBorderRadius: 4,
        backgroundPadding: [5, 6, 7, 8]
      },
      onAfterUpdate: ({subLayers}) => {
        const [textLayer] = subLayers;
        const textSubLayers = textLayer.getSubLayers();
        expect(
          textSubLayers.length,
          'visual background, collision background and text created'
        ).toBe(3);

        const visualBackgroundLayer = textSubLayers.find(
          layer => layer.id.endsWith('-background') && !layer.id.endsWith('-collision-background')
        )!;
        const collisionBackgroundLayer = textSubLayers.find(layer =>
          layer.id.endsWith('-collision-background')
        )!;
        const multiIconLayer = textSubLayers.find(
          layer => layer.constructor.layerName === 'MultiIconLayer'
        )!;

        expect(visualBackgroundLayer, 'visual background subLayer created').toBeTruthy();
        expect(collisionBackgroundLayer, 'collision background subLayer created').toBeTruthy();
        expect(multiIconLayer, 'text subLayer created').toBeTruthy();
        expect(
          visualBackgroundLayer.constructor.layerName,
          'visual background uses the standard TextLayer shader'
        ).toBe('TextBackgroundLayer');
        expect(
          collisionBackgroundLayer.constructor.layerName,
          'collision background uses the expanded collision shader'
        ).toBe('EnhancedTextBackgroundLayer');

        expect(
          visualBackgroundLayer.props.padding,
          'visual background uses TextLayer padding'
        ).toEqual([5, 6, 7, 8]);
        expect(
          visualBackgroundLayer.props.getFillColor,
          'visual background color forwarded'
        ).toEqual([255, 255, 255, 200]);
        expect(
          visualBackgroundLayer.props.getLineColor,
          'visual background border color forwarded'
        ).toEqual([255, 0, 0, 255]);
        expect(
          visualBackgroundLayer.props.getLineWidth,
          'visual background border width forwarded'
        ).toBe(2);
        expect(
          visualBackgroundLayer.props.borderRadius,
          'visual background border radius forwarded'
        ).toBe(4);

        expect(
          textLayer.filterSubLayer({layer: visualBackgroundLayer, renderPass: 'draw'}),
          'visual background drawn in draw pass'
        ).toBeTruthy();
        expect(
          !textLayer.filterSubLayer({layer: collisionBackgroundLayer, renderPass: 'draw'}),
          'collision background not drawn in draw pass'
        ).toBeTruthy();
        expect(
          !textLayer.filterSubLayer({layer: visualBackgroundLayer, renderPass: 'collision'}),
          'visual background not drawn in collision pass'
        ).toBeTruthy();
        expect(
          textLayer.filterSubLayer({layer: collisionBackgroundLayer, renderPass: 'collision'}),
          'collision background drawn in collision pass'
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
  testLayer({Layer: PointLabelLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
