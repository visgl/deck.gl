import {Accessor, Layer, LayerContext, LayerExtension} from '@deck.gl/core';
import collision from './shader-module';
import CollisionFilterEffect from './collision-filter-effect';

const defaultProps = {
  getCollisionPriority: {type: 'accessor', value: 0},
  collisionEnabled: true,
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
  draw(this: Layer<CollisionFilterExtensionProps>, {uniforms, context, moduleParameters}: any) {
    const {collisionEnabled} = this.props;
    const {collisionFBO, drawToCollisionMap} = moduleParameters;
    const enabled = collisionEnabled && Boolean(collisionFBO);
    uniforms.collision_enabled = enabled;

    if (drawToCollisionMap) {
      // Override any props with those defined in collisionTestProps
      // @ts-ignore
      this.props = this.clone(this.props.collisionTestProps).props;
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
    attributeManager!.add({
      collisionPriorities: {
        size: 1,
        accessor: 'getCollisionPriority',
        shaderAttributes: {
          collisionPriorities: {divisor: 0},
          instanceCollisionPriorities: {divisor: 1}
        }
      }
    });
  }

  getNeedsPickingBuffer(this: Layer<CollisionFilterExtensionProps>): boolean {
    return this.props.collisionEnabled;
  }
}
