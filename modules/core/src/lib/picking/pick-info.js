// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// Even if nothing gets picked, we need to expose some information of the picking action:
// x, y, coordinates etc.
export function getEmptyPickingInfo({pickInfo, mode, viewports, layerFilter, pixelRatio, x, y, z}) {
  const layer = pickInfo && pickInfo.pickedLayer;
  const viewportFilter =
    layerFilter &&
    layer &&
    (v =>
      layerFilter({
        layer,
        viewport: v,
        isPicking: true,
        renderPass: `picking:${mode}`
      }));
  const viewport = getViewportFromCoordinates(viewports, {x, y}, viewportFilter);
  const coordinate = viewport && viewport.unproject([x - viewport.x, y - viewport.y], {targetZ: z});

  return {
    color: null,
    layer: null,
    viewport,
    index: -1,
    picked: false,
    x,
    y,
    pixel: [x, y],
    coordinate,
    devicePixel: pickInfo && [pickInfo.pickedX, pickInfo.pickedY],
    pixelRatio
  };
}

/* eslint-disable max-depth */
export function processPickInfo(opts) {
  const {pickInfo, lastPickedInfo, mode, layers} = opts;
  const {pickedColor, pickedLayer, pickedObjectIndex} = pickInfo;

  const affectedLayers = pickedLayer ? [pickedLayer] : [];

  if (mode === 'hover') {
    // only invoke onHover events if picked object has changed
    const lastPickedObjectIndex = lastPickedInfo.index;
    const lastPickedLayerId = lastPickedInfo.layerId;
    const pickedLayerId = pickedLayer && pickedLayer.props.id;

    // proceed only if picked object changed
    if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedObjectIndex) {
      if (pickedLayerId !== lastPickedLayerId) {
        // We cannot store a ref to lastPickedLayer in the context because
        // the state of an outdated layer is no longer valid
        // and the props may have changed
        const lastPickedLayer = layers.find(layer => layer.props.id === lastPickedLayerId);
        if (lastPickedLayer) {
          // Let leave event fire before enter event
          affectedLayers.unshift(lastPickedLayer);
        }
      }

      // Update layer manager context
      lastPickedInfo.layerId = pickedLayerId;
      lastPickedInfo.index = pickedObjectIndex;
      lastPickedInfo.info = null;
    }
  }

  const baseInfo = getEmptyPickingInfo(opts);

  // Use a Map to store all picking infos.
  // The following two forEach loops are the result of
  // https://github.com/visgl/deck.gl/issues/443
  // Please be very careful when changing this pattern
  const infos = new Map();

  // Make sure infos always contain something even if no layer is affected
  infos.set(null, baseInfo);

  affectedLayers.forEach(layer => {
    let info = {...baseInfo};

    if (layer === pickedLayer) {
      info.color = pickedColor;
      info.index = pickedObjectIndex;
      info.picked = true;
    }

    info = getLayerPickingInfo({layer, info, mode});

    if (layer === pickedLayer && mode === 'hover') {
      lastPickedInfo.info = info;
    }

    // This guarantees that there will be only one copy of info for
    // one composite layer
    infos.set(info.layer.id, info);

    if (mode === 'hover') {
      info.layer.updateAutoHighlight(info);
    }
  });

  return infos;
}

// Walk up the layer composite chain to populate the info object
export function getLayerPickingInfo({layer, info, mode}) {
  while (layer && info) {
    // For a composite layer, sourceLayer will point to the sublayer
    // where the event originates from.
    // It provides additional context for the composite layer's
    // getPickingInfo() method to populate the info object
    const sourceLayer = info.layer || null;
    info.sourceLayer = sourceLayer;
    info.layer = layer;
    // layer.pickLayer() function requires a non-null ```layer.state```
    // object to function properly. So the layer referenced here
    // must be the "current" layer, not an "out-dated" / "invalidated" layer
    info = layer.getPickingInfo({info, mode, sourceLayer});
    layer = layer.parent;
  }
  return info;
}

// Indentifies which viewport, if any corresponds to x and y
// If multiple viewports contain the target pixel, last viewport drawn is returend
// Returns first viewport if no match
function getViewportFromCoordinates(viewports, pixel, filter) {
  // find the last viewport that contains the pixel
  for (let i = viewports.length - 1; i >= 0; i--) {
    const viewport = viewports[i];
    if (viewport.containsPixel(pixel) && (!filter || filter(viewport))) {
      return viewport;
    }
  }
  return viewports[0];
}
