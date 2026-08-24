// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Layer} from '@deck.gl/core';

export type MapLibreLayerProps = {
  beforeId?: string;
};

export const MAPLIBRE_LAST_LAYER_GROUP_ID = 'deck-maplibre-layer-group-last';

export function getMapLibreLayerGroupId(layer: Layer<MapLibreLayerProps>): string {
  return layer.props.beforeId
    ? `deck-maplibre-layer-group-before:${layer.props.beforeId}`
    : MAPLIBRE_LAST_LAYER_GROUP_ID;
}
