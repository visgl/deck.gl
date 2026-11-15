// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Viewport,
  WebMercatorViewport,
  _GlobeViewport,
  _CustomProjectionViewport
} from '@deck.gl/core';

import {
  CullingVolume,
  Plane,
  AxisAlignedBoundingBox,
  makeOrientedBoundingBoxFromPoints
} from '@math.gl/geometry/culling';
import {lngLatToWorld, MAX_LATITUDE} from '@math.gl/web-mercator';
import {Bounds, TileIndex, ZRange} from './types';
import {osmTile2lngLat} from './utils';

const TILE_SIZE = 512;
// number of world copies to check
const MAX_MAPS = 3;
// number of intervals on each screen axis, to sample the ground that a custom projection shows
const VIEW_SAMPLES = 8;
// tolerance in degrees, to detect a position that a CRS moved into its area of use
const EPSILON = 1e-9;
// for calculating bounding volume of a tile in a non-web-mercator viewport
const REF_POINTS_5 = [
  [0.5, 0.5],
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
]; // 4 corners and center
const REF_POINTS_9 = REF_POINTS_5.concat([
  [0, 0.5],
  [0.5, 0],
  [1, 0.5],
  [0.5, 1]
]); // 4 corners, center and 4 mid points
const REF_POINTS_11 = REF_POINTS_9.concat([
  [0.25, 0.5],
  [0.75, 0.5]
]); // 2 additional points on equator for top tile

// for a tile that a custom projection can draw only in part: the tile has no reliable bounds
const PARTIAL_BOUNDING_VOLUME = new AxisAlignedBoundingBox();

class OSMNode {
  x: number;
  y: number;
  z: number;

  private childVisible?: boolean;
  private selected?: boolean;

  private _children?: OSMNode[];

  constructor(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  get children() {
    if (!this._children) {
      const x = this.x * 2;
      const y = this.y * 2;
      const z = this.z + 1;
      this._children = [
        new OSMNode(x, y, z),
        new OSMNode(x, y + 1, z),
        new OSMNode(x + 1, y, z),
        new OSMNode(x + 1, y + 1, z)
      ];
    }
    return this._children;
  }

  // eslint-disable-next-line complexity
  update(params: {
    viewport: Viewport;
    project: ((xyz: number[]) => number[]) | null;
    isGlobe: boolean;
    cullingVolume: CullingVolume;
    elevationBounds: ZRange;
    minZ: number;
    maxZ: number;
    bounds?: Bounds[];
    offset: number;
  }) {
    const {viewport, cullingVolume, elevationBounds, minZ, maxZ, bounds, offset, project, isGlobe} =
      params;

    // First, check if this tile is visible
    if (bounds && !bounds.some(b => this.insideBounds(b))) {
      return false;
    }

    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);
    if (!boundingVolume) {
      // The custom projection cannot draw this tile.
      // The tile can contain the complete area of use, so examine its children.
      this.selected = false;
      if (this.z < maxZ) {
        this.childVisible = true;
        for (const child of this.children) {
          child.update(params);
        }
      }
      return false;
    }
    // A tile that is partially in the area of use of a custom projection passed the bounds test.
    // Keep it.
    const isPartial = boundingVolume === PARTIAL_BOUNDING_VOLUME;
    if (!isPartial && cullingVolume.computeVisibility(boundingVolume) === 'outside') {
      return false;
    }

    // Globe: reject tiles occluded by the near hemisphere
    if (
      project &&
      isGlobe &&
      this.beyondHorizon(viewport.cameraPosition, project, elevationBounds[1])
    ) {
      return false;
    }

    // Avoid loading overlapping tiles - if a descendant is requested, do not request the ancester
    if (!this.childVisible) {
      let {z} = this;
      if (!isPartial && z < maxZ && z >= minZ) {
        // Adjust LOD
        // If the tile is far enough from the camera, accept a lower zoom level
        const distance =
          (boundingVolume.distanceTo(viewport.cameraPosition) * viewport.scale) / viewport.height;
        z += Math.floor(Math.log2(distance));
      }
      if (z >= maxZ) {
        // LOD is acceptable
        this.selected = true;
        return true;
      }
    }

    // LOD is not enough, recursively test child tiles
    this.selected = false;
    this.childVisible = true;
    for (const child of this.children) {
      child.update(params);
    }
    return true;
  }

  getSelected(result: OSMNode[] = []): OSMNode[] {
    if (this.selected) {
      result.push(this);
    }
    if (this._children) {
      for (const node of this._children) {
        node.getSelected(result);
      }
    }
    return result;
  }

  beyondHorizon(
    cameraPosition: number[],
    project: (xyz: number[]) => number[],
    elevation: number
  ): boolean {
    const cx = cameraPosition[0];
    const cy = cameraPosition[1];
    const cz = cameraPosition[2];
    const cMag = Math.sqrt(cx * cx + cy * cy + cz * cz);

    const camLng = (Math.atan2(cx, -cy) * 180) / Math.PI;
    const camLat = (Math.asin(cz / cMag) * 180) / Math.PI;

    const [west, north] = osmTile2lngLat(this.x, this.y, this.z);
    const [east, south] = osmTile2lngLat(this.x + 1, this.y + 1, this.z);

    const tileCenterLng = (west + east) / 2;
    const wrappedCamLng = tileCenterLng + (((camLng - tileCenterLng + 540) % 360) - 180);
    const closestLng = Math.max(west, Math.min(wrappedCamLng, east));
    const closestLat = Math.max(south, Math.min(camLat, north));

    const closest = project([closestLng, closestLat, elevation]);
    const dot = closest[0] * cx + closest[1] * cy + closest[2] * cz;
    const magSq = closest[0] * closest[0] + closest[1] * closest[1] + closest[2] * closest[2];
    return dot <= magSq;
  }

  insideBounds([minX, minY, maxX, maxY]: Bounds): boolean {
    const scale = Math.pow(2, this.z);
    const extent = TILE_SIZE / scale;

    return (
      this.x * extent < maxX &&
      this.y * extent < maxY &&
      (this.x + 1) * extent > minX &&
      (this.y + 1) * extent > minY
    );
  }

  getBoundingVolume(
    zRange: ZRange,
    worldOffset: number,
    project: ((xyz: number[]) => number[]) | null
  ) {
    if (project) {
      // Custom projection
      // Estimate bounding box from sample points
      // At low zoom level we need more samples to calculate the bounding volume correctly
      const refPoints = this.z < 1 ? REF_POINTS_11 : this.z < 2 ? REF_POINTS_9 : REF_POINTS_5;

      // Convert from tile-relative coordinates to common space
      const refPointPositions: number[][] = [];
      for (const p of refPoints) {
        const lngLat: number[] = osmTile2lngLat(this.x + p[0], this.y + p[1], this.z);
        lngLat[2] = zRange[0];
        refPointPositions.push(project(lngLat));

        if (zRange[0] !== zRange[1]) {
          // Account for the elevation volume
          lngLat[2] = zRange[1];
          refPointPositions.push(project(lngLat));
        }
      }

      const validCount = refPointPositions.filter(isFinitePosition).length;
      if (validCount < refPointPositions.length) {
        // Some reference points are not in the area of use of the custom projection.
        // They do not show where the tile is.
        return validCount ? PARTIAL_BOUNDING_VOLUME : null;
      }
      return makeOrientedBoundingBoxFromPoints(refPointPositions);
    }

    // Use WebMercator projection
    const scale = Math.pow(2, this.z);
    const extent = TILE_SIZE / scale;
    const originX = this.x * extent + worldOffset * TILE_SIZE;
    // deck's common space is y-flipped
    const originY = TILE_SIZE - (this.y + 1) * extent;

    return new AxisAlignedBoundingBox(
      [originX, originY, zRange[0]],
      [originX + extent, originY + extent, zRange[1]]
    );
  }
}

function isFinitePosition(position: number[]): boolean {
  return position.every(Number.isFinite);
}

/** Returns true if the CRS of the viewport projects the WGS84 position without moving it first */
function isInAreaOfUse(viewport: _CustomProjectionViewport, position: number[]): boolean {
  const normalized = viewport.crs.converter.WGS84.normalize(position);
  const dLng = Math.abs(normalized[0] - position[0]) % 360;
  return Math.min(dLng, 360 - dLng) <= EPSILON && Math.abs(normalized[1] - position[1]) <= EPSILON;
}

/**
 * Projects a WGS84 position to the common space of a custom projection.
 * A CRS can clamp a position to its area of use. The projected position then does not show
 * where the tile is, so the result is not finite.
 */
function projectInAreaOfUse(viewport: _CustomProjectionViewport, position: number[]): number[] {
  return isInAreaOfUse(viewport, position) ? viewport.projectPosition(position) : [NaN, NaN, NaN];
}

/**
 * Returns the WGS84 bounds of the ground that a custom projection shows.
 * The result is empty if no ground is visible. It has two boxes if the view crosses the antimeridian.
 */
// eslint-disable-next-line complexity, max-statements
function getGeographicBounds(viewport: _CustomProjectionViewport, zRange: ZRange | null): Bounds[] {
  const {width, height} = viewport;
  const centerLng = viewport.position[0];
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const targetZ of zRange || [0]) {
    for (let i = 0; i <= VIEW_SAMPLES; i++) {
      for (let j = 0; j <= VIEW_SAMPLES; j++) {
        const pixel = [(i / VIEW_SAMPLES) * width, (j / VIEW_SAMPLES) * height];
        const [lng, lat] = viewport.unproject(pixel, {targetZ});
        if (Number.isFinite(lng) && Number.isFinite(lat)) {
          // Keep the longitude continuous across the antimeridian
          const dLng = lng - centerLng;
          const continuousLng = centerLng + dLng - 360 * Math.round(dLng / 360);
          minLng = Math.min(minLng, continuousLng);
          maxLng = Math.max(maxLng, continuousLng);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        }
      }
    }
  }
  if (minLng > maxLng) {
    return [];
  }

  // The edges of the screen are curves in WGS84. Add half of the sample interval.
  const padLng = (maxLng - minLng) / VIEW_SAMPLES / 2;
  const padLat = (maxLat - minLat) / VIEW_SAMPLES / 2;
  minLng -= padLng;
  maxLng += padLng;
  minLat -= padLat;
  maxLat += padLat;

  // All meridians meet at a pole
  for (const poleLat of [-90, 90]) {
    const pole = [centerLng, poleLat];
    if (isInAreaOfUse(viewport, pole)) {
      const [x, y] = viewport.project(pole);
      if (x >= 0 && x <= width && y >= 0 && y <= height) {
        minLng = centerLng - 180;
        maxLng = centerLng + 180;
        minLat = Math.min(minLat, poleLat);
        maxLat = Math.max(maxLat, poleLat);
      }
    }
  }

  // Web Mercator tiles end at this latitude
  minLat = Math.max(minLat, -MAX_LATITUDE);
  maxLat = Math.min(maxLat, MAX_LATITUDE);
  if (maxLng - minLng >= 360) {
    return [[-180, minLat, 180, maxLat]];
  }
  const offset = 360 * Math.floor((minLng + 180) / 360);
  minLng -= offset;
  maxLng -= offset;
  return maxLng > 180
    ? [
        [minLng, minLat, 180, maxLat],
        [-180, minLat, maxLng - 360, maxLat]
      ]
    : [[minLng, minLat, maxLng, maxLat]];
}

/** Returns the intersection of two WGS84 bounds, or null if they do not overlap */
function intersectBounds(a: Bounds, b: Bounds): Bounds | null {
  const result: Bounds = [
    Math.max(a[0], b[0]),
    Math.max(a[1], b[1]),
    Math.min(a[2], b[2]),
    Math.min(a[3], b[3])
  ];
  return result[0] < result[2] && result[1] < result[3] ? result : null;
}

// eslint-disable-next-line complexity
export function getOSMTileIndices(
  viewport: Viewport,
  maxZ: number,
  zRange: ZRange | null,
  extent?: Bounds
): TileIndex[] {
  const isGlobe = viewport instanceof _GlobeViewport;
  const isCustomProjection = viewport instanceof _CustomProjectionViewport;
  // These viewports do not have the common space of Web Mercator.
  // Project the tile to get its bounding volume.
  let project: ((xyz: number[]) => number[]) | null = null;
  if (isGlobe) {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    project = viewport.projectPosition;
  } else if (isCustomProjection) {
    project = xyz => projectInAreaOfUse(viewport, xyz);
  }

  // Get the culling volume of the current camera
  const planes: Plane[] = Object.values(viewport.getFrustumPlanes()).map(
    ({normal, distance}) => new Plane(normal.clone().negate(), distance)
  );
  const cullingVolume = new CullingVolume(planes);

  // Project zRange from meters to common space
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = (zRange && zRange[0] * unitsPerMeter) || 0;
  const elevationMax = (zRange && zRange[1] * unitsPerMeter) || 0;

  // Always load at the current zoom level if pitch is small
  const minZ =
    (viewport instanceof WebMercatorViewport || isCustomProjection) && viewport.pitch <= 60
      ? maxZ
      : 0;

  let geographicBounds: Bounds[] | undefined = extent && [extent];
  if (isCustomProjection) {
    // The frustum test is not sufficient: a tile at the edge of the area of use of the CRS has
    // no bounding volume. Select tiles only in the WGS84 bounds of the visible ground.
    geographicBounds = getGeographicBounds(viewport, zRange)
      .map(viewBounds => (extent ? intersectBounds(viewBounds, extent) : viewBounds))
      .filter(Boolean) as Bounds[];
    if (!geographicBounds.length) {
      return [];
    }
  }

  // Map extent to OSM position
  const bounds = geographicBounds?.map(([minLng, minLat, maxLng, maxLat]): Bounds => {
    const topLeft = lngLatToWorld([minLng, maxLat]);
    const bottomRight = lngLatToWorld([maxLng, minLat]);
    return [topLeft[0], TILE_SIZE - topLeft[1], bottomRight[0], TILE_SIZE - bottomRight[1]];
  });

  const root = new OSMNode(0, 0, 0);
  const traversalParams = {
    viewport,
    project,
    isGlobe,
    cullingVolume,
    elevationBounds: [elevationMin, elevationMax] as ZRange,
    minZ,
    maxZ,
    bounds,
    // num. of worlds from the center. For repeated maps
    offset: 0
  };

  root.update(traversalParams);

  if (
    viewport instanceof WebMercatorViewport &&
    viewport.subViewports &&
    viewport.subViewports.length > 1
  ) {
    // Check worlds in repeated maps
    traversalParams.offset = -1;
    while (root.update(traversalParams)) {
      if (--traversalParams.offset < -MAX_MAPS) {
        break;
      }
    }
    traversalParams.offset = 1;
    while (root.update(traversalParams)) {
      if (++traversalParams.offset > MAX_MAPS) {
        break;
      }
    }
  }

  return root.getSelected();
}
