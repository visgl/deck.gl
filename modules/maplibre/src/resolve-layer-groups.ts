// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_flatten as flatten} from '@deck.gl/core';

import MapLibreLayerGroup from './layer-group';
import {getMapLibreLayerGroupId} from './layer-utils';

import type {Layer, LayersList} from '@deck.gl/core';
import type {Map as MapLibreMap} from 'maplibre-gl';
import type {MapLibreLayerProps} from './layer-utils';

const LAYER_GROUPS = new WeakMap<MapLibreMap, Map<string, MapLibreLayerGroup>>();

// eslint-disable-next-line complexity, max-statements
export function resolveMapLibreLayerGroups(
  map?: MapLibreMap,
  oldLayers?: LayersList,
  newLayers?: LayersList
): void {
  if (!map || !map.isStyleLoaded()) {
    return;
  }

  let layerGroups = LAYER_GROUPS.get(map);
  if (!layerGroups) {
    layerGroups = new Map();
    LAYER_GROUPS.set(map, layerGroups);
  }

  const layers = flatten(newLayers, Boolean) as Layer<MapLibreLayerProps>[];
  const newLayerGroupIds = new Set(layers.map(getMapLibreLayerGroupId));

  if (oldLayers !== newLayers) {
    const previousLayers = flatten(oldLayers, Boolean) as Layer<MapLibreLayerProps>[];
    const previousLayerGroupIds = new Set(previousLayers.map(getMapLibreLayerGroupId));
    for (const groupId of previousLayerGroupIds) {
      if (!newLayerGroupIds.has(groupId) && layerGroups.has(groupId)) {
        if (map.getLayer(groupId)) {
          map.removeLayer(groupId);
        }
        layerGroups.delete(groupId);
      }
    }
  }

  for (const layer of layers) {
    const groupId = getMapLibreLayerGroupId(layer);
    if (layerGroups.has(groupId)) {
      if (!map.getLayer(groupId)) {
        map.addLayer(layerGroups.get(groupId)!, layer.props.beforeId);
      }
      continue;
    }

    if (map.getLayer(groupId)) {
      throw new Error(`MapLibre style already contains a non-deck layer with id ${groupId}`);
    }

    const group = new MapLibreLayerGroup({
      id: groupId,
      beforeId: layer.props.beforeId
    });
    layerGroups.set(groupId, group);
    map.addLayer(group, layer.props.beforeId);
  }

  for (const groupId of newLayerGroupIds) {
    const group = layerGroups.get(groupId)!;
    const mapLayers = map.getLayersOrder();
    const expectedGroupIndex = group.beforeId
      ? mapLayers.indexOf(group.beforeId)
      : mapLayers.length;
    if (expectedGroupIndex < 0) {
      continue;
    }

    const currentGroupIndex = mapLayers.indexOf(groupId);
    if (currentGroupIndex !== expectedGroupIndex - 1) {
      map.moveLayer(groupId, group.beforeId);
    }
  }
}
