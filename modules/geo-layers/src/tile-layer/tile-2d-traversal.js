/* eslint-disable complexity */
import {CullingVolume, Plane, AxisAlignedBoundingBox, BoundingSphere} from '@math.gl/culling';
import {Vector3} from 'math.gl';
import {osmTile2lngLat} from './utils';

const TILE_SIZE = 512;
// number of world copies to check
const MAX_MAPS = 3;

class OSMNode {
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

  update(params) {
    const {viewport, cullingVolume, elevationBounds, minZ, maxZ, offset, project} = params;
    const boundingVolume = this.getBoundingVolume(elevationBounds, offset, project);

    // First, check if this tile is visible
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

  getSelected(result = []) {
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

  getBoundingVolume(zRange, worldOffset, project) {
    if (project) {
      // Custom projection
      const corner0 = osmTile2lngLat(this.x, this.y, this.z);
      const corner1 = osmTile2lngLat(this.x + 1, this.y + 1, this.z);
      const center = osmTile2lngLat(this.x + 0.5, this.y + 0.5, this.z);
      corner0.z = zRange[1];
      corner1.z = zRange[1];
      center.z = zRange[0];

      const cornerPos0 = project(corner0);
      const cornerPos1 = project(corner1);
      const centerPos = new Vector3(project(center));
      const R = Math.max(centerPos.distance(cornerPos0), centerPos.distance(cornerPos1));

      return new BoundingSphere(centerPos, R);
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

export function getOSMTileIndices(viewport, maxZ, zRange) {
  const project = viewport.resolution ? viewport.projectPosition : null;

  // Get the culling volume of the current camera
  const planes = Object.values(viewport.getFrustumPlanes()).map(
    ({normal, distance}) => new Plane(normal.clone().negate(), distance)
  );
  const cullingVolume = new CullingVolume(planes);

  // Project zRange from meters to common space
  const unitsPerMeter = viewport.distanceScales.unitsPerMeter[2];
  const elevationMin = (zRange && zRange[0] * unitsPerMeter) || 0;
  const elevationMax = (zRange && zRange[1] * unitsPerMeter) || 0;

  // Always load at the current zoom level if pitch is small
  const minZ = viewport.pitch <= 60 ? maxZ : 0;

  const root = new OSMNode(0, 0, 0);
  const traversalParams = {
    viewport,
    project,
    cullingVolume,
    elevationBounds: [elevationMin, elevationMax],
    minZ,
    maxZ,
    // num. of worlds from the center. For repeated maps
    offset: 0
  };

  root.update(traversalParams);

  if (viewport.subViewports && viewport.subViewports.length > 1) {
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
