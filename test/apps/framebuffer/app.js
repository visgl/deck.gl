import {Deck} from '@deck.gl/core';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';

import sfZipcodes from '../../../examples/layer-browser/data/sf.zip.geo.json';

let framebuffer;
let texture;

const deck = new Deck({
  onDeviceInitialized: onInitialize,
  onLoad,
  initialViewState: {
    longitude: -122.45,
    latitude: 37.76,
    zoom: 11,
    bearing: 0,
    pitch: 30
  },
  controller: true
});

function noop() {}

function onInitialize(device) {
  texture = device.createTexture({
    format: 'rgba8unorm',
    mipmaps: false,
    sampler: {
      minFilter: 'linear',
      magFilter: 'linear'
    }
  });

  framebuffer = device.createFramebuffer({
    colorAttachments: [texture],
    depthStencilAttachment: 'depth16unorm'
  });
}

function onLoad() {
  framebuffer.resize({width: deck.width, height: deck.height});

  deck.setProps({
    layers: [
      new GeoJsonLayer({
        data: sfZipcodes,
        opacity: 0.5,
        extruded: true,
        getFillColor: [255, 0, 0],
        getElevation: d => Math.random() * 3000
      })
    ],
    _framebuffer: framebuffer,
    onAfterRender
  });
}

function onAfterRender() {
  deck.setProps({
    layers: [
      new BitmapLayer({
        bounds: [-122.519, 37.7045, -122.355, 37.829],
        image: texture
      })
    ],
    _framebuffer: null,
    onAfterRender: noop
  });
}

/* global document */
document.body.style.margin = '0px';
