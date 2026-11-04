// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  Accessor,
  BinaryAttribute,
  Layer,
  LayerContext,
  LayerExtension,
  UpdateParameters
} from '@deck.gl/core';
import {collisionPlugin} from './shader-module';
import CollisionFilterEffect from './collision-filter-effect';

const defaultProps = {
  getCollisionPriority: {type: 'accessor', value: 0},
  collisionEnabled: true,
  collisionGreedy: false,
  collisionGroup: {type: 'string', value: 'default'},
  collisionTestProps: {}
};

export type CollisionFilterExtensionProps<DataT = any> = {
  /**
   * Accessor for collision priority, clamped to the range [-1000, 1000]. Features with higher values are shown preferentially.
   */
  getCollisionPriority?: Accessor<DataT, number>;

  /**
   * Enable/disable collisions. If collisions are disabled, all objects are rendered.
   * @default true
   */
  collisionEnabled: boolean;

  /**
   * Collision group this layer belongs to. If it is not set, the 'default' collision group is used
   */
  collisionGroup?: string;

  /**
   * Place text labels in descending priority, so that rejected labels do not reserve space.
   * This reads label bounds back from the GPU and places them on the CPU whenever the collision
   * map redraws. Enabling it on any text layer applies to every text layer in its
   * `collisionGroup`. It has no effect on groups without text. WebGL only.
   * @default false
   */
  collisionGreedy?: boolean;

  /**
   * Props to override when rendering collision map
   */
  collisionTestProps?: {};

  /**
   * @internal Id of a TextLayer with the same data whose collision result this TextLayer's labels
   * use, for labels that draw nothing in the collision pass, such as a secondary label.
   */
  _collisionLabelId?: string;
};

/**
 * Binary data can set picking colors from row indexes, such as GeoJsonLayer's global feature ids,
 * which can exceed the object count. Reads the first `rowCount` values with the attribute's
 * offset and stride. Returns 0 if the indexes are not readable on the CPU.
 */
function getRowIndexCount(data: unknown, rowCount: number): number {
  const rowIndexes = (data as {attributes?: {rowIndexes?: unknown}} | null)?.attributes?.rowIndexes;
  const attribute = (ArrayBuffer.isView(rowIndexes) ? {value: rowIndexes} : rowIndexes) as
    | BinaryAttribute
    | undefined;
  const value = attribute?.value;
  if (!ArrayBuffer.isView(value) || value instanceof DataView) {
    return 0;
  }
  // Offset and stride are in bytes
  const {BYTES_PER_ELEMENT} = value;
  const start = Math.floor((attribute!.offset || 0) / BYTES_PER_ELEMENT);
  const step = Math.floor((attribute!.stride || 0) / BYTES_PER_ELEMENT) || attribute!.size || 1;
  const end = Math.min(value.length, start + rowCount * step);
  let max = -1;
  for (let i = start; i < end; i += step) {
    max = Math.max(max, value[i]);
  }
  return max + 1;
}

/** Allows layers to hide overlapping objects. */
export default class CollisionFilterExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'CollisionFilterExtension';

  getShaders(this: Layer<CollisionFilterExtensionProps>): any {
    return {plugins: [collisionPlugin]};
  }

  /* eslint-disable camelcase */
  draw(this: Layer<CollisionFilterExtensionProps>, {shaderModuleProps}: any) {
    if (shaderModuleProps.collision?.drawToCollisionVisibility) {
      const {visibilityFBO} = shaderModuleProps.collision;
      this.context.renderPass.setParameters({
        viewport: [0, 0, visibilityFBO.width, visibilityFBO.height]
      });
    }
    if (shaderModuleProps.collision?.drawToCollisionMap) {
      // Avoid constructing a layer when the overrides are empty or unchanged.
      const {collisionTestProps} = this.props;
      for (const key in collisionTestProps) {
        if (collisionTestProps[key] !== this.props[key]) {
          // @ts-ignore
          this.props = this.clone(collisionTestProps).props;
          break;
        }
      }
    }
  }

  initializeState(
    this: Layer<CollisionFilterExtensionProps>,
    context: LayerContext,
    extension: this
  ) {
    if (this.getAttributeManager() === null) {
      return;
    }
    this.context.deck?._addDefaultEffect(new CollisionFilterEffect());
    const attributeManager = this.getAttributeManager();
    // Text glyphs share collision bounds and visibility per label. Allocate it only when the extension is used.
    if ('getCollisionRect' in this.props) {
      attributeManager!.add({
        collisionStartIndices: {
          size: 1,
          stepMode: 'dynamic',
          accessor: (_, {index}) => index,
          // Replacement layers inherit this attribute, so read the current layer's start indices
          transform(this: Layer, index: number) {
            return this.props.startIndices?.[index] ?? index;
          }
        },
        instanceCollisionRects: {
          size: 4,
          stepMode: 'dynamic',
          accessor: 'getCollisionRect'
        }
      });
    }
    attributeManager!.add({
      collisionPriorities: {
        size: 1,
        stepMode: 'dynamic',
        accessor: 'getCollisionPriority'
      }
    });
  }

  updateState(
    this: Layer<CollisionFilterExtensionProps>,
    {props, changeFlags}: UpdateParameters<Layer<CollisionFilterExtensionProps>>
  ) {
    // Runs after the layer's own updateState, so the instance count is current
    const rowCount = this.getNumInstances();
    if (changeFlags.dataChanged || rowCount !== this.state.collisionInstanceCount) {
      this.setState({
        collisionInstanceCount: rowCount,
        collisionRowCount: getRowIndexCount(props.data, rowCount)
      });
    }
  }

  getNeedsPickingBuffer(this: Layer<CollisionFilterExtensionProps>): boolean {
    return this.props.collisionEnabled;
  }
}
