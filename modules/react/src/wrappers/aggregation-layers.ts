// Every public layer class that @deck.gl/aggregation-layers exports, as a component that takes the
// layer's props and type parameters.
import type {ReactElement} from 'react';
import {
  ContourLayer as DeckContourLayer,
  GridLayer as DeckGridLayer,
  HeatmapLayer as DeckHeatmapLayer,
  HexagonLayer as DeckHexagonLayer,
  ScreenGridLayer as DeckScreenGridLayer
} from '@deck.gl/aggregation-layers';
import type {
  ContourLayerProps,
  GridLayerProps,
  HeatmapLayerProps,
  HexagonLayerProps,
  ScreenGridLayerProps
} from '@deck.gl/aggregation-layers';

import {type LayerProps, type NoInferProps, renderLayer} from './factories';

export function ContourLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ContourLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckContourLayer(props as LayerProps<typeof DeckContourLayer>));
}

export function GridLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<GridLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckGridLayer(props as LayerProps<typeof DeckGridLayer>));
}

export function HeatmapLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<HeatmapLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckHeatmapLayer(props as LayerProps<typeof DeckHeatmapLayer>));
}

export function HexagonLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<HexagonLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckHexagonLayer(props as LayerProps<typeof DeckHexagonLayer>));
}

export function ScreenGridLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ScreenGridLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckScreenGridLayer(props as LayerProps<typeof DeckScreenGridLayer>));
}
