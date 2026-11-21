// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// One source path crosses the antimeridian and is cut into two rows. The upper strip continues
// its source-distance dash phase across the cut. The lower strip uses rendered length, so the
// dash pattern restarts on the second piece. Near 60 degrees the projection stretches longitude
// about twice, so source-distance dashes are also longer on screen than rendered-length dashes.
// The view centre is at 45 degrees, where the 'meters' scale is measured, and the segments are
// 5 degrees long, so a dash that ignores the source segment length drifts visibly in each one.

import {describe} from 'vitest';
import {_CustomProjectionView as CustomProjectionView} from '@deck.gl/core';
import {PathLayer} from '@deck.gl/layers';
import {PathStyleExtension} from '@deck.gl/extensions';
import type {PathStyleExtensionProps} from '@deck.gl/extensions';
import type {TestCase} from '../deck-test-utils';
import {runRenderTestSuite} from '../render-test-suite';

type Point = [longitude: number, latitude: number];

const PROJECTION = '+proj=eqc +lon_0=0 +R=6378137 +units=m';

const EARTH_RADIUS = 6371008.8;
const RADIANS_PER_DEGREE = Math.PI / 180;

function sphericalDistance([lngA, latA]: Point, [lngB, latB]: Point): number {
  const haversine =
    Math.sin(((latB - latA) * RADIANS_PER_DEGREE) / 2) ** 2 +
    Math.cos(latA * RADIANS_PER_DEGREE) *
      Math.cos(latB * RADIANS_PER_DEGREE) *
      Math.sin(((lngB - lngA) * RADIANS_PER_DEGREE) / 2) ** 2;
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(haversine));
}

function createCutPath(latitude: number) {
  let distance = 0;
  return [150, -180].map(startLongitude => {
    const path = Array.from({length: 7}, (_, i): Point => [startLongitude + i * 5, latitude]);
    const sourceDistances = Float64Array.from(path, (point, i) => {
      if (i > 0) {
        distance += sphericalDistance(path[i - 1], point);
      }
      return distance;
    });
    return {path, sourceDistances};
  });
}

type PathRow = ReturnType<typeof createCutPath>[number];

function createStrip(id: string, latitude: number, sourceDistance: boolean) {
  return new PathLayer<PathRow, PathStyleExtensionProps<PathRow>>({
    id,
    data: createCutPath(latitude),
    coordinateSystem: 'EPSG:4326',
    getPath: row => row.path,
    ...(sourceDistance && {_getDashSourceDistances: (row: PathRow) => row.sourceDistances}),
    widthUnits: 'pixels',
    getWidth: 22,
    getColor: [30, 80, 150],
    getDashArray: [300000, 300000],
    dashUnits: 'meters',
    extensions: [new PathStyleExtension({dashMode: 'path', _dashSourceDistance: sourceDistance})]
  });
}

const testCase: TestCase = {
  // Golden: right view, the top strip starts in a gap; the bottom strip starts with a dash.
  name: 'path-dash-source-distance',
  // The projection cuts at 180 degrees, so the pieces render at opposite map edges. The left view
  // shows the piece east of the cut (150 to 180 E), the right view the piece west of it.
  views: [
    new CustomProjectionView({id: 'before-cut', crs: PROJECTION, x: 0, width: '50%'}),
    new CustomProjectionView({id: 'after-cut', crs: PROJECTION, x: '50%', width: '50%'})
  ],
  viewState: {
    'before-cut': {center: [165, 45, 0], zoom: 2.75},
    'after-cut': {center: [-165, 45, 0], zoom: 2.75}
  },
  layers: [createStrip('source-distance', 62, true), createStrip('rendered-length', 55, false)],
  goldenImage: './test/render/golden-images/path-dash-source-distance.png',
  imageDiffOptions: {threshold: 0.9995, includeAA: true}
};

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite([testCase], deviceType);
});
