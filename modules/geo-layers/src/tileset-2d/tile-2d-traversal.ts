// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Viewport,
  WebMercatorViewport,
  GlobeViewport,
  _CustomProjectionViewport
} from '@deck.gl/core';

import {
  CullingVolume,
  Plane,
  AxisAlignedBoundingBox,
  OrientedBoundingBox,
  makeOrientedBoundingBoxFromPoints
} from '@math.gl/geometry/culling';
import {lngLatToWorld, MAX_LATITUDE} from '@math.gl/geospatial/web-mercator';
import {Bounds, TileIndex, ZRange} from './types';
import {osmTile2lngLat} from './utils';

const TILE_SIZE = 512;
// number of world copies to check
const MAX_MAPS = 3;
// number of intervals on each screen axis, to sample the ground that a custom projection shows
const VIEW_SAMPLES = 8;
// number of intervals on each axis, to sample the area of use of a CRS
const AREA_SAMPLES = 16;
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

// for calculating bounding volume of a tile in a custom projection, where tile edges are curves:
// the corners and the points at each quarter of the edges, in order around the tile
const EDGE_POINTS = [
  [0, 0],
  [0.25, 0],
  [0.5, 0],
  [0.75, 0],
  [1, 0],
  [1, 0.25],
  [1, 0.5],
  [1, 0.75],
  [1, 1],
  [0.75, 1],
  [0.5, 1],
  [0.25, 1],
  [0, 1],
  [0, 0.75],
  [0, 0.5],
  [0, 0.25]
];
const CURVED_REF_POINTS = EDGE_POINTS.concat([[0.5, 0.5]]);
const CURVED_REF_POINTS_TOP = CURVED_REF_POINTS.concat([
  [0.25, 0.5],
  [0.75, 0.5]
]);

// largest deviation of an edge from a chord, relative to the chord, that the margin of
// the bounding volume of a tile in a custom projection can enclose
const MAX_EDGE_DEVIATION = 0.25;
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
    bounds?: Bounds;
    /** Bounds of the ground that a custom projection shows, for a tile without a bounding volume */
    viewBounds?: Bounds[];
    offset: number;
  }) {
    const {viewport, cullingVolume, elevationBounds, minZ, maxZ, bounds, offset, project, isGlobe} =
      params;
    const {viewBounds} = params;

    // First, check if this tile is visible
    if (bounds && !this.insideBounds(bounds)) {
      return false;
    }

    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project, !isGlobe);
    const isPartial = boundingVolume === PARTIAL_BOUNDING_VOLUME;
    if (!boundingVolume || isPartial) {
      // Some reference points of the tile are not in the area of use of the custom projection.
      // The frustum test is not possible. Use the bounds of the visible ground.
      if (viewBounds && !viewBounds.some(b => this.insideBounds(b))) {
        return false;
      }
    }
    if (!boundingVolume) {
      // No reference point of the tile is in the area of use of the custom projection.
      if (this.z < maxZ) {
        // Examine the children
        this.selected = false;
        this.childVisible = true;
        for (const child of this.children) {
          child.update(params);
        }
        return false;
      }
      // The tile passed the bounds test, so the area of use is between the reference points.
      // Keep the tile.
      this.selected = !this.childVisible;
      return this.selected;
    }
    // A tile that is partially in the area of use of a custom projection passed the bounds test.
    // Keep it.
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
    project: ((xyz: number[]) => number[]) | null,
    curvedEdges = false
  ) {
    if (project) {
      // Custom projection
      // Estimate bounding box from sample points
      // At low zoom level we need more samples to calculate the bounding volume correctly
      let refPoints: number[][];
      if (curvedEdges) {
        refPoints = this.z < 1 ? CURVED_REF_POINTS_TOP : CURVED_REF_POINTS;
      } else {
        refPoints = this.z < 1 ? REF_POINTS_11 : this.z < 2 ? REF_POINTS_9 : REF_POINTS_5;
      }

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
      if (curvedEdges) {
        const stride = zRange[0] !== zRange[1] ? 2 : 1;
        if (!addEdgeMargin(refPointPositions, stride)) {
          // The reference points do not show where the tile is
          return PARTIAL_BOUNDING_VOLUME;
        }
        return makeTileBoundingBox(refPointPositions, stride);
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

/**
 * Adds points so that the bounding box of the positions encloses the curved edges of a tile.
 * The positions start with the projected EDGE_POINTS, `stride` positions for each point.
 * Between the two neighbors of an odd point, the edge bows out from their chord by
 * approximately the deviation of the odd point. Add a point at twice that deviation.
 * Returns false if an edge bends too much for the points to enclose it.
 */
function addEdgeMargin(positions: number[][], stride: number): boolean {
  const count = EDGE_POINTS.length;
  for (let k = 1; k < count; k += 2) {
    for (let e = 0; e < stride; e++) {
      const before = positions[(k - 1) * stride + e];
      const point = positions[k * stride + e];
      const after = positions[((k + 1) % count) * stride + e];
      const deviation = point.map((v, i) => v - (before[i] + after[i]) / 2);
      const chord = before.map((v, i) => after[i] - v);
      if (Math.hypot(...deviation) > MAX_EDGE_DEVIATION * Math.hypot(...chord)) {
        return false;
      }
      positions.push(point.map((v, i) => v + deviation[i]));
    }
  }
  return true;
}

/**
 * Returns a box that encloses the positions, with axes along the edges of the tile.
 * The positions start with the projected EDGE_POINTS, `stride` positions for each point.
 * The principal axes of the positions are not stable for a square tile.
 */
function makeTileBoundingBox(positions: number[][], stride: number): OrientedBoundingBox {
  // From the corner 0,0 to the corner 1,0, and from the corner 0,1 to the corner 1,1
  const [x0, y0] = positions[0];
  const [x1, y1] = positions[4 * stride];
  const [x2, y2] = positions[8 * stride];
  const [x3, y3] = positions[12 * stride];
  const length = Math.hypot(x1 - x0 + x2 - x3, y1 - y0 + y2 - y3);
  const ux = (x1 - x0 + x2 - x3) / length;
  const uy = (y1 - y0 + y2 - y3) / length;
  const min = [Infinity, Infinity, Infinity];
  const max = [-Infinity, -Infinity, -Infinity];
  for (const [x, y, z = 0] of positions) {
    const coordinates = [x * ux + y * uy, y * ux - x * uy, z];
    for (let i = 0; i < 3; i++) {
      min[i] = Math.min(min[i], coordinates[i]);
      max[i] = Math.max(max[i], coordinates[i]);
    }
  }
  const [u, v, z] = min.map((value, i) => (value + max[i]) / 2);
  const [halfU, halfV, halfZ] = min.map((value, i) => (max[i] - value) / 2);
  return new OrientedBoundingBox(
    [u * ux - v * uy, u * uy + v * ux, z],
    [ux * halfU, uy * halfU, 0, -uy * halfV, ux * halfV, 0, 0, 0, halfZ]
  );
}

function isFinitePosition(position: number[]): boolean {
  return position.every(Number.isFinite);
}

/**
 * Returns the result of a conversion, or a position that is not finite if the conversion fails.
 * A CRS, and the viewport that uses it, can throw for a position that the CRS cannot convert.
 */
function tryConvert(convert: () => number[]): number[] {
  try {
    return convert();
  } catch {
    return [NaN, NaN, NaN];
  }
}

/** Returns true if the CRS of the viewport projects the WGS84 position without moving it first */
function isInAreaOfUse(viewport: _CustomProjectionViewport, position: number[]): boolean {
  const normalized = tryConvert(() => viewport.crs.converter.WGS84.normalize(position));
  const dLng = Math.abs(normalized[0] - position[0]) % 360;
  return Math.min(dLng, 360 - dLng) <= EPSILON && Math.abs(normalized[1] - position[1]) <= EPSILON;
}

/**
 * Projects a WGS84 position to the common space of a custom projection.
 * A CRS can clamp a position to its area of use. The projected position then does not show
 * where the tile is, so the result is not finite.
 */
function projectInAreaOfUse(viewport: _CustomProjectionViewport, position: number[]): number[] {
  return isInAreaOfUse(viewport, position)
    ? tryConvert(() => viewport.projectPosition(position))
    : [NaN, NaN, NaN];
}

type ScreenRect = {x: number; y: number; width: number; height: number};

const areaPositionsCache = new WeakMap<object, number[][]>();

/**
 * Returns WGS84 positions on a grid in the area of use of the CRS of a custom projection.
 * A CRS that clamps positions shows its area of use: the positions of the world go into it.
 */
function getAreaPositions(viewport: _CustomProjectionViewport): number[][] {
  let positions = areaPositionsCache.get(viewport.crs);
  if (!positions) {
    let minLng = Infinity;
    let minLat = Infinity;
    let maxLng = -Infinity;
    let maxLat = -Infinity;
    for (let lng = -180; lng <= 180; lng += 30) {
      for (let lat = -90; lat <= 90; lat += 30) {
        const normalized = tryConvert(() => viewport.crs.converter.WGS84.normalize([lng, lat]));
        if (Number.isFinite(normalized[0]) && Number.isFinite(normalized[1])) {
          minLng = Math.min(minLng, normalized[0]);
          maxLng = Math.max(maxLng, normalized[0]);
          minLat = Math.min(minLat, normalized[1]);
          maxLat = Math.max(maxLat, normalized[1]);
        }
      }
    }
    positions = [];
    for (let i = 0; i <= AREA_SAMPLES && minLng <= maxLng; i++) {
      for (let j = 0; j <= AREA_SAMPLES; j++) {
        positions.push([
          minLng + (i / AREA_SAMPLES) * (maxLng - minLng),
          minLat + (j / AREA_SAMPLES) * (maxLat - minLat),
          0
        ]);
      }
    }
    areaPositionsCache.set(viewport.crs, positions);
  }
  return positions;
}

/**
 * Returns WGS84 positions of the ground that a custom projection shows in a screen rectangle.
 * The default rectangle is the complete viewport.
 * The positions are samples on a grid of the screen and on a grid of the area of use of the CRS.
 * The second grid finds an area of use that is small on screen.
 * A screen position that the CRS cannot convert in the two directions shows no ground.
 */
export function getGroundPositions(
  viewport: _CustomProjectionViewport,
  zRange: ZRange | null,
  rect: ScreenRect = {x: 0, y: 0, width: viewport.width, height: viewport.height}
): number[][] {
  const positions: number[][] = [];
  for (const targetZ of zRange || [0]) {
    for (let i = 0; i <= VIEW_SAMPLES; i++) {
      for (let j = 0; j <= VIEW_SAMPLES; j++) {
        const pixel = [
          rect.x + (i / VIEW_SAMPLES) * rect.width,
          rect.y + (j / VIEW_SAMPLES) * rect.height
        ];
        const [lng, lat] = tryConvert(() => viewport.unproject(pixel, {targetZ}));
        if (
          Number.isFinite(lng) &&
          Number.isFinite(lat) &&
          isFinitePosition(projectInAreaOfUse(viewport, [lng, lat, 0]))
        ) {
          // Longitude in the range [-180, 180)
          positions.push([lng - 360 * Math.floor((lng + 180) / 360), lat]);
        }
      }
    }
  }
  for (const position of getAreaPositions(viewport)) {
    if (isFinitePosition(projectInAreaOfUse(viewport, position))) {
      const [x, y, depth] = tryConvert(() => viewport.project(position));
      if (
        x >= rect.x &&
        x <= rect.x + rect.width &&
        y >= rect.y &&
        y <= rect.y + rect.height &&
        depth >= 0 &&
        depth <= 1
      ) {
        positions.push([position[0] - 360 * Math.floor((position[0] + 180) / 360), position[1]]);
      }
    }
  }
  return positions;
}

/**
 * Returns the WGS84 bounds of ground positions that a custom projection shows in a screen rectangle.
 * The result is empty if no ground is visible. It has two boxes if the view crosses the antimeridian.
 */
// eslint-disable-next-line complexity, max-statements
export function getGeographicBounds(
  viewport: _CustomProjectionViewport,
  groundPositions: number[][],
  rect: ScreenRect = {x: 0, y: 0, width: viewport.width, height: viewport.height}
): Bounds[] {
  const {x: left, y: top, width, height} = rect;
  const centerLng = viewport.position[0];
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const [lng, lat] of groundPositions) {
    // Keep the longitude continuous across the antimeridian
    const dLng = lng - centerLng;
    const continuousLng = centerLng + dLng - 360 * Math.round(dLng / 360);
    minLng = Math.min(minLng, continuousLng);
    maxLng = Math.max(maxLng, continuousLng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
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
    const pole = [centerLng, poleLat, 0];
    if (isInAreaOfUse(viewport, pole)) {
      // A position without an altitude projects to x and y only
      const [x, y, depth] = tryConvert(() => viewport.project(pole));
      if (
        x >= left &&
        x <= left + width &&
        y >= top &&
        y <= top + height &&
        depth >= 0 &&
        depth <= 1
      ) {
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

// eslint-disable-next-line complexity
export function getOSMTileIndices(
  viewport: Viewport,
  maxZ: number,
  zRange: ZRange | null,
  extent?: Bounds
): TileIndex[] {
  const isGlobe = viewport instanceof GlobeViewport;
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

  // Project zRange from meters to common space.
  // The projection of a custom projection takes the altitude in meters.
  const unitsPerMeter = isCustomProjection ? 1 : viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = (zRange && zRange[0] * unitsPerMeter) || 0;
  const elevationMax = (zRange && zRange[1] * unitsPerMeter) || 0;

  // Always load at the current zoom level if pitch is small
  const minZ =
    (viewport instanceof WebMercatorViewport || isCustomProjection) && viewport.pitch <= 60
      ? maxZ
      : 0;

  // Map bounds to OSM position
  const toWorldBounds = ([minLng, minLat, maxLng, maxLat]: Bounds): Bounds => {
    const topLeft = lngLatToWorld([minLng, maxLat]);
    const bottomRight = lngLatToWorld([maxLng, minLat]);
    return [topLeft[0], TILE_SIZE - topLeft[1], bottomRight[0], TILE_SIZE - bottomRight[1]];
  };
  const bounds = extent && toWorldBounds(extent);
  // A tile at the edge of the area of use of a custom projection has no bounding volume.
  // Select such a tile only in the WGS84 bounds of the visible ground.
  const viewBounds = isCustomProjection
    ? getGeographicBounds(viewport, getGroundPositions(viewport, zRange)).map(toWorldBounds)
    : undefined;

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
    viewBounds,
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
