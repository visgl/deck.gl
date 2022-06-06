import OrthographicView from '../../views/orthographic-view';
import WebMercatorViewport from '../../viewports/web-mercator-viewport';
import {fitBounds} from '@math.gl/web-mercator';

import type Layer from '../../lib/layer';
import type Viewport from '../../viewports/viewport';

export type MaskBounds = [number, number, number, number];

/*
 * Compute the bounds of the mask in world space, such that it covers an
 * area currently visible (extended by a buffer) or the area of the masking
 * data, whichever is smaller
 */
export function getMaskBounds({
  layers,
  viewport
}: {
  layers: Layer[];
  viewport: Viewport;
}): MaskBounds {
  // Join the bounds of layer data
  let bounds: MaskBounds | null = null;
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

  // Expand viewport bounds by 2X. Heurestically chosen to avoid masking
  // errors when mask is partially out of view
  const paddedBounds = _doubleBounds(viewportBounds);

  // When bounds of the mask are smaller than the viewport bounds simply use
  // mask bounds, so as to maximize resolution & avoid mask rerenders
  if (
    bounds[2] - bounds[0] < paddedBounds[2] - paddedBounds[0] ||
    bounds[3] - bounds[1] < paddedBounds[3] - paddedBounds[1]
  ) {
    return bounds;
  }

  // As viewport shrinks, to avoid pixelation along mask edges
  // we need to reduce the bounds and only render the visible portion
  // of the mask.
  // We pad the viewport bounds to capture the section
  // of the mask just outside the viewport to correctly maskByInstance.
  // Intersect mask & padded viewport bounds
  bounds[0] = Math.max(bounds[0], paddedBounds[0]);
  bounds[1] = Math.max(bounds[1], paddedBounds[1]);
  bounds[2] = Math.min(bounds[2], paddedBounds[2]);
  bounds[3] = Math.min(bounds[3], paddedBounds[3]);
  return bounds;
}

/*
 * Compute viewport to render the mask into, covering the given bounds
 */
export function getMaskViewport({
  bounds,
  viewport,
  width,
  height
}: {
  bounds: MaskBounds;
  viewport: Viewport;
  width: number;
  height: number;
}): Viewport | null {
  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
    return null;
  }

  // Single pixel border to prevent mask bleeding at edge of texture
  const padding = 1;
  width -= padding * 2;
  height -= padding * 2;

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
    return new WebMercatorViewport({
      longitude,
      latitude,
      zoom,
      x: padding,
      y: padding,
      width,
      height
    });
  }

  const center = [(bounds[0] + bounds[2]) / 2, (bounds[1] + bounds[3]) / 2, 0];
  const scale = Math.min(20, width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]));

  return new OrthographicView({
    x: padding,
    y: padding
  }).makeViewport({
    width,
    height,
    viewState: {
      target: center,
      zoom: Math.log2(scale)
    }
  });
}

function _doubleBounds(bounds: MaskBounds): MaskBounds {
  const size = {
    x: bounds[2] - bounds[0],
    y: bounds[3] - bounds[1]
  };
  const center = {
    x: bounds[0] + 0.5 * size.x,
    y: bounds[1] + 0.5 * size.y
  };
  return [center.x - size.x, center.y - size.y, center.x + size.x, center.y + size.y];
}
