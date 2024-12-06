// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {_flatten as flatten} from '@deck.gl/core';
import MapboxLayer from './mapbox-layer';

import type {Deck, LayersList, Layer} from '@deck.gl/core';
import type {Map} from './types';

const UNDEFINED_BEFORE_ID = '__UNDEFINED__';

/** Insert Deck layers into the mapbox Map according to the user-defined order */
// eslint-disable-next-line complexity, max-statements
export function resolveLayers(
  map?: Map,
  deck?: Deck,
  oldLayers?: LayersList,
  newLayers?: LayersList
) {
  // Wait until map style is loaded
  // @ts-ignore non-public map property
  if (!map || !deck || !map.style || !map.style._loaded) {
    return;
  }

  const layers = flatten(newLayers, Boolean) as Layer[];

  if (oldLayers !== newLayers) {
    // Step 1: remove layers that no longer exist
    const prevLayers = flatten(oldLayers, Boolean) as Layer[];
    const prevLayerIds = new Set<string>(prevLayers.map(l => l.id));

    for (const layer of layers) {
      prevLayerIds.delete(layer.id);
    }

    for (const id of prevLayerIds) {
      if (map.getLayer(id)) {
        map.removeLayer(id);
      }
    }
  }

  // Step 2: add missing layers
  for (const layer of layers) {
    const mapboxLayer = map.getLayer(layer.id) as MapboxLayer<Layer>;
    if (mapboxLayer) {
      // Mapbox's map.getLayer() had a breaking change in v3.6.0, see https://github.com/visgl/deck.gl/issues/9086
      // @ts-expect-error not typed
      const layerInstance = mapboxLayer.implementation || mapboxLayer;
      layerInstance.setProps(layer.props);
    } else {
      map.addLayer(
        new MapboxLayer({id: layer.id, deck}),
        // @ts-expect-error beforeId is not defined in LayerProps
        layer.props.beforeId
      );
    }
  }

  // Step 3: check the order of layers
  // If beforeId is defined, the deck layer should always render before the mapbox layer [beforeId]
  // If beforeId is not defined, the deck layer should appear after all mapbox layers
  // When two deck layers share the same beforeId, they are rendered in the order that is passed into Deck props.layers
  // @ts-ignore non-public map property
  const mapLayers: string[] = map.style._order;

  // Group deck layers by beforeId
  const layerGroups: Record<string, string[]> = {};
  for (const layer of layers) {
    // @ts-expect-error beforeId is not defined in LayerProps
    let {beforeId} = layer.props;
    if (!beforeId || !mapLayers.includes(beforeId)) {
      beforeId = UNDEFINED_BEFORE_ID;
    }
    layerGroups[beforeId] = layerGroups[beforeId] || [];
    layerGroups[beforeId].push(layer.id);
  }

  for (const beforeId in layerGroups) {
    const layerGroup = layerGroups[beforeId];
    let lastLayerIndex =
      beforeId === UNDEFINED_BEFORE_ID ? mapLayers.length : mapLayers.indexOf(beforeId);
    let lastLayerId = beforeId === UNDEFINED_BEFORE_ID ? undefined : beforeId;
    for (let i = layerGroup.length - 1; i >= 0; i--) {
      const layerId = layerGroup[i];
      const layerIndex = mapLayers.indexOf(layerId);
      if (layerIndex !== lastLayerIndex - 1) {
        map.moveLayer(layerId, lastLayerId);
        if (layerIndex > lastLayerIndex) {
          // The last layer's index have changed
          lastLayerIndex++;
        }
      }
      lastLayerIndex--;
      lastLayerId = layerId;
    }
  }
}
