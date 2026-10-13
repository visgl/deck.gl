// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Viewport, WebMercatorViewport, _GlobeViewport} from '@deck.gl/core';
import {
  CullingVolume,
  Plane,
  AxisAlignedBoundingBox,
  makeOrientedBoundingBoxFromPoints
} from '@math.gl/culling';
import {lngLatToWorld} from '@math.gl/web-mercator';
import type {Bounds, TileIndex, ZRange} from '../shared-tileset-2d/types';
import {osmTile2lngLat} from './deck-tileset-adapter';

const TILE_SIZE = 512;
const MAX_MAPS = 3;
const REF_POINTS_5 = [
  [0.5, 0.5],
  [0, 0],
  [0, 1],
  [1, 0],
  [1, 1]
];
const REF_POINTS_9 = REF_POINTS_5.concat([
  [0, 0.5],
  [0.5, 0],
  [1, 0.5],
  [0.5, 1]
]);
const REF_POINTS_11 = REF_POINTS_9.concat([
  [0.25, 0.5],
  [0.75, 0.5]
]);

class OSMNode {
  x: number;
  y: number;
  z: number;

  private childVisible?: boolean;
  private selected?: boolean;
  private _children?: OSMNode[];

  constructor(x: number, y: number, z: number) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

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

  update(params: {
    viewport: Viewport;
    project: ((xyz: number[]) => number[]) | null;
    cullingVolume: CullingVolume;
    elevationBounds: ZRange;
    minZ: number;
    maxZ: number;
    bounds?: Bounds;
    offset: number;
  }): boolean {
    const {viewport, cullingVolume, elevationBounds, minZ, maxZ, bounds, offset, project} = params;
    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);

    if (bounds && !this.insideBounds(bounds)) {
      return false;
    }

    const isInside = cullingVolume.computeVisibility(boundingVolume);
    if (isInside === 'outside') {
      return false;
    }

    if (!this.childVisible) {
      let {z} = this;
      if (z < maxZ && z >= minZ) {
        const distance =
          (boundingVolume.distanceTo(viewport.cameraPosition) * viewport.scale) / viewport.height;
        z += Math.floor(Math.log2(distance));
      }
      if (z >= maxZ) {
        this.selected = true;
        return true;
      }
    }

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
      const refPoints = this.z < 1 ? REF_POINTS_11 : this.z < 2 ? REF_POINTS_9 : REF_POINTS_5;
      const refPointPositions: number[][] = [];
      for (const p of refPoints) {
        const lngLat: number[] = osmTile2lngLat(this.x + p[0], this.y + p[1], this.z);
        lngLat[2] = zRange[0];
        refPointPositions.push(project(lngLat));

        if (zRange[0] !== zRange[1]) {
          lngLat[2] = zRange[1];
          refPointPositions.push(project(lngLat));
        }
      }

      return makeOrientedBoundingBoxFromPoints(refPointPositions);
    }

    const scale = Math.pow(2, this.z);
    const extent = TILE_SIZE / scale;
    const originX = this.x * extent + worldOffset * TILE_SIZE;
    const originY = TILE_SIZE - (this.y + 1) * extent;

    return new AxisAlignedBoundingBox(
      [originX, originY, zRange[0]],
      [originX + extent, originY + extent, zRange[1]]
    );
  }
}

/** deck.gl-specific OSM tile traversal for geospatial viewports. */
export function getOSMTileIndices(
  viewport: Viewport,
  maxZ: number,
  zRange: ZRange | null,
  bounds?: Bounds
): TileIndex[] {
  const project: ((xyz: number[]) => number[]) | null =
    viewport instanceof _GlobeViewport && viewport.resolution
      ? xyz => viewport.projectPosition(xyz)
      : null;

  const planes: Plane[] = Object.values(viewport.getFrustumPlanes()).map(
    ({normal, distance}) => new Plane(normal.clone().negate(), distance)
  );
  const cullingVolume = new CullingVolume(planes);

  const unitsPerMeter = viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = (zRange && zRange[0] * unitsPerMeter) || 0;
  const elevationMax = (zRange && zRange[1] * unitsPerMeter) || 0;
  const minZ = viewport instanceof WebMercatorViewport && viewport.pitch <= 60 ? maxZ : 0;

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
    offset: 0
  };

  root.update(traversalParams);
  updateWrappedWorldCopies(root, traversalParams, viewport);

  return root.getSelected();
}

function updateWrappedWorldCopies(
  root: OSMNode,
  traversalParams: Parameters<OSMNode['update']>[0],
  viewport: Viewport
): void {
  if (
    !(viewport instanceof WebMercatorViewport) ||
    !viewport.subViewports ||
    viewport.subViewports.length <= 1
  ) {
    return;
  }

  sweepOffsets(root, traversalParams, -1, -MAX_MAPS);
  sweepOffsets(root, traversalParams, 1, MAX_MAPS);
}

function sweepOffsets(
  root: OSMNode,
  traversalParams: Parameters<OSMNode['update']>[0],
  startOffset: number,
  limit: number
): void {
  traversalParams.offset = startOffset;
  while (root.update(traversalParams)) {
    traversalParams.offset += Math.sign(startOffset);
    if (
      (startOffset < 0 && traversalParams.offset < limit) ||
      (startOffset > 0 && traversalParams.offset > limit)
    ) {
      break;
    }
  }
}
