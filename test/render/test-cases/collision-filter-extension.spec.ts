// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import type {ScatterplotLayerProps} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import type {CollisionFilterExtensionProps} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';
import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {expandViewMatrix} from '../view-presets';
import type {ViewPresetName} from '../view-presets';
import type {TestCase} from '../deck-test-utils';

const getYear = d => d.YR_INSTALLED || 1997;

// CollisionFilterExtension resolves collisions in clip space using the active view's matrices, so
// it is view-agnostic: every variant is rendered under MapView and GlobeView (same lng/lat data,
// same framing). The `simple` variant is additionally rendered under OrthographicView with the
// data converted to the map preset's pixel space, proving the cartesian picture matches too.
type Variant = {
  name: string;
  props: Partial<ScatterplotLayerProps & CollisionFilterExtensionProps>;
  /** View presets to render under; defaults to map + globe */
  presets?: ViewPresetName[];
};

const variants: Variant[] = [
  {
    name: 'simple',
    props: {},
    presets: ['map', 'globe', 'orthographic']
  },
  {
    name: '2x-radius',
    props: {collisionTestProps: {radiusScale: 2}}
  },
  {
    name: 'disabled',
    props: {collisionEnabled: false}
  },
  {
    name: 'ascending',
    props: {getCollisionPriority: d => getYear(d) - 2000}
  },
  {
    name: 'descending',
    props: {getCollisionPriority: d => 2000 - getYear(d)}
  }
];

const testCases: TestCase[] = variants.flatMap(({name, props, presets}) =>
  expandViewMatrix(
    {
      name: `collision-filter-effect-${name}`,
      layers: ({coordinateSystem, toPosition}) => [
        new ScatterplotLayer({
          id: name,
          data: points,
          coordinateSystem,
          extensions: [new CollisionFilterExtension()],
          getPosition: d => toPosition(d.COORDINATES) as [number, number],
          getRadius: 10,
          getFillColor: d => {
            const value = (255 * (2014 - getYear(d))) / 21; // range 1997-2014
            return [value, 0, 255 - value] as [number, number, number];
          },
          radiusUnits: 'pixels',
          ...props
        })
      ],
      imageDiffOptions: {
        threshold: 0.985
      }
    },
    presets
  )
);

describe.each([
  'webgl'
  // 'webgpu'
] as const)('%s', deviceType => {
  runRenderTestSuite(testCases, deviceType);
});
