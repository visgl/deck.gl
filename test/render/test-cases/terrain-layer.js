// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {GeoJsonLayer, IconLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import {points, choropleths, iconAtlas as iconMapping} from 'deck.gl-test/data';

const ELEVATION_DATA = '/test/data/terrain-tiles/{z}/{x}/{y}.png';
const TEXTURE = '/test/data/raster-tiles/{z}/{x}/{y}.png';
// https://www.mapzen.com/blog/terrain-tile-service/
// Exageration added for testing purpose
const DECODER = {
  rScaler: 256 * 4,
  gScaler: 1 * 4,
  bScaler: (1 / 256) * 4,
  offset: -32768 * 4
};

function waitForSettledFrames(frameCount = 2, waitMs = 0) {
  let settledFrames = 0;
  let doneScheduled = false;
  let lastTerrainModelCount = 0;

  return ({deck, layers, done}) => {
    const terrainModelCount = layers.reduce((count, layer) => {
      if (layer.id.includes('terrain') && typeof layer.getModels === 'function') {
        return count + layer.getModels().length;
      }
      return count;
    }, 0);

    if (terrainModelCount > 0 && terrainModelCount === lastTerrainModelCount) {
      settledFrames++;
      if (settledFrames >= frameCount && !doneScheduled) {
        doneScheduled = true;
        if (waitMs > 0) {
          setTimeout(done, waitMs);
        } else {
          done();
        }
      }
    } else {
      settledFrames = 0;
      doneScheduled = false;
    }

    lastTerrainModelCount = terrainModelCount;
  };
}

export default [
  {
    name: 'terrain-layer',
    viewState: {
      longitude: -122.45,
      latitude: 37.75,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new TerrainLayer({
        elevationData: ELEVATION_DATA,
        texture: TEXTURE,
        elevationDecoder: DECODER
      })
    ],
    onAfterRender: waitForSettledFrames(2, 250),
    goldenImage: './test/render/golden-images/terrain-layer.png'
  },
  {
    name: 'terrain-extension-drape',
    viewState: {
      longitude: -122.45,
      latitude: 37.75,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new TerrainLayer({
        elevationData: ELEVATION_DATA,
        texture: TEXTURE,
        elevationDecoder: DECODER,
        operation: 'draw+terrain'
      }),
      new GeoJsonLayer({
        data: choropleths,
        getLineWidth: 50,
        getFillColor: (_, {index}) => [(index % 3) * 80, (index % 2) * 128, 128, 200],
        extensions: [new TerrainExtension()]
      })
    ],
    onAfterRender: waitForSettledFrames(2, 250),
    goldenImage: './test/render/golden-images/terrain-extension-drape.png'
  },
  {
    name: 'terrain-extension-offset',
    viewState: {
      longitude: -122.45,
      latitude: 37.75,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new TerrainLayer({
        elevationData: ELEVATION_DATA,
        texture: TEXTURE,
        elevationDecoder: DECODER,
        operation: 'terrain'
      }),
      new GeoJsonLayer({
        data: choropleths,
        getLineWidth: 50,
        getFillColor: (_, {index}) => [(index % 3) * 60 + 60, (index % 2) * 64 + 128, 200],
        extensions: [new TerrainExtension()]
      }),
      new IconLayer({
        data: points,
        iconAtlas: '/test/data/icon-atlas.png',
        iconMapping,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getIcon: d => 'marker-warning',
        getSize: d => (d.PLACEMENT === 'SW' ? 0 : 2),
        extensions: [new TerrainExtension()]
      })
    ],
    onAfterRender: waitForSettledFrames(3, 1000),
    goldenImage: './test/render/golden-images/terrain-extension-offset.png'
  }
];
