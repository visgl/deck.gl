// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {MVTLoader} from '@loaders.gl/mvt';
import {webgpuAdapter} from '@luma.gl/webgpu';

const statusEl = document.getElementById('status');

const INITIAL_VIEW_STATE = {
  longitude: -74.006,
  latitude: 40.7128,
  zoom: 13,
  pitch: 0,
  bearing: 0
};

// Local fixture tiles copied from test/data/mvt-tiles/13, the same tiles used by
// test/render/test-cases/mvt-layer.spec.ts, so this app has no external network dependency.
function makeLayer(id, binary) {
  return new MVTLayer({
    id,
    data: ['./tiles/{z}/{x}/{y}.mvt'],
    minZoom: 13,
    maxZoom: 13,
    binary,
    stroked: true,
    getFillColor: [0, 0, 0, 128],
    getLineColor: [255, 0, 0, 128],
    lineWidthMinPixels: 1,
    loaders: [MVTLoader],
    loadOptions: {
      core: {
        // Avoid loading the MVT decoder worker from a CDN, so this app has no network dependency.
        worker: false
      }
    }
  });
}

// Render the same tiles through both the `binary: false` (GeoJSON) and `binary: true`
// decoding paths on the same WebGPU device, to exercise both MVTLayer code paths.
const deck = new Deck({
  deviceProps: {
    type: 'webgpu',
    adapters: [webgpuAdapter]
  },
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  layers: [makeLayer('mvt-geojson', false), makeLayer('mvt-binary', true)],
  onLoad: () => {
    statusEl.innerText = `device: ${deck.device.type}`;
  },
  onError: error => {
    statusEl.innerText = `error: ${error.message}`;
    console.error(error);
  }
});

window.deck = deck;
