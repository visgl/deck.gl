import {WebMercatorViewport, OrthographicViewport} from '@deck.gl/core';
import type {Layer, Viewport} from '@deck.gl/core';

/** Bounds in CARTESIAN coordinates */
export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

/*
 * Compute the union of bounds from multiple layers
 * Returns bounds in CARTESIAN coordinates
 */
export function joinLayerBounds(
  /** The layers to combine */
  layers: Layer[],
  /** A Viewport instance that is used to determine the type of the view */
  viewport: Viewport
): Bounds | null {
  // Join the bounds of layer data
  const bounds: Bounds = [Infinity, Infinity, -Infinity, -Infinity];
  for (const layer of layers) {
    const layerBounds = layer.getBounds();
    if (layerBounds) {
      const bottomLeftCommon = layer.projectPosition(layerBounds[0], {viewport, autoOffset: false});
      const topRightCommon = layer.projectPosition(layerBounds[1], {viewport, autoOffset: false});

      bounds[0] = Math.min(bounds[0], bottomLeftCommon[0]);
      bounds[1] = Math.min(bounds[1], bottomLeftCommon[1]);
      bounds[2] = Math.max(bounds[2], topRightCommon[0]);
      bounds[3] = Math.max(bounds[3], topRightCommon[1]);
    }
  }

  if (Number.isFinite(bounds[0])) {
    return bounds;
  }
  return null;
}

const MAX_VIEWPORT_SIZE = 2048;

/** Construct a viewport that just covers the target bounds. Used for rendering to common space indexed texture. */
export function makeViewport(opts: {
  /** The cartesian bounds of layers that will render into this texture */
  bounds: Bounds;
  /** Target width. If not specified, will be deduced from zoom */
  width?: number;
  /** Target height. If not specified, will be deduced from zoom */
  height?: number;
  /** Target zoom. If not specified, will be deduced from width and height */
  zoom?: number;
  /** Border around the viewport in pixels */
  border?: number;
  /** A viewport used to determine the output type */
  viewport: Viewport;
}): Viewport | null {
  const {bounds, viewport, border = 0} = opts;
  const {isGeospatial} = viewport;

  if (bounds[2] <= bounds[0] || bounds[3] <= bounds[1]) {
    return null;
  }

  const centerWorld = viewport.unprojectPosition([
    (bounds[0] + bounds[2]) / 2,
    (bounds[1] + bounds[3]) / 2,
    0
  ]);

  let {width, height, zoom} = opts;
  if (zoom === undefined) {
    // Use width and height to determine zoom
    width = width! - border * 2;
    height = height! - border * 2;
    const scale = Math.min(width / (bounds[2] - bounds[0]), height / (bounds[3] - bounds[1]));
    zoom = Math.min(Math.log2(scale), 20);
  } else if (!width || !height) {
    // Use zoom to determine width and height
    const scale = 2 ** zoom;
    width = Math.round(Math.abs(bounds[2] - bounds[0]) * scale);
    height = Math.round(Math.abs(bounds[3] - bounds[1]) * scale);
    const maxSize = MAX_VIEWPORT_SIZE - border * 2;
    if (width > maxSize || height > maxSize) {
      const r = maxSize / Math.max(width, height);
      width = Math.round(width * r);
      height = Math.round(height * r);
      zoom += Math.log2(r);
    }
  }

  // TODO - find a more generic way to construct this viewport
  // Geospatial viewports may not be web-mercator
  return isGeospatial
    ? new WebMercatorViewport({
        id: viewport.id,
        x: border,
        y: border,
        width,
        height,
        longitude: centerWorld[0],
        latitude: centerWorld[1],
        zoom,
        orthographic: true
      })
    : new OrthographicViewport({
        id: viewport.id,
        x: border,
        y: border,
        width,
        height,
        target: centerWorld,
        zoom,
        flipY: false
      });
}

/** Returns viewport bounds in CARTESIAN coordinates */
export function getViewportBounds(viewport: Viewport, zRange?: [number, number]): Bounds {
  // Viewport bounds in world coordinates
  let viewportBoundsWorld: Bounds;
  if (zRange && zRange.length === 2) {
    const [minZ, maxZ] = zRange;
    const bounds0 = viewport.getBounds({z: minZ});
    const bounds1 = viewport.getBounds({z: maxZ});
    viewportBoundsWorld = [
      Math.min(bounds0[0], bounds1[0]),
      Math.min(bounds0[1], bounds1[1]),
      Math.max(bounds0[2], bounds1[2]),
      Math.max(bounds0[3], bounds1[3])
    ];
  } else {
    viewportBoundsWorld = viewport.getBounds();
  }

  // Viewport bounds in cartesian coordinates
  const viewportBottomLeftCommon = viewport.projectPosition(viewportBoundsWorld.slice(0, 2));
  const viewportTopRightCommon = viewport.projectPosition(viewportBoundsWorld.slice(2, 4));
  return [
    viewportBottomLeftCommon[0],
    viewportBottomLeftCommon[1],
    viewportTopRightCommon[0],
    viewportTopRightCommon[1]
  ];
}

/*
 * Determine the common space bounds that best cover the given data for the given viewport
 * Returns bounds in CARTESIAN coordinates
 */
export function getRenderBounds(
  layerBounds: Bounds,
  viewport: Viewport,
  zRange?: [number, number]
): Bounds {
  if (!layerBounds) {
    return [0, 0, 1, 1];
  }

  const viewportBounds = getViewportBounds(viewport, zRange);
  // Expand viewport bounds by 2X. Heurestically chosen to avoid masking
  // errors when mask is partially out of view
  const paddedBounds = doubleBounds(viewportBounds);

  // When bounds of the layers are smaller than the viewport bounds simply use
  // mask bounds, so as to maximize resolution & avoid rerenders
  if (
    layerBounds[2] - layerBounds[0] <= paddedBounds[2] - paddedBounds[0] &&
    layerBounds[3] - layerBounds[1] <= paddedBounds[3] - paddedBounds[1]
  ) {
    return layerBounds;
  }

  // As viewport shrinks, to avoid pixelation along mask edges
  // we need to reduce the bounds and only render the visible portion
  // of the mask.
  // We pad the viewport bounds to capture the section
  // of the mask just outside the viewport to correctly maskByInstance.
  // Intersect mask & padded viewport bounds
  return [
    Math.max(layerBounds[0], paddedBounds[0]),
    Math.max(layerBounds[1], paddedBounds[1]),
    Math.min(layerBounds[2], paddedBounds[2]),
    Math.min(layerBounds[3], paddedBounds[3])
  ];
}

function doubleBounds(bounds: Bounds): Bounds {
  const dx = bounds[2] - bounds[0];
  const dy = bounds[3] - bounds[1];
  const centerX = (bounds[0] + bounds[2]) / 2;
  const centerY = (bounds[1] + bounds[3]) / 2;
  return [centerX - dx, centerY - dy, centerX + dx, centerY + dy];
}
