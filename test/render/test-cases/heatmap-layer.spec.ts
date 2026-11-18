// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import {defaultOnAfterRender, type TestCase} from '../deck-test-utils';

import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import {PolygonLayer} from '@deck.gl/layers';
import {DataFilterExtension, MaskExtension} from '@deck.gl/extensions';

import {points} from 'deck.gl-test/data';

/** Position of the high-weight point removed by the mask. */
const outlier = [-122.44, 37.75];
/** Mask polygon with a hole centered on the high-weight point. */
const maskBoundary = [
  [
    [-123, 37],
    [-122, 37],
    [-122, 38],
    [-123, 38]
  ],
  [
    [-122.441, 37.749],
    [-122.441, 37.751],
    [-122.439, 37.751],
    [-122.439, 37.749]
  ]
];

const testCases = [
  {
    name: 'heatmap-lnglat',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  },
  {
    // Golden: the original heatmap, without the high-weight point beyond the mask.
    name: 'heatmap-lnglat-masked',
    viewState: {latitude: 37.75, longitude: -122.44, zoom: 11.5, pitch: 30, bearing: 0},
    layers: [
      new PolygonLayer({
        id: 'heatmap-mask',
        data: [maskBoundary.slice(0, 1)],
        getPolygon: d => d,
        operation: 'mask',
        stroked: false
      }),
      new HeatmapLayer({
        id: 'heatmap-lnglat-masked',
        data: [...points, {COORDINATES: outlier, SPACES: 1000000}],
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1,
        extensions: [new MaskExtension()],
        maskId: 'heatmap-mask',
        maskByInstance: true
      })
    ],
    onAfterRender: params =>
      defaultOnAfterRender({
        ...params,
        done: () => {
          const mask = params.layers.find(layer => layer.id === 'heatmap-mask');
          const heatmap = params.layers.find(layer => layer.id === 'heatmap-lnglat-masked');
          const topLevel = params.layers.filter(layer => !layer.parent);
          if (mask.props.data[0].length === 1) {
            params.deck.setProps({
              layers: topLevel.map(layer =>
                layer === mask
                  ? mask.clone({data: [maskBoundary]})
                  : layer === heatmap
                    ? heatmap.clone({maskInverted: true})
                    : layer
              )
            });
          } else if (heatmap.props.maskInverted) {
            params.deck.setProps({
              layers: topLevel.map(layer =>
                layer === heatmap ? heatmap.clone({maskInverted: false}) : layer
              )
            });
          } else {
            params.done();
          }
        }
      }),
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  },
  {
    name: 'heatmap-lnglat-mask-display',
    viewState: {latitude: 37.75, longitude: -122.44, zoom: 11.5, pitch: 0, bearing: 0},
    layers: [
      new PolygonLayer({
        id: 'heatmap-display-mask',
        data: [
          [
            maskBoundary[0],
            [
              [-122.46, 37.73],
              [-122.46, 37.77],
              [-122.42, 37.77],
              [-122.42, 37.73]
            ]
          ]
        ],
        getPolygon: d => d,
        operation: 'mask',
        stroked: false
      }),
      new HeatmapLayer({
        id: 'heatmap-display',
        data: [outlier],
        getPosition: d => d,
        radiusPixels: 35,
        colorDomain: [1, 2],
        extensions: [new MaskExtension()],
        maskId: 'heatmap-display-mask',
        maskByInstance: false
      })
    ],
    onAfterRender: ({layers, done}) => {
      const display = layers.find(layer => layer.id === 'heatmap-display-triangle-layer');
      const {colorDomain} = display.getModels()[0].shaderInputs.getUniformValues().triangle;
      expect(colorDomain[0]).toBeGreaterThan(0);
      expect(colorDomain[1]).toBeCloseTo(colorDomain[0] * 2);
      done();
    },
    imageDiffOptions: {threshold: 1},
    goldenImage: './test/render/golden-images/heatmap-mask-display-empty.png'
  },
  {
    // Golden: the baseline heatmap with the added high-weight point filtered out.
    name: 'heatmap-lnglat-filtered',
    viewState: {latitude: 37.75, longitude: -122.44, zoom: 11.5, pitch: 30, bearing: 0},
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-filtered',
        data: [...points, {...points[0], SPACES: 1000000}],
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1,
        extensions: [new DataFilterExtension()],
        getFilterValue: (_, {index}) => Number(index === points.length),
        filterRange: [0, 0]
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  },
  {
    name: 'heatmap-lnglat-mean',
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat',
        data: points,
        opacity: 0.8,
        aggregation: 'MEAN',
        getPosition: d => d.COORDINATES,
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.05
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-mean.png'
  },
  {
    name: 'heatmap-lnglat-high-zoom',
    viewState: {
      latitude: 37.76,
      longitude: -122.42,
      zoom: 14,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-2',
        data: points,
        opacity: 0.8,
        getPosition: d => d.COORDINATES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-high-zoom.png'
  },
  {
    name: 'heatmap-lnglat-high-precision',
    viewState: {
      latitude: 37.76,
      longitude: -122.42,
      zoom: 22,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-high-precision',
        data: points,
        getPosition: d => [
          (d.COORDINATES[0] + 122.42) / 1000 - 122.42,
          (d.COORDINATES[1] - 37.76) / 1000 + 37.76
        ],
        radiusPixels: 35
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat-high-precision.png'
  },
  {
    name: 'heatmap-lnglat-offset',
    // TODO: Re-enable when WebGPU produces consistent results for equivalent
    // LNGLAT and LNGLAT_OFFSETS positions.
    skip: ['webgpu'],
    viewState: {
      latitude: 37.75,
      longitude: -122.44,
      zoom: 11.5,
      pitch: 30,
      bearing: 0
    },
    layers: [
      new HeatmapLayer({
        id: 'heatmap-lnglat-offset',
        data: points,
        opacity: 0.8,
        coordinateSystem: 'lnglat-offsets',
        coordinateOrigin: [-122.42, 37.76],
        getPosition: d => [d.COORDINATES[0] + 122.42, d.COORDINATES[1] - 37.76],
        getWeight: d => d.SPACES,
        radiusPixels: 35,
        threshold: 0.1
      })
    ],
    goldenImage: './test/render/golden-images/heatmap-lnglat.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
