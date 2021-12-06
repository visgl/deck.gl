import ComponentState from '../lifecycle/component-state';

import type Layer from './layer';
import type AttributeManager from './attribute/attribute-manager';
import {LayerProps} from './layer-props';

export default class LayerState<T extends LayerProps> extends ComponentState<T> {
  attributeManager: AttributeManager;
  needsRedraw: boolean;
  /**
   * Sublayers rendered in a previous cycle
   */
  subLayers: any;
  /**
   * If the layer is using the shared instancedPickingColors buffer
   */
  usesPickingColorCache: boolean;

  constructor({attributeManager, layer}: {attributeManager: AttributeManager; layer: Layer}) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
  }

  get layer(): Layer {
    return this.component as Layer;
  }

  set layer(layer: Layer) {
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

  protected _onResolve(propName: keyof T, value: any) {
    const onDataLoad = this.component.props.onDataLoad;
    if (propName === 'data' && onDataLoad) {
      onDataLoad(value, {propName, layer: this.layer});
    }
  }

  protected _onError(propName: keyof T, error: Error) {
    this.layer.raiseError(error, `loading ${propName} of ${this.layer}`);
  }
}
