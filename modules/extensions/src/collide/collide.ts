import {Accessor, Layer, LayerContext, LayerExtension} from '@deck.gl/core';
import collide from './shader-module';
import CollideEffect from './collide-effect';

const defaultProps = {
  getCollidePriority: {type: 'accessor', value: 0},
  collideEnabled: true,
  collideGroup: {type: 'string', value: 'default'},
  collideTestProps: {}
};

export type CollideExtensionProps<DataT = any> = {
  /**
   * Accessor for collision priority. Must return a number in the range -1000 -> 1000. Features with higher values are shown preferentially.
   */
  getCollidePriority?: Accessor<DataT, number>;

  /**
   * Enable/disable collisions. If collisions are disabled, all objects are rendered.
   * @default true
   */
  collideEnabled: boolean;

  /**
   * Collision group this layer belongs to. If it is not set, the 'default' collision group is used
   */
  collideGroup?: string;

  /**
   * Props to override when rendering collision map
   */
  collideTestProps?: {};
};

/** Allows layers to hide overlapping objects. */
export default class CollideExtension extends LayerExtension {
  static defaultProps = defaultProps;
  static extensionName = 'CollideExtension';

  getShaders(this: Layer<CollideExtensionProps>): any {
    return {modules: [collide]};
  }

  /* eslint-disable camelcase */
  draw(this: Layer<CollideExtensionProps>, {uniforms, context, moduleParameters}: any) {
    const {collideEnabled} = this.props;
    const {collideFBO, drawToCollideMap} = moduleParameters;
    const enabled = collideEnabled && Boolean(collideFBO);
    uniforms.collide_enabled = enabled;

    if (drawToCollideMap) {
      // Override any props with those defined in collideTestProps
      // @ts-ignore
      this.props = this.clone(this.props.collideTestProps).props;
    }
  }

  initializeState(this: Layer<CollideExtensionProps>, context: LayerContext, extension: this) {
    if (this.getAttributeManager() === null) {
      return;
    }
    this.context.deck?._addDefaultEffect(new CollideEffect());
    const attributeManager = this.getAttributeManager();
    attributeManager!.add({
      collidePriorities: {
        size: 1,
        accessor: 'getCollidePriority',
        shaderAttributes: {
          collidePriorities: {divisor: 0},
          instanceCollidePriorities: {divisor: 1}
        }
      }
    });
  }

  getNeedsPickingBuffer(this: Layer<CollideExtensionProps>): boolean {
    return this.props.collideEnabled;
  }
}
