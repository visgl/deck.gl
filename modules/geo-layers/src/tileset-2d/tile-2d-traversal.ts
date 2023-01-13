// deck.gl, MIT license

import {
  CullingVolume,
  AxisAlignedBoundingBox,
  makeOrientedBoundingBoxFromPoints
} from '@math.gl/culling';
import {Bounds, TileIndex, ZRange} from './types';
import {tileIndexToLngLat} from './tile-index';

/** Parameters for required for selecting tile indices for a viewport (aka "traversal") */
export type TraversalParameters = {
  cameraPosition: number[];
  scale: number;
  height: number;
  project: ((xyz: number[]) => number[]) | null;
  cullingVolume: CullingVolume;
  elevationBounds: ZRange;
  minZ: number;
  maxZ: number;
  bounds?: Bounds;
  /** repeated maps */
  repeatedWorldMaps: boolean;
  /** number of worlds from the center. For repeated maps */
  offset: number;
};

/** Tile size in (flat) projected pixels */
const TILE_SIZE = 512;

/** Max number of world copies to check */
const MAX_MAPS = 3;

/** 4 corners and center - for calculating bounding volume of a tile in a non-web-mercator viewport */
const REF_POINTS_5 = [
  [0.5, 0.5],
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
];

/** 4 corners, center and 4 mid points - for calculating bounding volume of a tile in a non-web-mercator viewport */
const REF_POINTS_9 = REF_POINTS_5.concat([
  [0, 0.5],
  [0.5, 0],
  [1, 0.5],
  [0.5, 1]
]);

/** 2 additional points on equator for top tile - for calculating bounding volume of a tile in a non-web-mercator viewport */
const REF_POINTS_11 = REF_POINTS_9.concat([
  [0.25, 0.5],
  [0.75, 0.5]
]); //

/** Represents a tile index in the hierarchy */
class OSMNode {
  x: number;
  y: number;
  z: number;

  private childVisible: boolean = false;
  private selected: boolean = false;
  private _children?: OSMNode[];

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /** Return the children of this node */
  get children(): OSMNode[] {
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

  /** Apply new traversal parameters */
  // eslint-disable-next-line complexity
  update(params: TraversalParameters) {
    const {
      cameraPosition,
      scale,
      height,
      cullingVolume,
      elevationBounds,
      minZ,
      maxZ,
      bounds,
      offset,
      project
    } = params;
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
        const distance = (boundingVolume.distanceTo(cameraPosition) * scale) / height;
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

  /** Get all the "visible" nodes, including sub-nodes */
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

  /** Is this tile inside the given bounds */
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

  /** Get the bounding volume of the current tile */
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
        const lngLat: number[] = tileIndexToLngLat(this.x + p[0], this.y + p[1], this.z);
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

/** Get a list of tile indices that are visible from the given viewport */
export function getOSMTileIndices(traversalParameters: TraversalParameters): TileIndex[] {
  const {repeatedWorldMaps} = traversalParameters;

  const root = new OSMNode(0, 0, 0);

  root.update(traversalParameters);

  if (repeatedWorldMaps) {
    // Check worlds in repeated maps
    traversalParameters.offset = -1;
    while (root.update(traversalParameters)) {
      if (--traversalParameters.offset < -MAX_MAPS) {
        break;
      }
    }
    traversalParameters.offset = 1;
    while (root.update(traversalParameters)) {
      if (++traversalParameters.offset > MAX_MAPS) {
        break;
      }
    }
  }

  return root.getSelected();
}
