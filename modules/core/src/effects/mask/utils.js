import {Matrix4} from '@math.gl/core';
import {pixelsToWorld} from '@math.gl/web-mercator';
import {WebMercatorViewport} from '@deck.gl/core';

/*
 * Compute orthographic projection that converts shader common space coordinates into mask clipspace
 */
export function getMaskProjectionMatrix({width, height, pixelUnprojectionMatrix}) {
  // Unproject corners of viewport into common space (these correspond to the edges
  // of the framebuffer we are rendering into)
  const [[left, top], [right, bottom]] = [
    [0, 0],
    [width, height]
  ].map(pixel => pixelsToWorld(pixel, pixelUnprojectionMatrix));

  // Construct orthographic projection that will map common space positions into clipspace
  const near = 0.1;
  const far = 1000;
  return new Matrix4().ortho({left, top, right, bottom, near, far});
}

/*
 * Compute viewport to render the mask into, such that it covers an
 * area currently visible (extended by a buffer) or the area of the masking
 * data, whichever is smaller
 */
export function getMaskViewport(dataViewport, layerViewport, {width, height}) {
  const bounds = layerViewport.getBounds();
  let viewport = new WebMercatorViewport({width, height}).fitBounds([
    [bounds[0], bounds[1]],
    [bounds[2], bounds[3]]
  ]);
  const {longitude, latitude, zoom} = viewport;
  viewport = new WebMercatorViewport({width, height, longitude, latitude, zoom: zoom - 1});

  return dataViewport?.zoom > viewport.zoom ? dataViewport : viewport;
}

export function getDataViewport(layer, {width, height}) {
  const dataBounds = layer.getBounds();
  if (!dataBounds?.flat().every(n => isFinite(n))) {
    return null;
  }

  return new WebMercatorViewport({width, height}).fitBounds(dataBounds, {
    padding: 2
  });
}
