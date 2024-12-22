import {Deck} from '@deck.gl/core';
import type {MapViewState} from '@deck.gl/core';
import type MapboxLayer from './mapbox-layer';
import type {Map} from 'mapbox-gl';
export declare function getDeckInstance({
  map,
  gl,
  deck
}: {
  map: Map & {
    __deck?: Deck | null;
  };
  gl: WebGLRenderingContext;
  deck?: Deck;
}): Deck;
export declare function addLayer(deck: Deck, layer: MapboxLayer<any>): void;
export declare function removeLayer(deck: Deck, layer: MapboxLayer<any>): void;
export declare function updateLayer(deck: Deck, layer: MapboxLayer<any>): void;
export declare function drawLayer(deck: Deck, map: Map, layer: MapboxLayer<any>): void;
export declare function getViewState(map: Map): MapViewState & {
  repeat: boolean;
  padding: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  };
};
// # sourceMappingURL=deck-utils.d.ts.map
