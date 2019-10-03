import {Deck} from '@deck.gl/core';
import {BitmapLayer, GeoJsonLayer} from '@deck.gl/layers';
import {Framebuffer, Texture2D} from '@luma.gl/core';
import GL from '@luma.gl/constants';

import sfZipcodes from '../../../examples/layer-browser/data/sf.zip.geo.json';

let framebuffer;

const deck = new Deck({
  onWebGLInitialized: onInitialize,
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

function onInitialize(gl) {
  framebuffer = new Framebuffer(gl);
  framebuffer.attach({
    [GL.COLOR_ATTACHMENT0]: new Texture2D(gl, {
      mipmaps: false,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    })
  });
}

function onLoad() {
  framebuffer.resize();

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
  const texture = framebuffer.color;
  framebuffer.attach({
    [GL.COLOR_ATTACHMENT0]: null
  });

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
