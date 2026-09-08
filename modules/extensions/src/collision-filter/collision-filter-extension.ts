// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Accessor, Layer, LayerContext, LayerExtension} from '@deck.gl/core';
import collision from './shader-module';
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
   * Accessor for collision priority. Must return a number in the range -1000 -> 1000. Features with higher values are shown preferentially.
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
   * Place text in priority order, allowing labels to reuse space from rejected labels.
   * Uses GPU readback and CPU placement. Enabling this on any text layer applies to
   * all text layers in its collisionGroup. Has no effect on groups without text.
   * @default false
   */
  collisionGreedy?: boolean;

  /**
   * Props to override when rendering collision map
   */
  collisionTestProps?: {};
};

/** Allows layers to hide overlapping objects. */
export default class CollisionFilterExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'CollisionFilterExtension';

  getShaders(this: Layer<CollisionFilterExtensionProps>): any {
    return {modules: [collision]};
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
          accessor: (_, {index}) => this.props.startIndices?.[index] ?? index
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

  getNeedsPickingBuffer(this: Layer<CollisionFilterExtensionProps>): boolean {
    return this.props.collisionEnabled;
  }
}
