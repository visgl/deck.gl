// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {drawLayerGroup} from './deck-utils';
import type {Map, CustomLayerInterface} from './types';
import {assert, type Deck} from '@deck.gl/core';

type MapWithDeck = Map & {__deck: Deck};

export type MapboxLayerGroupProps = {
  id: string;
  renderingMode?: '2d' | '3d';
  /* Mapbox v3 Standard style */
  slot?: 'bottom' | 'middle' | 'top';
  beforeId?: string;
};

export default class MapboxLayerGroup implements CustomLayerInterface {
  id: string;
  type: 'custom';
  renderingMode: '2d' | '3d';
  /* Mapbox v3 Standard style */
  slot?: 'bottom' | 'middle' | 'top';
  beforeId?: string;
  map: MapWithDeck | null;

  get deck(): Deck | null {
    return this.map?.__deck ?? null;
  }

  /* eslint-disable no-this-before-super */
  constructor(props: MapboxLayerGroupProps) {
    assert(props.id, 'id is required');

    this.id = props.id;
    this.type = 'custom';
    this.renderingMode = props.renderingMode || '3d';
    this.slot = props.slot;
    this.beforeId = props.beforeId;
    this.map = null;
  }

  /* Mapbox custom layer methods */

  onAdd(map: MapWithDeck, gl: WebGL2RenderingContext): void {
    this.map = map;
  }

  render(gl, renderParameters) {
    if (!this.deck || !this.map) return;

    drawLayerGroup(this.deck, this.map, this, renderParameters);
  }
}
