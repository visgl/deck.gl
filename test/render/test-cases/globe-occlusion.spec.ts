// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {_GlobeView as GlobeView} from '@deck.gl/core';
import {IconLayer, ScatterplotLayer, SolidPolygonLayer, TextLayer} from '@deck.gl/layers';
import {iconAtlas as iconMapping} from 'deck.gl-test/data';
import fontMapping from '../../data/font-atlas.json';

/**
 * Camera-facing geometry on GlobeView. Back-face culling cannot tell the near side of the globe
 * from the far side for billboards, so IconLayer, TextLayer and billboard ScatterplotLayer hide
 * objects whose anchor is behind the globe with `project_globe_is_occluded`, and shift their depth
 * toward the camera with `project_globe_billboard_clipspace` so the curve of the globe does not
 * clip a visible sprite. Non-billboard marks lie on the surface and are handled by culling.
 *
 * Every case looks at the globe from above lng 0, lat 10 at zoom 0.9. Blue objects are on the near
 * side and must be visible; red objects are on the far side and must be hidden.
 *
 * - `globe-occlusion-icons`: markers every 30° of longitude at four latitudes. Expected: 20 blue
 *   markers, no red ones.
 * - `globe-occlusion-icons-surface`: the same markers over an opaque SolidPolygonLayer earth.
 *   Expected: the same 20 blue markers, drawn whole, including the ones on the limb.
 * - `globe-occlusion-icons-altitude`: markers along the horizon at sea level (blue) and 600 km up
 *   (orange). Expected: the orange column reaches further down than the blue one, because a
 *   raised anchor is visible past the horizon of the ground below it.
 * - `globe-occlusion-text`: labels at the same grid. Expected: near-side labels with their
 *   backgrounds, no far-side labels.
 * - `globe-occlusion-text-content-box`: the same labels with a fixed-height content box, which
 *   routes the background through its clip-rect path. Expected: near-side labels in tall boxes,
 *   no far-side labels.
 * - `globe-occlusion-points-billboard`: billboard ScatterplotLayer at the same grid. Expected:
 *   20 blue dots, no red ones.
 * - `globe-occlusion-marks-surface`: non-billboard ScatterplotLayer and IconLayer at the grid and
 *   along the horizon. Expected: near-side marks foreshortened on the surface, whole up to the
 *   limb, no far-side marks and no marks torn across the viewport.
 */

const ICON_ATLAS = '/test/data/icon-atlas.png';
const VIEW_STATE = {longitude: 0, latitude: 10, zoom: 0.9, pitch: 0, bearing: 0};

type Marker = {position: number[]; farSide: boolean; label: string};

const GRID: Marker[] = [];
for (let lng = -180; lng < 180; lng += 30) {
  for (const lat of [-45, -15, 15, 45]) {
    GRID.push({position: [lng, lat, 0], farSide: Math.abs(lng) > 90, label: `${lng},${lat}`});
  }
}

/** Two meridians straddling the horizon (lng 80 is just visible, lng 100 is just behind it) */
const HORIZON: {position: number[]}[] = [];
for (let lat = -60; lat <= 60; lat += 15) {
  for (const lng of [80, 100]) {
    HORIZON.push({position: [lng, lat, 0]}, {position: [lng, lat, 600000]});
  }
}

const EARTH = [
  [-180, -89.9],
  [-60, -89.9],
  [60, -89.9],
  [180, -89.9],
  [180, 89.9],
  [60, 89.9],
  [-60, 89.9],
  [-180, 89.9]
];

const NEAR_COLOR = [30, 90, 200];
const FAR_COLOR = [220, 40, 40];
const getSideColor = (d: Marker) => (d.farSide ? FAR_COLOR : NEAR_COLOR);

function createIconLayer(
  id: string,
  data: {position: number[]}[],
  getColor: any,
  billboard: boolean = true
): IconLayer {
  return new IconLayer({
    id,
    data,
    iconAtlas: ICON_ATLAS,
    iconMapping,
    sizeScale: 12,
    billboard,
    getPosition: d => d.position,
    getColor,
    getIcon: () => 'marker',
    getSize: 2
  });
}

function createTextLayer(id: string, props: Partial<TextLayer<Marker>['props']> = {}): TextLayer {
  return new TextLayer<Marker>({
    id,
    data: GRID,
    _getFontRenderer: () => fontRenderer,
    fontFamily: 'Arial',
    getPosition: d => d.position,
    getText: d => d.label,
    getColor: getSideColor,
    getSize: 14,
    background: true,
    getBackgroundColor: [225, 225, 225],
    backgroundPadding: [2, 1],
    ...props
  });
}

/** Text rendering is platform dependent; the prepacked atlas keeps dev boxes and CI in step */
let fontRenderer: any = null;
async function loadPrepackedFontAtlas(): Promise<void> {
  const image = new Image();
  await new Promise((resolve, reject) => {
    image.onload = resolve;
    image.onerror = reject;
    image.src = '/test/data/font-atlas.png';
  });
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  ctx.drawImage(image, 0, 0);
  fontRenderer = {
    measure: (char: string) => {
      const frame = fontMapping[char] ?? fontMapping[''];
      return {
        advance: frame.advance,
        width: frame.width,
        ascent: frame.anchorY,
        descent: frame.height - frame.anchorY
      };
    },
    draw: (char: string) => {
      const frame = fontMapping[char] ?? fontMapping[''];
      return {data: ctx.getImageData(frame.x, frame.y, frame.width, frame.height)};
    }
  };
}

const testCases: TestCase[] = [
  {
    name: 'globe-occlusion-icons',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [createIconLayer('icons', GRID, getSideColor)],
    goldenImage: './test/render/golden-images/globe-occlusion-icons.png'
  },
  {
    name: 'globe-occlusion-icons-surface',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [
      new SolidPolygonLayer({
        id: 'earth',
        data: [EARTH],
        getPolygon: d => d,
        getFillColor: [225, 225, 225]
      }),
      createIconLayer('icons', GRID, getSideColor)
    ],
    goldenImage: './test/render/golden-images/globe-occlusion-icons-surface.png'
  },
  {
    name: 'globe-occlusion-icons-altitude',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [
      createIconLayer('icons', HORIZON, d => (d.position[2] > 0 ? [230, 140, 0] : NEAR_COLOR))
    ],
    goldenImage: './test/render/golden-images/globe-occlusion-icons-altitude.png'
  },
  {
    name: 'globe-occlusion-text',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [createTextLayer('labels')],
    goldenImage: './test/render/golden-images/globe-occlusion-text.png'
  },
  {
    name: 'globe-occlusion-text-content-box',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    // Content boxes are in meters; this one fixes the height at about 40 px at zoom 0.9 and leaves
    // the width free, so the background takes its clip-rect path while no glyph is cut
    layers: [createTextLayer('labels', {getContentBox: [0, -835000, -1, 1670000]})],
    goldenImage: './test/render/golden-images/globe-occlusion-text-content-box.png'
  },
  {
    name: 'globe-occlusion-points-billboard',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [
      new ScatterplotLayer<Marker>({
        id: 'points',
        data: GRID,
        billboard: true,
        radiusUnits: 'pixels',
        getRadius: 8,
        getPosition: d => d.position,
        getFillColor: getSideColor
      })
    ],
    goldenImage: './test/render/golden-images/globe-occlusion-points-billboard.png'
  },
  {
    name: 'globe-occlusion-marks-surface',
    views: new GlobeView(),
    viewState: VIEW_STATE,
    layers: [
      new SolidPolygonLayer({
        id: 'earth',
        data: [EARTH],
        getPolygon: d => d,
        getFillColor: [225, 225, 225]
      }),
      new ScatterplotLayer<Marker>({
        id: 'points',
        data: [
          ...GRID,
          ...HORIZON.filter(d => d.position[2] === 0).map(d => ({...d, farSide: false, label: ''}))
        ],
        billboard: false,
        radiusUnits: 'pixels',
        getRadius: 8,
        getPosition: d => d.position,
        getFillColor: getSideColor
      }),
      createIconLayer('icons', GRID, getSideColor, false)
    ],
    goldenImage: './test/render/golden-images/globe-occlusion-marks-surface.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(
    testCases.map(testCase => ({
      ...testCase,
      // The sphere is tessellated and SwiftShader's trig drifts on the globe, like other globe cases
      imageDiffOptions: {threshold: 0.985}
    })),
    deviceType,
    {beforeAll: loadPrepackedFontAtlas}
  );
});
