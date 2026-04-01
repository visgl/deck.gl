// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {drawLayer} from './deck-utils';
import type {Map, CustomLayerInterface} from './types';
import type {Deck, Layer} from '@deck.gl/core';

type MapWithDeck = Map & {__deck: Deck};

export type MapboxLayerProps<LayerT extends Layer> = Partial<LayerT['props']> & {
  id: string;
  renderingMode?: '2d' | '3d';
  /* Mapbox v3 Standard style */
  slot?: 'bottom' | 'middle' | 'top';
};

export default class MapboxLayer<LayerT extends Layer> implements CustomLayerInterface {
  id: string;
  type: 'custom';
  renderingMode: '2d' | '3d';
  /* Mapbox v3 Standard style */
  slot?: 'bottom' | 'middle' | 'top';
  map: MapWithDeck | null;
  props: MapboxLayerProps<LayerT>;

  /* eslint-disable no-this-before-super */
  constructor(props: MapboxLayerProps<LayerT>) {
    if (!props.id) {
      throw new Error('Layer must have an unique id');
    }

    this.id = props.id;
    this.type = 'custom';
    this.renderingMode = props.renderingMode || '3d';
    this.slot = props.slot;
    this.map = null;
    this.props = props;
  }

  /* Mapbox custom layer methods */

  onAdd(map: MapWithDeck, gl: WebGL2RenderingContext): void {
    this.map = map;
  }

  onRemove(): void {
    this.map = null;
  }

  setProps(props: MapboxLayerProps<LayerT>) {
    // id cannot be changed
    Object.assign(this.props, props, {id: this.id});
  }

  render(gl, renderParameters) {
    if (!this.map) return;

    drawLayer(this.map.__deck, this.map, this, renderParameters);
  }
}
