// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clipInstancePlugin, clipGeometryPlugin, CLIP_POLYGON_SIZE} from './shader-module';
import {LayerExtension, project} from '@deck.gl/core';

import type {Layer} from '@deck.gl/core';
import {
  getBoundsOutline,
  projectBoundsToFlatCommon,
  projectToFlatCommon,
  TILE_SIZE
} from '../utils/projection-utils';

const defaultProps = {
  clipBounds: [0, 0, 1, 1],
  clipByInstance: undefined
};

export type ClipExtensionProps = {
  /** Rectangular bounds to be used for clipping the rendered region, in `[left, bottom, right, top]`.
   * @default [0, 0, 1, 1]
   */
  clipBounds?: Readonly<[number, number, number, number]>;
  /**
   * Controls whether an object is clipped by its anchor (e.g. icon, point) or by its geometry (e.g. path, polygon).
   * If not specified, it is automatically deduced from the layer.
   */
  clipByInstance?: boolean;
};

export type ClipModuleProps = {
  bounds: Readonly<[number, number, number, number]>;
  /** Projected outline of the bounds, two vertices per vec4, for a custom projection */
  polygon: Readonly<[number, number, number, number]>[];
  /** Width of one world copy in flat common space; 0 disables wrapping */
  worldWidth: number;
  /** Number of vertices in `polygon`; 0 clips to `bounds` */
  polygonSize: number;
};

/** Adds support for clipping rendered layers by rectangular bounds. */
export default class ClipExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'ClipExtension';

  getShaders(this: Layer<ClipExtensionProps>) {
    // If `clipByInstance: true`, the entire object is shown/hidden based on its anchor position (done by vertex shader)
    // Otherwise, the object is trimmed by the clip bounds (done by fragment shader)

    // Default behavior: consider a layer instanced if it has attribute `instancePositions`
    let clipByInstance = 'instancePositions' in this.getAttributeManager()!.attributes;
    // Users can override by setting the `clipByInstance` prop
    if (this.props.clipByInstance !== undefined) {
      clipByInstance = Boolean(this.props.clipByInstance);
    }
    this.state.clipByInstance = clipByInstance;

    return {plugins: [clipByInstance ? clipInstancePlugin : clipGeometryPlugin]};
  }

  /* eslint-disable camelcase */
  draw(this: Layer<Required<ClipExtensionProps>>): void {
    const {clipBounds} = this.props;
    const {viewport} = this.context;
    const clipProps = {
      worldWidth: 0,
      polygon: EMPTY_POLYGON,
      polygonSize: 0
    } as ClipModuleProps;
    if (project.isCustomProjection(viewport)) {
      // A custom projection can rotate the bounds and bend their edges. Clip to a polygon on the
      // projected outline. Adjacent bounds, such as tiles, share the vertices of their edges.
      const transform = this.state.clipByInstance
        ? this.usePositionTransforms().transform
        : (position: number[]) => projectToFlatCommon(this, position);
      const outline = getBoundsOutline(this, clipBounds, CLIP_POLYGON_SIZE / 4).map(position =>
        transform ? transform.call(this, position) : position
      );
      setPolygon(clipProps, outline);
    } else if (this.state.clipByInstance) {
      // Instance shaders see packed attributes. Match their CPU conversion when
      // the layer source CRS needs preprojection (e.g. tile-local MVT positions).
      const transform = this.usePositionTransforms().transform;
      if (transform) {
        const corner0 = transform.call(this, [clipBounds[0], clipBounds[1], 0]);
        const corner1 = transform.call(this, [clipBounds[2], clipBounds[3], 0]);
        clipProps.bounds = [
          Math.min(corner0[0], corner1[0]),
          Math.min(corner0[1], corner1[1]),
          Math.max(corner0[0], corner1[0]),
          Math.max(corner0[1], corner1[1])
        ];
      } else {
        clipProps.bounds = clipBounds;
      }
    } else {
      // Pairs with project_common_position_to_flat_continuous() in the vertex shader
      clipProps.bounds = projectBoundsToFlatCommon(this, clipBounds);
      if (viewport.isGeospatial) {
        clipProps.worldWidth = TILE_SIZE;
      }
    }

    this.setShaderModuleProps({clip: clipProps});
  }
}

const EMPTY_POLYGON: ClipModuleProps['polygon'] = Array.from(
  {length: CLIP_POLYGON_SIZE / 2},
  () => [0, 0, 0, 0]
);

/** Sets the polygon, or only its bounding box if a vertex is not finite */
function setPolygon(clipProps: ClipModuleProps, outline: number[][]): void {
  const xs = outline.map(position => position[0]);
  const ys = outline.map(position => position[1]);
  clipProps.bounds = [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)];
  if (clipProps.bounds.every(Number.isFinite)) {
    clipProps.polygon = EMPTY_POLYGON.map((_, i) => [
      xs[2 * i],
      ys[2 * i],
      xs[2 * i + 1],
      ys[2 * i + 1]
    ]);
    clipProps.polygonSize = CLIP_POLYGON_SIZE;
  }
}
