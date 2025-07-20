// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ScatterplotLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, MaskExtension} from '@deck.gl/extensions';
import {points} from 'deck.gl-test/data';

const getYear = d => d.YR_INSTALLED || 1997;

export default [
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
