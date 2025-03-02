// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license
import ComponentState from '../lifecycle/component-state';

import type Layer from './layer';
import type AttributeManager from './attribute/attribute-manager';
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

export default class LayerState<LayerT extends Layer> extends ComponentState<LayerT> {
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
   * If the layer has picking buffer (pickingColors or instancePickingColors)
   */
  hasPickingBuffer?: boolean;
  /**
   * Dirty flags of the layer's props and state
   */
  changeFlags!: ChangeFlags;

  /** The last viewport rendered by this layer */
  viewport?: Viewport;

  uniformTransitions!: UniformTransitionManager;
  /** Populated during uniform transition to replace user-supplied values */
  propsInTransition?: LayerT['props'];

  constructor({
    attributeManager,
    layer
  }: {
    attributeManager: AttributeManager | null;
    layer: LayerT;
  }) {
    super(layer);
    this.attributeManager = attributeManager;
    this.needsRedraw = true;
    this.needsUpdate = true;
    this.subLayers = null;
    this.usesPickingColorCache = false;
  }

  get layer(): LayerT | null {
    return this.component;
  }

  /* Override base Component methods with Layer-specific handling */

  protected _fetch(propName, url: string) {
    const layer = this.layer;
    const fetch = layer?.props.fetch;
    if (fetch) {
      return fetch(url, {propName, layer});
    }
    return super._fetch(propName, url);
  }

  protected _onResolve(propName: string, value: any) {
    const layer = this.layer;
    if (layer) {
      const onDataLoad = layer.props.onDataLoad;
      if (propName === 'data' && onDataLoad) {
        onDataLoad(value, {propName, layer});
      }
    }
  }

  protected _onError(propName: string, error: Error) {
    const layer = this.layer;
    if (layer) {
      layer.raiseError(error, `loading ${propName} of ${this.layer}`);
    }
  }
}
