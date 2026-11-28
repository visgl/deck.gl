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

// Collision filtering happens in clip space, so each variant renders the same picture under MapView
// and GlobeView; `simple` also renders under OrthographicView with the data in the map's pixel space.
// Points are 10 px dots coloured by install year, red for 1997 through blue for 2014.
type Variant = {
  name: string;
  props: Partial<ScatterplotLayerProps & CollisionFilterExtensionProps>;
  /** View presets to render under; defaults to map + globe */
  presets?: ViewPresetName[];
};

const variants: Variant[] = [
  {
    // Golden: San Francisco dots thinned so none overlap, the same on map, globe and orthographic
    name: 'simple',
    props: {},
    presets: ['map', 'globe', 'orthographic']
  },
  {
    // Golden: fewer dots than `simple`, each surrounded by at least a dot's width of empty space
    name: '2x-radius',
    props: {collisionTestProps: {radiusScale: 2}}
  },
  {
    // Golden: every dot of the dataset, overlapping freely
    name: 'disabled',
    props: {collisionEnabled: false}
  },
  {
    // Golden: the thinned dots are mostly blue, since newer installs win the collisions
    name: 'ascending',
    props: {getCollisionPriority: d => getYear(d) - 2000}
  },
  {
    // Golden: the thinned dots are mostly red, since older installs win the collisions
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

// Cover the map and orthographic collision variants on WebGPU.
describe('webgpu', () => {
  runRenderTestSuite(
    testCases.filter(testCase => !testCase.name.endsWith('-globe')),
    'webgpu'
  );
});
