import {Deck} from '@deck.gl/core';
import type {Map, IControl} from 'mapbox-gl';
import type {DeckProps} from '@deck.gl/core';
export declare type MapboxOverlayProps = Omit<
  DeckProps,
  | 'width'
  | 'height'
  | 'gl'
  | 'parent'
  | 'canvas'
  | '_customRender'
  | 'viewState'
  | 'initialViewState'
  | 'controller'
>;
/**
 * Implements Mapbox [IControl](https://docs.mapbox.com/mapbox-gl-js/api/markers/#icontrol) interface
 * Renders deck.gl layers over the base map and automatically synchronizes with the map's camera
 */
export default class MapboxOverlay implements IControl {
  private _props;
  private _deck?;
  private _map?;
  private _container?;
  private _interleaved;
  constructor(
    props: MapboxOverlayProps & {
      interleaved?: boolean;
    }
  );
  /** Update (partial) props of the underlying Deck instance. */
  setProps(props: MapboxOverlayProps): void;
  /** Called when the control is added to a map */
  onAdd(map: Map): HTMLDivElement;
  private _onAddOverlaid;
  private _onAddInterleaved;
  /** Called when the control is removed from a map */
  onRemove(): void;
  private _onRemoveOverlaid;
  private _onRemoveInterleaved;
  getDefaultPosition(): string;
  /** Forwards the Deck.pickObject method */
  pickObject(params: Parameters<Deck['pickObject']>[0]): ReturnType<Deck['pickObject']>;
  /** Forwards the Deck.pickMultipleObjects method */
  pickMultipleObjects(
    params: Parameters<Deck['pickMultipleObjects']>[0]
  ): ReturnType<Deck['pickMultipleObjects']>;
  /** Forwards the Deck.pickObjects method */
  pickObjects(params: Parameters<Deck['pickObjects']>[0]): ReturnType<Deck['pickObjects']>;
  /** Remove from map and releases all resources */
  finalize(): void;
  private _handleStyleChange;
  private _updateContainerSize;
  private _updateViewState;
  private _handleMouseEvent;
}
// # sourceMappingURL=mapbox-overlay.d.ts.map
