// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {assert} from '@deck.gl/core';

import {
  drawMapLibreLayerGroup,
  getMapLibreRenderParameters,
  getMapLibreDeckInstance
} from './deck-utils';

import type {CustomLayerInterface, CustomRenderMethodInput, Map as MapLibreMap} from 'maplibre-gl';

export type MapLibreLayerGroupProps = {
  id: string;
  renderingMode?: '2d' | '3d';
  beforeId?: string;
};

export default class MapLibreLayerGroup implements CustomLayerInterface {
  readonly id: string;
  readonly type = 'custom' as const;
  readonly renderingMode: '2d' | '3d';
  readonly beforeId?: string;

  private map: MapLibreMap | null = null;

  constructor(props: MapLibreLayerGroupProps) {
    assert(props.id, 'id is required');
    this.id = props.id;
    this.renderingMode = props.renderingMode || '3d';
    this.beforeId = props.beforeId;
  }

  onAdd(map: MapLibreMap): void {
    this.map = map;
  }

  onRemove(): void {
    this.map = null;
  }

  render(_gl: WebGL2RenderingContext, parameters: CustomRenderMethodInput): void {
    if (!this.map) {
      return;
    }

    const deck = getMapLibreDeckInstance(this.map);
    if (!deck) {
      return;
    }

    drawMapLibreLayerGroup(deck, this.map, this, getMapLibreRenderParameters(parameters));
  }
}
