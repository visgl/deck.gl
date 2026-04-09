// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';
import {OS} from '../constants';

const getYear = d => d.YR_INSTALLED || 1997;
const textCollisionData = [
  {position: [-122.4269, 37.7515], text: 'Alpha', priority: 3},
  {position: [-122.4269, 37.7515], text: 'Bravo', priority: 2},
  {position: [-122.4269, 37.7515], text: 'Charlie', priority: 1}
];

const scatterplotCases = [
  {
    name: 'simple',
    props: {}
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
].map(({name, props}) => ({
  name: `collision-filter-effect-${name}`,
  viewState: {
    latitude: 37.751537058389985,
    longitude: -122.42694203247012,
    zoom: 11.5,
    pitch: 0,
    bearing: 0
  },
  layers: [
    new ScatterplotLayer({
      id: name,
      data: points,
      extensions: [new CollisionFilterExtension()],
      getPosition: d => d.COORDINATES,
      getRadius: 10,
      getFillColor: d => {
        const value = (255 * (2014 - getYear(d))) / 21; // range 1997-2014
        return [value, 0, 255 - value];
      },
      radiusUnits: 'pixels',
      ...props
    })
  ],
  imageDiffOptions: {
    threshold: 0.985
  },
  goldenImage: `./test/render/golden-images/collision-filter-effect-${name}.png`
}));

const textCases =
  OS === 'Mac'
    ? [
        {
          name: 'collision-filter-effect-text-pixel-offset',
          viewState: {
            latitude: 37.751537058389985,
            longitude: -122.42694203247012,
            zoom: 13,
            pitch: 0,
            bearing: 0
          },
          layers: [
            new TextLayer({
              id: 'text-pixel-offset',
              data: textCollisionData,
              background: true,
              backgroundPadding: [8, 4],
              fontFamily: 'Arial',
              getText: d => d.text,
              getPosition: d => d.position,
              getSize: 20,
              getColor: [0, 0, 0],
              getBackgroundColor: [255, 255, 200, 255],
              getBorderColor: [220, 90, 0, 255],
              getBorderWidth: 1,
              getPixelOffset: [80, 24],
              getCollisionPriority: d => d.priority,
              extensions: [new CollisionFilterExtension()]
            })
          ],
          imageDiffOptions: {
            threshold: 0.96
          },
          goldenImage: './test/render/golden-images/collision-filter-effect-text-pixel-offset.png'
        },
        {
          name: 'collision-filter-effect-text-anchor-baseline',
          viewState: {
            latitude: 37.751537058389985,
            longitude: -122.42694203247012,
            zoom: 13,
            pitch: 0,
            bearing: 0
          },
          layers: [
            new TextLayer({
              id: 'text-anchor-baseline',
              data: textCollisionData,
              background: true,
              backgroundPadding: [8, 4],
              fontFamily: 'Arial',
              getText: d => d.text,
              getPosition: d => d.position,
              getSize: 20,
              getColor: [0, 0, 0],
              getBackgroundColor: [255, 255, 200, 255],
              getBorderColor: [220, 90, 0, 255],
              getBorderWidth: 1,
              getTextAnchor: 'start',
              getAlignmentBaseline: 'top',
              getCollisionPriority: d => d.priority,
              extensions: [new CollisionFilterExtension()]
            })
          ],
          imageDiffOptions: {
            threshold: 0.96
          },
          goldenImage:
            './test/render/golden-images/collision-filter-effect-text-anchor-baseline.png'
        }
      ]
    : [];

export default [...scatterplotCases, ...textCases];
