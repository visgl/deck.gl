import {Viewport, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';

import {
  CullingVolume,
  Plane,
  AxisAlignedBoundingBox,
  makeOrientedBoundingBoxFromPoints
} from '@math.gl/culling';
import {lngLatToWorld} from '@math.gl/web-mercator';
import {Bounds, TileIndex, ZRange} from './types';
import {osmTile2lngLat} from './utils';

const TILE_SIZE = 512;
// number of world copies to check
const MAX_MAPS = 3;
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
    cullingVolume: CullingVolume;
    elevationBounds: ZRange;
    minZ: number;
    maxZ: number;
    bounds?: Bounds;
    offset: number;
  }) {
    const {viewport, cullingVolume, elevationBounds, minZ, maxZ, bounds, offset, project} = params;
    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);

    // First, check if this tile is visible
    if (bounds && !this.insideBounds(bounds)) {
      return false;
    }

    const isInside = cullingVolume.computeVisibility(boundingVolume);
    if (isInside < 0) {
      return false;
    }

    // Avoid loading overlapping tiles - if a descendant is requested, do not request the ancester
    if (!this.childVisible) {
      let {z} = this;
      if (z < maxZ && z >= minZ) {
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

// eslint-disable-next-line complexity
export function getOSMTileIndices(
  viewport: Viewport,
  maxZ: number,
  zRange: ZRange | undefined,
  bounds?: Bounds
): TileIndex[] {
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

  // Always load at the current zoom level if pitch is small
  const minZ = viewport instanceof WebMercatorViewport && viewport.pitch <= 60 ? maxZ : 0;

  // Map extent to OSM position
  if (bounds) {
    const [minLng, minLat, maxLng, maxLat] = bounds;
    const topLeft = lngLatToWorld([minLng, maxLat]);
    const bottomRight = lngLatToWorld([maxLng, minLat]);
    bounds = [topLeft[0], TILE_SIZE - topLeft[1], bottomRight[0], TILE_SIZE - bottomRight[1]];
  }

  const root = new OSMNode(0, 0, 0);
  const traversalParams = {
    viewport,
    project,
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
