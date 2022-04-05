import ComponentState from '../lifecycle/component-state';
import {StatefulComponentProps} from '../lifecycle/component';

import type Layer from './layer';
import type AttributeManager from './attribute/attribute-manager';
import type {LayerProps} from '../types/layer-props';
import type Viewport from '../viewports/viewport';
import type UniformTransitionManager from './uniform-transition-manager';

export type ChangeFlags = {
  // Primary changeFlags, can be strings stating reason for change
  dataChanged: string | false | {startRow: number; endRow?: number}[];
  propsChanged: string | false;
  updateTriggersChanged: Record<string, true> | false;
  extensionsChanged: boolean;
  viewportChanged: boolean;
  stateChanged: boolean;

  // Derived changeFlags
  propsOrDataChanged: boolean;
  somethingChanged: boolean;
};

export default class LayerState<PropsT extends LayerProps> extends ComponentState<PropsT> {
  attributeManager: AttributeManager | null;
  needsRedraw: boolean;
  needsUpdate: boolean;
  /**
   * Sublayers rendered in a previous cycle
   */
  subLayers: Layer[] | null;
  /**
   * If the layer is using the shared instancedPickingColors buffer
   */
  usesPickingColorCache: boolean;
  /**
   * Dirty flags of the layer's props and state
   */
  changeFlags!: ChangeFlags;

  /** The last viewport rendered by this layer */
  viewport?: Viewport;

  uniformTransitions!: UniformTransitionManager;
  /** Populated during uniform transition to replace user-supplied values */
  propsInTransition?: StatefulComponentProps<PropsT>;

  constructor({
    attributeManager,
    layer
  }: {
    attributeManager: AttributeManager | null;
    layer: Layer<PropsT>;
  }) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.needsUpdate = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
  }

  get layer(): Layer<PropsT> {
    return this.component as Layer<PropsT>;
  }

  set layer(layer: Layer<PropsT>) {
    this.component = layer;
  }

  /* Override base Component methods with Layer-specific handling */

  protected _fetch(propName, url: string) {
    const fetch = this.component.props.fetch;
    if (fetch) {
      return fetch(url, {propName, layer: this.layer});
    }
    return super._fetch(propName, url);
  }

  protected _onResolve(propName: keyof PropsT, value: any) {
    const onDataLoad = this.component.props.onDataLoad;
    if (propName === 'data' && onDataLoad) {
      onDataLoad(value, {propName, layer: this.layer});
    }
  }

  protected _onError(propName: keyof PropsT, error: Error) {
    this.layer.raiseError(error, `loading ${propName} of ${this.layer}`);
  }
}
