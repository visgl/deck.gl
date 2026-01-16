// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_flatten as flatten} from '@deck.gl/core';

import type {Layer, LayersList} from '@deck.gl/core';
import type {Map, LayerOverlayProps} from './types';
import MapboxLayerGroup from './mapbox-layer-group';

const UNDEFINED_BEFORE_ID = '__UNDEFINED__';

function getLayerGroupId(layer: Layer<LayerOverlayProps>): string {
  if (layer.props.beforeId) {
    return `deck-layer-group-before:${layer.props.beforeId}`;
  } else if (layer.props.slot) {
    return `deck-layer-group-slot:${layer.props.slot}`;
  }
  return 'deck-layer-group-last';
}

/** Group Deck layers into buckets (by beforeId or slot) and insert them
 *  into the mapbox Map according to the user-defined order
 **/
// eslint-disable-next-line complexity, max-statements
export function resolveLayerGroups(map?: Map, oldLayers?: LayersList, newLayers?: LayersList) {
  // Wait until map style is loaded
  // @ts-ignore non-public map property
  if (!map || !map.style || !map.style._loaded) {
    return;
  }

  const layers = flatten(newLayers, Boolean) as Layer<LayerOverlayProps>[];

  if (oldLayers !== newLayers) {
    // Step 1: remove "group" layers that no longer exist
    const prevLayers = flatten(oldLayers, Boolean) as Layer<LayerOverlayProps>[];
    const prevLayerGroupIds = new Set<string>(prevLayers.map(l => getLayerGroupId(l)));
    const newLayerGroupIds = new Set<string>(layers.map(l => getLayerGroupId(l)));

    for (const groupId of prevLayerGroupIds) {
      if (!newLayerGroupIds.has(groupId)) {
        if (map.getLayer(groupId)) {
          map.removeLayer(groupId);
        }
      }
    }
  }

  // Step 2: add missing "group" layers
  const layerGroups: Record<string, MapboxLayerGroup> = {};
  for (const layer of layers) {
    const groupId = getLayerGroupId(layer);
    const mapboxGroup = map.getLayer(groupId) as MapboxLayerGroup;
    if (mapboxGroup) {
      // Mapbox's map.getLayer() had a breaking change in v3.6.0, see https://github.com/visgl/deck.gl/issues/9086
      // @ts-expect-error not typed
      const groupInstance = mapboxGroup.implementation || mapboxGroup;
      layerGroups[groupId] = groupInstance;
    } else {
      const newGroup = new MapboxLayerGroup({
        id: groupId,
        slot: layer.props.slot,
        beforeId: layer.props.beforeId
      });
      layerGroups[groupId] = newGroup;
      map.addLayer(newGroup, layer.props.beforeId);
    }
  }

  // Step 3: check the order of layers
  // If beforeId move "group" layers to proper position in the mapbox layer order
  // @ts-ignore non-public map property
  const mapLayers: string[] = map.style._order;

  for (const [groupId, group] of Object.entries(layerGroups)) {
    const beforeId = group.beforeId || UNDEFINED_BEFORE_ID;

    const expectedGroupIndex =
      beforeId === UNDEFINED_BEFORE_ID ? mapLayers.length : mapLayers.indexOf(beforeId);

    const currentGropupIndex = mapLayers.indexOf(groupId);
    if (currentGropupIndex !== expectedGroupIndex - 1) {
      const moveBeforeId = beforeId === UNDEFINED_BEFORE_ID ? undefined : beforeId;
      map.moveLayer(groupId, moveBeforeId);
    }
  }
}
