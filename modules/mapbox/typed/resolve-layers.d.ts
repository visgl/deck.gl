import type {Deck, LayersList} from '@deck.gl/core';
import type {Map} from 'mapbox-gl';
/** Insert Deck layers into the mapbox Map according to the user-defined order */
export declare function resolveLayers(
  map?: Map,
  deck?: Deck,
  oldLayers?: LayersList,
  newLayers?: LayersList
): void;
// # sourceMappingURL=resolve-layers.d.ts.map
