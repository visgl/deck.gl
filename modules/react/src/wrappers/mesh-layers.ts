// Every public layer class that @deck.gl/mesh-layers exports, as a component that takes the
// layer's props and type parameters.
import type {ReactElement} from 'react';
import {
  ScenegraphLayer as DeckScenegraphLayer,
  SimpleMeshLayer as DeckSimpleMeshLayer
} from '@deck.gl/mesh-layers';
import type {ScenegraphLayerProps, SimpleMeshLayerProps} from '@deck.gl/mesh-layers';

import {type LayerProps, type NoInferProps, renderLayer} from './factories';

export function ScenegraphLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<ScenegraphLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckScenegraphLayer(props as LayerProps<typeof DeckScenegraphLayer>));
}

export function SimpleMeshLayer<DataT = any, ExtraPropsT extends {} = {}>(
  props: Partial<SimpleMeshLayerProps<DataT>> & NoInferProps<Partial<ExtraPropsT>>
): ReactElement {
  return renderLayer(new DeckSimpleMeshLayer(props as LayerProps<typeof DeckSimpleMeshLayer>));
}
