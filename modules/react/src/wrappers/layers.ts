// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Every public layer class that @deck.gl/layers exports, as a component that takes the
// layer's props and type parameters.
import type {ReactElement} from 'react';
import {
  ArcLayer as DeckArcLayer,
  BitmapLayer as DeckBitmapLayer,
  ColumnLayer as DeckColumnLayer,
  GeoJsonLayer as DeckGeoJsonLayer,
  GridCellLayer as DeckGridCellLayer,
  IconLayer as DeckIconLayer,
  LineLayer as DeckLineLayer,
  PathLayer as DeckPathLayer,
  PointCloudLayer as DeckPointCloudLayer,
  PolygonLayer as DeckPolygonLayer,
  ScatterplotLayer as DeckScatterplotLayer,
  SolidPolygonLayer as DeckSolidPolygonLayer,
  TextLayer as DeckTextLayer
} from '@deck.gl/layers';
import type {
  ArcLayerProps,
  BitmapLayerProps,
  ColumnLayerProps,
  GeoJsonLayerProps,
  GridCellLayerProps,
  IconLayerProps,
  LineLayerProps,
  PathLayerProps,
  PointCloudLayerProps,
  PolygonLayerProps,
  ScatterplotLayerProps,
  SolidPolygonLayerProps,
  TextLayerProps
} from '@deck.gl/layers';

import {type LayerProps, type NoInferProps, renderLayer} from './factories';

/** Renders `ArcLayer` from `@deck.gl/layers`; takes the layer's props. */
export function ArcLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ArcLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckArcLayer(props as LayerProps<typeof DeckArcLayer>));
}

/** Renders `BitmapLayer` from `@deck.gl/layers`; takes the layer's props. */
export function BitmapLayer<ExtraPropsT extends {} = {}>(
  props: Partial<BitmapLayerProps> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckBitmapLayer(props as LayerProps<typeof DeckBitmapLayer>));
}

/** Renders `ColumnLayer` from `@deck.gl/layers`; takes the layer's props. */
export function ColumnLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ColumnLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckColumnLayer(props as LayerProps<typeof DeckColumnLayer>));
}

/** Renders `GeoJsonLayer` from `@deck.gl/layers`; takes the layer's props. */
export function GeoJsonLayer<FeaturePropertiesT = any, ExtraPropsT extends {} = {}>(
  props: Partial<GeoJsonLayerProps<FeaturePropertiesT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckGeoJsonLayer(props as LayerProps<typeof DeckGeoJsonLayer>));
}

/** Renders `GridCellLayer` from `@deck.gl/layers`; takes the layer's props. */
export function GridCellLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<GridCellLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckGridCellLayer(props as LayerProps<typeof DeckGridCellLayer>));
}

/** Renders `IconLayer` from `@deck.gl/layers`; takes the layer's props. */
export function IconLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<IconLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckIconLayer(props as LayerProps<typeof DeckIconLayer>));
}

/** Renders `LineLayer` from `@deck.gl/layers`; takes the layer's props. */
export function LineLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<LineLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckLineLayer(props as LayerProps<typeof DeckLineLayer>));
}

/** Renders `PathLayer` from `@deck.gl/layers`; takes the layer's props. */
export function PathLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<PathLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckPathLayer(props as LayerProps<typeof DeckPathLayer>));
}

/** Renders `PointCloudLayer` from `@deck.gl/layers`; takes the layer's props. */
export function PointCloudLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<PointCloudLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckPointCloudLayer(props as LayerProps<typeof DeckPointCloudLayer>));
}

/** Renders `PolygonLayer` from `@deck.gl/layers`; takes the layer's props. */
export function PolygonLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<PolygonLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckPolygonLayer(props as LayerProps<typeof DeckPolygonLayer>));
}

/** Renders `ScatterplotLayer` from `@deck.gl/layers`; takes the layer's props. */
export function ScatterplotLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ScatterplotLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckScatterplotLayer(props as LayerProps<typeof DeckScatterplotLayer>));
}

/** Renders `SolidPolygonLayer` from `@deck.gl/layers`; takes the layer's props. */
export function SolidPolygonLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<SolidPolygonLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckSolidPolygonLayer(props as LayerProps<typeof DeckSolidPolygonLayer>));
}

/** Renders `TextLayer` from `@deck.gl/layers`; takes the layer's props. */
export function TextLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<TextLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckTextLayer(props as LayerProps<typeof DeckTextLayer>));
}
