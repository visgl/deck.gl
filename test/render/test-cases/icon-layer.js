// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable callback-return */
import {IconLayer} from '@deck.gl/layers';
import {points, iconAtlas as iconMapping} from 'deck.gl-test/data';

const ICON_ATLAS = './test/data/icon-atlas.png';

export default [
  {
    name: 'icon-lnglat',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    layers: [
      new IconLayer({
        id: 'icon-lnglat',
        data: points,
        iconAtlas: ICON_ATLAS,
        iconMapping,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'icon-lnglat-rectangle',
    viewState: {
      longitude: -122.4269,
      latitude: 37.75,
      zoom: 15.6,
      pitch: 0,
      bearing: 0,
      padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      }
    },
    layers: [
      new IconLayer({
        id: 'icon-lnglat-multi',
        data: [
          {position: [-122.4269, 37.7515], icon: 'tall'},
          {position: [-122.4269, 37.7505], icon: 'wide'},
          {position: [-122.4269, 37.7495], icon: 'square'},
          {position: [-122.4269, 37.7485], icon: 'short'}
        ],
        iconAtlas: './test/data/icons.png',
        iconMapping: {
          tall: {x: 0, y: 0, width: 40, height: 80, mask: true, anchorY: 40},
          wide: {x: 40, y: 0, width: 80, height: 40, mask: true, anchorY: 20},
          square: {x: 120, y: 0, width: 60, height: 60, mask: true, anchorY: 30},
          short: {x: 180, y: 0, width: 60, height: 20, mask: true, anchorY: 10}
        },
        sizeUnits: 'pixels',
        sizeScale: 1,
        sizeBasis: 'width',
        getPosition: d => d.position,
        getIcon: d => d.icon,
        getSize: 40, // target width in px
        opacity: 0.8
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat-rectangle.png'
  },
  {
    name: 'icon-lnglat-external-buffer',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    layers: [
      new IconLayer({
        id: 'icon-lnglat',
        data: {
          length: points.length,
          attributes: {
            getPosition: {
              value: new Float32Array(points.flatMap(d => d.COORDINATES)),
              size: 2
            },
            getSize: new Float32Array(points.flatMap(d => (d.RACKS > 2 ? 2 : 1))),
            getIcon: {
              value: new Uint8Array(points.flatMap(d => (d.PLACEMENT === 'SW' ? 1 : 2))),
              size: 1
            }
          }
        },
        iconAtlas: ICON_ATLAS,
        iconMapping: {1: iconMapping.marker, 2: iconMapping['marker-warning']},
        sizeScale: 12,
        getColor: [64, 64, 72],
        opacity: 0.8
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  },
  {
    name: 'icon-lnglat-facing-up',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new IconLayer({
        id: 'icon-lnglat',
        data: points,
        iconAtlas: ICON_ATLAS,
        billboard: false,
        iconMapping,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat-facing-up.png'
  },
  {
    name: 'icon-lnglat-auto',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new IconLayer({
        id: 'icon-lnglat-auto',
        data: points,
        updateTriggers: {
          getIcon: 1
        },
        sizeScale: 16,
        opacity: 0.8,
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => {
          if (d.PLACEMENT === 'SW') {
            return Object.assign({}, iconMapping.marker, {
              url: './test/data/icon-marker.png'
            });
          }
          return Object.assign({}, iconMapping['marker-warning'], {
            url: './test/data/icon-warning.png'
          });
        }
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat-large.png'
  },
  // This is based on last test case
  // use the same layer id 'icon-lnglat-auto' as last test case to trigger the layer update and test texture resize logic
  {
    name: 'icon-lnglat-auto-2',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    layers: [
      new IconLayer({
        id: 'icon-lnglat-auto',
        data: points,
        updateTriggers: {
          getIcon: 2
        },
        sizeScale: 16,
        opacity: 0.8,
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => {
          if (d.PLACEMENT === 'SW') {
            return Object.assign({}, iconMapping.marker, {
              url: './test/data/icon-marker.png',
              id: 'marker-large',
              width: 256,
              height: 256
            });
          }
          return Object.assign({}, iconMapping['marker-warning'], {
            id: 'warning-large',
            url: './test/data/icon-warning.png',
            width: 1024,
            height: 1024
          });
        }
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat-resize-texture.png'
  },
  {
    name: 'icon-meters',
    viewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      pitch: 0,
      bearing: 0
    },
    // rendering times
    renderingTimes: 2,
    layers: [
      new IconLayer({
        id: 'icon-meters',
        data: points,
        iconAtlas: ICON_ATLAS,
        iconMapping,
        sizeScale: 256,
        sizeUnits: 'meters',
        getPosition: d => d.COORDINATES,
        getColor: d => [64, 64, 72],
        getIcon: d => (d.PLACEMENT === 'SW' ? 'marker' : 'marker-warning'),
        getSize: d => (d.RACKS > 2 ? 2 : 1),
        opacity: 0.8
      })
    ],
    goldenImage: './test/render/golden-images/icon-lnglat.png'
  }
];
