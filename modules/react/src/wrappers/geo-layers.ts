// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Every public layer class that @deck.gl/geo-layers exports, as a component that takes the
// layer's props and type parameters.
import type {ReactElement} from 'react';
import {
  A5Layer as DeckA5Layer,
  GeohashLayer as DeckGeohashLayer,
  GreatCircleLayer as DeckGreatCircleLayer,
  H3ClusterLayer as DeckH3ClusterLayer,
  H3HexagonLayer as DeckH3HexagonLayer,
  MVTLayer as DeckMVTLayer,
  QuadkeyLayer as DeckQuadkeyLayer,
  S2Layer as DeckS2Layer,
  TerrainLayer as DeckTerrainLayer,
  Tile3DLayer as DeckTile3DLayer,
  TileLayer as DeckTileLayer,
  TripsLayer as DeckTripsLayer,
  _WMSLayer as DeckWMSLayer
} from '@deck.gl/geo-layers';
import type {
  A5LayerProps,
  GeohashLayerProps,
  GreatCircleLayerProps,
  H3ClusterLayerProps,
  H3HexagonLayerProps,
  MVTLayerProps,
  QuadkeyLayerProps,
  S2LayerProps,
  TerrainLayerProps,
  Tile3DLayerProps,
  TileLayerProps,
  TripsLayerProps,
  WMSLayerProps
} from '@deck.gl/geo-layers';

import {type LayerProps, type NoInferProps, renderLayer} from './factories';

/** Renders `A5Layer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function A5Layer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<A5LayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckA5Layer(props as LayerProps<typeof DeckA5Layer>));
}

/** Renders `GeohashLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function GeohashLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<GeohashLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckGeohashLayer(props as LayerProps<typeof DeckGeohashLayer>));
}

/** Renders `GreatCircleLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function GreatCircleLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<GreatCircleLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckGreatCircleLayer(props as LayerProps<typeof DeckGreatCircleLayer>));
}

/** Renders `H3ClusterLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function H3ClusterLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<H3ClusterLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckH3ClusterLayer(props as LayerProps<typeof DeckH3ClusterLayer>));
}

/** Renders `H3HexagonLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function H3HexagonLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<H3HexagonLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckH3HexagonLayer(props as LayerProps<typeof DeckH3HexagonLayer>));
}

/** Renders `MVTLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function MVTLayer<FeaturePropertiesT = any, ExtraPropsT extends {} = {}>(
  props: Partial<MVTLayerProps<FeaturePropertiesT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckMVTLayer(props as LayerProps<typeof DeckMVTLayer>));
}

/** Renders `QuadkeyLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function QuadkeyLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<QuadkeyLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckQuadkeyLayer(props as LayerProps<typeof DeckQuadkeyLayer>));
}

/** Renders `S2Layer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function S2Layer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<S2LayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckS2Layer(props as LayerProps<typeof DeckS2Layer>));
}

/** Renders `TerrainLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function TerrainLayer<ExtraPropsT extends {} = {}>(
  props: Partial<TerrainLayerProps> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckTerrainLayer(props as LayerProps<typeof DeckTerrainLayer>));
}

/** Renders `Tile3DLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function Tile3DLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<Tile3DLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckTile3DLayer(props as LayerProps<typeof DeckTile3DLayer>));
}

/** Renders `TileLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function TileLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<TileLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckTileLayer(props as LayerProps<typeof DeckTileLayer>));
}

/** Renders `TripsLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function TripsLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<TripsLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckTripsLayer(props as LayerProps<typeof DeckTripsLayer>));
}

/** Renders `_WMSLayer` from `@deck.gl/geo-layers`; takes the layer's props. */
export function _WMSLayer<ExtraPropsT extends {} = {}>(
  props: Partial<WMSLayerProps> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckWMSLayer(props as LayerProps<typeof DeckWMSLayer>));
}
