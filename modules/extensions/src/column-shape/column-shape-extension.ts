// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * ColumnShapeExtension - Adds per-instance bevel shapes and radius scaling to ColumnLayer.
 *
 * This extension enables per-instance dome, cone, and custom bevel shapes on top of
 * ColumnLayer columns, with per-instance radius multipliers. Useful for tree canopy
 * visualizations, 3D bar charts with styled caps, and architectural column rendering.
 *
 * Originally inspired by:
 * - https://github.com/visgl/deck.gl-community/pull/470 (ExperimentalColumnLayer)
 * - https://github.com/visgl/deck.gl/pull/9933 (getBevel & getRadius proposal)
 */

import {LayerExtension} from '@deck.gl/core';
import {columnShapeShaders, ColumnShapeModuleProps} from './shader-module';
import {createDomeColumnAttributes} from './dome-column-geometry';

import type {Layer, LayerContext, DefaultProps, Accessor, UpdateParameters} from '@deck.gl/core';

/** Bevel shape type - can be a string shortcut or a custom configuration object */
export type BevelProp =
  | 'flat'
  | 'dome'
  | 'cone'
  | {
      /** Number of bevel segments: 0-1 = flat, 2 = cone, 3+ = dome */
      segs?: number;
      /** Bevel height in world units */
      height?: number;
      /** Curve factor: 0 = standard, negative = concave, positive = convex */
      bulge?: number;
    };

/** Parsed bevel parameters for shader consumption */
type BevelParams = {
  segs: number;
  height: number;
  bulge: number;
};

const defaultProps: DefaultProps<ColumnShapeExtensionProps> = {
  getBevel: {type: 'accessor', value: 'flat'},
  getRadius: {type: 'accessor', value: 1}
};

export type ColumnShapeExtensionProps<DataT = any> = {
  /**
   * Bevel shape for the top cap of each column.
   *
   * Supported values:
   * - `'flat'`: No bevel (default flat top)
   * - `'dome'`: Rounded dome with smooth normals
   * - `'cone'`: Pointed cone shape
   * - `{segs, height, bulge}`: Full control over shape parameters
   *   - `segs`: Number of bevel segments (0-1 = flat, 2 = cone, 3+ = dome)
   *   - `height`: Bevel height in world units
   *   - `bulge`: Curve factor (-1 to 1+), 0 = standard dome
   *
   * @default 'flat'
   */
  getBevel?: Accessor<DataT, BevelProp>;
  /**
   * Per-instance radius multiplier.
   * The final radius = radiusScale * getRadius(d)
   *
   * @default 1
   */
  getRadius?: Accessor<DataT, number>;
};

/** Parses a BevelProp value into shader-compatible parameters */
function parseBevelProp(bevel: BevelProp): BevelParams {
  if (typeof bevel === 'string') {
    switch (bevel) {
      case 'dome':
        return {segs: 8, height: 1, bulge: 0};
      case 'cone':
        return {segs: 2, height: 1, bulge: 0};
      case 'flat':
      default:
        return {segs: 0, height: 0, bulge: 0};
    }
  }
  return {
    segs: bevel.segs ?? 0,
    height: bevel.height ?? 0,
    bulge: bevel.bulge ?? 0
  };
}

export default class ColumnShapeExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'ColumnShapeExtension';

  isEnabled(layer: Layer<ColumnShapeExtensionProps>): boolean {
    return layer.getAttributeManager() !== null;
  }

  getShaders(this: Layer<ColumnShapeExtensionProps>, extension: this): any {
    if (!extension.isEnabled(this)) {
      return null;
    }
    return {
      modules: [columnShapeShaders]
    };
  }

  initializeState(
    this: Layer<ColumnShapeExtensionProps>,
    _context: LayerContext,
    extension: this
  ): void {
    if (!extension.isEnabled(this)) {
      return;
    }

    const attributeManager = this.getAttributeManager()!;

    attributeManager.addInstanced({
      instanceBevelSegs: {
        size: 1,
        accessor: 'getBevel',
        transform: (bevel: BevelProp) => parseBevelProp(bevel).segs,
        defaultValue: 0
      },
      instanceBevelHeights: {
        size: 1,
        accessor: 'getBevel',
        transform: (bevel: BevelProp) => parseBevelProp(bevel).height,
        defaultValue: 0
      },
      instanceBevelBulge: {
        size: 1,
        accessor: 'getBevel',
        transform: (bevel: BevelProp) => parseBevelProp(bevel).bulge,
        defaultValue: 0
      },
      instanceRadii: {
        size: 1,
        accessor: 'getRadius',
        defaultValue: 1
      }
    });

    // Monkey-patch getGeometry to return dome geometry instead of flat-cap geometry.
    // ColumnLayer calls getGeometry during _updateGeometry; our patched version
    // returns geometry with concentric bevel rings for dome/cone shapes.
    const layer = this as any;
    const originalGetGeometry = layer.getGeometry.bind(layer);

    layer.getGeometry = (
      diskResolution: number,
      vertices: number[] | undefined,
      hasThickness: boolean
    ) => {
      // Use original geometry for non-extruded, custom vertices, or flat cases
      if (!hasThickness || vertices) {
        return originalGetGeometry(diskResolution, vertices, hasThickness);
      }

      // Get a real Geometry instance from the original method, then replace
      // its attribute buffers with our dome data.
      const geometry = originalGetGeometry(diskResolution, undefined, true);

      const bevelSegments = Math.max(3, Math.floor(diskResolution / 4));
      const {positions, normals} = createDomeColumnAttributes({
        radius: 1,
        height: 2,
        nradial: diskResolution,
        bevelSegments,
        bevelHeight: 1
      });

      // Replace geometry attribute buffers with dome data
      geometry.attributes.POSITION = {size: 3, value: positions};
      geometry.attributes.NORMAL = {size: 3, value: normals};
      geometry.vertexCount = positions.length / 3;

      return geometry;
    };
  }

  updateState(
    this: Layer<ColumnShapeExtensionProps>,
    _params: UpdateParameters<Layer<ColumnShapeExtensionProps>>,
    extension: this
  ): void {
    if (!extension.isEnabled(this)) {
      return;
    }

    const props = this.props;
    const bevelEnabled = props.getBevel !== undefined && props.getBevel !== 'flat';

    const columnShapeProps: ColumnShapeModuleProps = {
      bevelEnabled,
      bevelTopZ: 0
    };
    this.setShaderModuleProps({columnShape: columnShapeProps});
  }
}
