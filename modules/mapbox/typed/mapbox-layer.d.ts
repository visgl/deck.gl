import type {Map, CustomLayerInterface} from 'mapbox-gl';
import type {Deck, Layer} from '@deck.gl/core';
export declare type MapboxLayerProps<LayerT extends Layer> = Partial<LayerT['props']> & {
  id: string;
  renderingMode?: '2d' | '3d';
  deck?: Deck;
};
export default class MapboxLayer<LayerT extends Layer> implements CustomLayerInterface {
  id: string;
  type: 'custom';
  renderingMode: '2d' | '3d';
  map: Map | null;
  deck: Deck | null;
  props: MapboxLayerProps<LayerT>;
  constructor(props: MapboxLayerProps<LayerT>);
  onAdd(map: Map, gl: WebGLRenderingContext): void;
  onRemove(): void;
  setProps(props: MapboxLayerProps<LayerT>): void;
  render(): void;
}
// # sourceMappingURL=mapbox-layer.d.ts.map
