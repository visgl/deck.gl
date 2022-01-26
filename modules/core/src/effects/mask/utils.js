import OrthographicView from '../../views/orthographic-view';
import WebMercatorViewport from '../../viewports/web-mercator-viewport';
import {fitBounds} from '@math.gl/web-mercator';
/*
 * Compute the bounds of the mask in world space, such that it covers an
 * area currently visible (extended by a buffer) or the area of the masking
 * data, whichever is smaller
 */
export function getMaskBounds({layers, viewport}) {
  // Join the bounds of layer data
  let bounds = null;
  for (const layer of layers) {
    const subLayerBounds = layer.getBounds();
    if (subLayerBounds) {
      if (bounds) {
        bounds[0] = Math.min(bounds[0], subLayerBounds[0][0]);
        bounds[1] = Math.min(bounds[1], subLayerBounds[0][1]);
        bounds[2] = Math.max(bounds[2], subLayerBounds[1][0]);
        bounds[3] = Math.max(bounds[3], subLayerBounds[1][1]);
      } else {
        bounds = [
          subLayerBounds[0][0],
          subLayerBounds[0][1],
          subLayerBounds[1][0],
          subLayerBounds[1][1]
        ];
      }
    }
  }
  const viewportBounds = viewport.getBounds();
  if (!bounds) {
    return viewportBounds;
  }
  // Intersect the two
  bounds[0] = Math.max(bounds[0], viewportBounds[0]);
  bounds[1] = Math.max(bounds[1], viewportBounds[1]);
  bounds[2] = Math.min(bounds[2], viewportBounds[2]);
  bounds[3] = Math.min(bounds[3], viewportBounds[3]);
  return bounds;
}

/*
 * Compute viewport to render the mask into, such that it covers an
 * area currently visible (extended by a buffer) or the area of the masking
 * data, whichever is smaller
 */
export function getMaskViewport({bounds, viewport, width, height}) {
  if (viewport instanceof WebMercatorViewport) {
    const {longitude, latitude, zoom} = fitBounds({
      width,
      height,
      bounds: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      maxZoom: 20
    });
    return new WebMercatorViewport({longitude, latitude, zoom, width, height});
  }

  const center = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, 0];
  const scale = Math.min(20, width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]));

  return new OrthographicView().makeViewport({
    width,
    height,
    viewState: {
      target: center,
      zoom: Math.log2(scale)
    }
  });
}
