import {
  Accessor,
  COORDINATE_SYSTEM,
  Layer,
  LayerContext,
  LayerExtension,
  log,
  OPERATION,
  UpdateParameters
} from '@deck.gl/core';
import EffectOrder from '../effect-order';
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
  collideEnabled?: boolean;

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

  isEnabled(layer: Layer<CollideExtensionProps>): boolean {
    return layer.getAttributeManager() !== null;
  }

  getShaders(this: Layer<CollideExtensionProps>): any {
    return {modules: [collide]};
  }

  /* eslint-disable camelcase */
  draw(this: Layer<CollideExtensionProps>, {uniforms, context, moduleParameters}: any) {
    const {collideEnabled, collideGroup} = this.props;
    const {drawToCollideMap, collideMaps = {}} = moduleParameters;
    const collideGroups = Object.keys(collideMaps);
    const enabled = collideEnabled && collideGroup && collideGroups.includes(collideGroup);
    uniforms.collide_enabled = enabled;

    if (drawToCollideMap) {
      uniforms.collide_sort = Boolean(this.props.getCollidePriority);
      uniforms.collide_texture = moduleParameters.dummyCollideMap;

      // Override any props with those defined in collideTestProps
      // @ts-ignore
      this.props = this.clone(this.props.collideTestProps).props;
    } else {
      uniforms.collide_sort = false;
      uniforms.collide_texture = enabled
        ? moduleParameters.collideMaps[collideGroup]
        : moduleParameters.dummyCollideMap;
    }
  }

  initializeState(this: Layer<CollideExtensionProps>, context: LayerContext, extension: this) {
    if (!extension.isEnabled(this)) {
      return;
    }
    this.context.deck?._addDefaultEffect(new CollideEffect(), EffectOrder.CollideEffect);
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

  needsPickingBuffer() {
    return true;
  }
}
