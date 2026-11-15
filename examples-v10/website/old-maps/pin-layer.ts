// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {CompositeLayer, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import type {CompositeLayerProps, Position, UpdateParameters} from '@deck.gl/core';

/** Radius and height of each ring from the steel point to the beveled plastic cap. */
const PROFILE = [
  // Point and exposed shaft
  [0, 0],
  [0.038, 0.08],
  [0.052, 0.16],
  [0.052, 0.81],
  // Underside and flared plastic base
  [0.06, 0.82],
  [0.44, 0.82],
  [0.485, 0.83],
  [0.5, 0.87],
  [0.485, 0.96],
  [0.44, 1.04],
  [0.36, 1.11],
  [0.26, 1.15],
  // Narrow grip
  [0.235, 1.19],
  [0.225, 1.34],
  [0.21, 1.76],
  [0.23, 1.81],
  // Cap with rounded edges and a flat top
  [0.34, 1.82],
  [0.39, 1.85],
  [0.405, 1.89],
  [0.405, 2.0],
  [0.385, 2.04],
  [0.34, 2.06],
  [0.28, 2.06],
  [0, 2.06]
];

/** Height at which the steel point meets the plastic body. */
const BODY_BASE = 0.82;

/** Normalized vertex colors for the steel point and matte red body. */
const STEEL_COLOR = [0.55, 0.53, 0.49];
const PLASTIC_COLOR = [0.68, 0.21, 0.17];

/** Builds a mesh by revolving the pin profile around its vertical axis. */
function createPinMesh() {
  const sides = 24;
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];

  for (const [ring, [radius, height]] of PROFILE.entries()) {
    const [previousRadius, previousHeight] = PROFILE[Math.max(0, ring - 1)];
    const [nextRadius, nextHeight] = PROFILE[Math.min(PROFILE.length - 1, ring + 1)];
    const dr = nextRadius - previousRadius;
    const dz = nextHeight - previousHeight;
    const length = Math.hypot(dr, dz);
    const color = height < BODY_BASE ? STEEL_COLOR : PLASTIC_COLOR;

    for (let side = 0; side < sides; side++) {
      const angle = (side / sides) * 2 * Math.PI;
      const x = Math.cos(angle);
      const y = Math.sin(angle);
      positions.push(radius * x, radius * y, height);
      colors.push(...color);
      normals.push((dz * x) / length, (dz * y) / length, -dr / length);

      if (ring > 0) {
        const lower = (ring - 1) * sides + side;
        const lowerNext = (ring - 1) * sides + ((side + 1) % sides);
        if (ring > 1) {
          indices.push(lower, lowerNext, lower + sides);
        }
        if (ring < PROFILE.length - 1) {
          indices.push(lowerNext, lowerNext + sides, lower + sides);
        }
      }
    }
  }

  return {
    attributes: {
      POSITION: {size: 3, value: new Float32Array(positions)},
      NORMAL: {size: 3, value: new Float32Array(normals)},
      COLOR_0: {size: 3, value: new Float32Array(colors)}
    },
    indices: {size: 1, value: new Uint16Array(indices)}
  };
}

/** Geometry shared by all pin instances. */
const PIN_MESH = createPinMesh();

/** Inputs for the example's geographic map pins. */
type PinLayerProps<DataT> = CompositeLayerProps & {
  data: DataT[];
  getPosition: (object: DataT) => Position;
};

/** Draws shaded 3D pins with a nominal screen width of 24 pixels. */
export default class PinLayer<DataT> extends CompositeLayer<PinLayerProps<DataT>> {
  static layerName = 'PinLayer';

  /** Resizes the mesh when the camera scale changes. */
  shouldUpdateState({changeFlags}: UpdateParameters<this>): boolean {
    return changeFlags.propsOrDataChanged || changeFlags.viewportChanged;
  }

  /** Instantiates the shared pin mesh at each geographic anchor. */
  renderLayers() {
    const {data, getPosition} = this.props;
    const {viewport} = this.context;
    // The overlaid canvas has no depth buffer shared with the basemap.
    const visibleData =
      viewport instanceof GlobeViewport
        ? data.filter(object => {
            const [longitude, latitude] = getPosition(object);
            const [x, y, z] = viewport.projectPosition([longitude, latitude, 0]);
            const [cameraX, cameraY, cameraZ] = viewport.cameraPosition;
            // A point faces the camera when its outward normal points toward the camera.
            return x * (cameraX - x) + y * (cameraY - y) + z * (cameraZ - z) > 0;
          })
        : data;

    return new SimpleMeshLayer<DataT>(this.getSubLayerProps({id: 'mesh'}), {
      data: visibleData,
      // Geographic anchors let SimpleMeshLayer rotate meter offsets into the local globe frame.
      coordinateSystem: 'lnglat',
      getPosition,
      mesh: PIN_MESH,
      // The mesh is one unit wide and SimpleMeshLayer sizes it in meters.
      sizeScale: 24 * viewport.metersPerPixel,
      // Lean the pin so its tip is visible when looking straight down at the map.
      getOrientation: [0, 0, -45],
      getColor: [255, 255, 255],
      material: {ambient: 0.45, diffuse: 0.65, specularColor: [0, 0, 0]}
    });
  }
}
