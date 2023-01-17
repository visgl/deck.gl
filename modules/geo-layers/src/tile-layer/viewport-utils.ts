// deck.gl, MIT license

import {Viewport, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import {CullingVolume, Plane} from '@math.gl/culling';
import {lngLatToWorld} from '@math.gl/web-mercator';

import {Bounds, ZRange, TraversalParameters} from '../tileset-2d';

const TILE_SIZE = 512;

/**
 * Glue code between deck.gl Viewports and the abstract Tileset2D API
 */
export function getTraversalParametersFromViewport(
  viewport: Viewport,
  maxZ: number,
  zRange: ZRange | undefined,
  bounds?: Bounds
): TraversalParameters {
  const project: ((xyz: number[]) => number[]) | null =
    viewport instanceof _GlobeViewport && viewport.resolution
      ? // eslint-disable-next-line @typescript-eslint/unbound-method
        viewport.projectPosition
      : null;

  // Get the culling volume of the current camera
  const planes: Plane[] = Object.values(viewport.getFrustumPlanes()).map(
    ({normal, distance}) => new Plane(normal.clone().negate(), distance)
  );
  const cullingVolume = new CullingVolume(planes);

  // Project zRange from meters to common space
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = (zRange && zRange[0] * unitsPerMeter) || 0;
  const elevationMax = (zRange && zRange[1] * unitsPerMeter) || 0;
  const elevationBounds: ZRange = [elevationMin, elevationMax];

  // Always load at the current zoom level if pitch is small
  const minZ = viewport instanceof WebMercatorViewport && viewport.pitch <= 60 ? maxZ : 0;

  // Map extent to OSM position
  if (bounds) {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const topLeft = lngLatToWorld([minLng, maxLat]);
    const bottomRight = lngLatToWorld([maxLng, minLat]);
    bounds = [topLeft[0], TILE_SIZE - topLeft[1], bottomRight[0], TILE_SIZE - bottomRight[1]];
  }

  const repeatedWorldMaps = Boolean(
    viewport instanceof WebMercatorViewport &&
      viewport.subViewports &&
      viewport.subViewports.length > 1
  );

  return {
    cameraPosition: viewport.cameraPosition,
    scale: viewport.scale,
    height: viewport.height,
    project,
    cullingVolume,
    elevationBounds,
    minZ,
    maxZ,
    bounds,
    repeatedWorldMaps,
    offset: 0
  };
}
