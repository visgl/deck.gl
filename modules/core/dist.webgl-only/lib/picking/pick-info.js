// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
/** Generates some basic information of the picking action: x, y, coordinates etc.
 * Regardless if anything is picked
 */
export function getEmptyPickingInfo({ pickInfo, viewports, pixelRatio, x, y, z }) {
    // If more than one viewports are used in the picking pass, locate the viewport that
    // drew the picked pixel
    let pickedViewport = viewports[0];
    if (viewports.length > 1) {
        // Find the viewport that contain the picked pixel
        pickedViewport = getViewportFromCoordinates(pickInfo?.pickedViewports || viewports, { x, y });
    }
    let coordinate;
    if (pickedViewport) {
        const point = [x - pickedViewport.x, y - pickedViewport.y];
        if (z !== undefined) {
            point[2] = z;
        }
        coordinate = pickedViewport.unproject(point);
    }
    return {
        color: null,
        layer: null,
        viewport: pickedViewport,
        index: -1,
        picked: false,
        x,
        y,
        pixel: [x, y],
        coordinate,
        devicePixel: pickInfo && 'pickedX' in pickInfo
            ? [pickInfo.pickedX, pickInfo.pickedY]
            : undefined,
        pixelRatio
    };
}
/* eslint-disable max-depth */
/** Generates the picking info of a picking operation */
export function processPickInfo(opts) {
    const { pickInfo, lastPickedInfo, mode, layers } = opts;
    const { pickedColor, pickedLayer, pickedObjectIndex } = pickInfo;
    const affectedLayers = pickedLayer ? [pickedLayer] : [];
    if (mode === 'hover') {
        // only invoke onHover events if picked object has changed
        const lastPickedPixelIndex = lastPickedInfo.index;
        const lastPickedLayerId = lastPickedInfo.layerId;
        const pickedLayerId = pickedLayer ? pickedLayer.props.id : null;
        // proceed only if picked object changed
        if (pickedLayerId !== lastPickedLayerId || pickedObjectIndex !== lastPickedPixelIndex) {
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
        let info = { ...baseInfo };
        if (layer === pickedLayer) {
            info.color = pickedColor;
            info.index = pickedObjectIndex;
            info.picked = true;
        }
        info = getLayerPickingInfo({ layer, info, mode });
        const rootLayer = info.layer;
        if (layer === pickedLayer && mode === 'hover') {
            lastPickedInfo.info = info;
        }
        // This guarantees that there will be only one copy of info for
        // one composite layer
        infos.set(rootLayer.id, info);
        if (mode === 'hover') {
            rootLayer.updateAutoHighlight(info);
        }
    });
    return infos;
}
/** Walk up the layer composite chain to populate the info object */
export function getLayerPickingInfo({ layer, info, mode }) {
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
        info = layer.getPickingInfo({ info, mode, sourceLayer });
        layer = layer.parent;
    }
    return info;
}
/** Indentifies which viewport, if any corresponds to x and y
   If multiple viewports contain the target pixel, last viewport drawn is returend
   Returns first viewport if no match */
function getViewportFromCoordinates(viewports, pixel) {
    // find the last viewport that contains the pixel
    for (let i = viewports.length - 1; i >= 0; i--) {
        const viewport = viewports[i];
        if (viewport.containsPixel(pixel)) {
            return viewport;
        }
    }
    return viewports[0];
}
//# sourceMappingURL=pick-info.js.map