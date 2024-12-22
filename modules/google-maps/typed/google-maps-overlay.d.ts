// / <reference types="google.maps" />
import type {DeckProps} from '@deck.gl/core';
export declare type GoogleMapsOverlayProps = DeckProps & {
  interleaved?: boolean;
};
export default class GoogleMapsOverlay {
  private props;
  private _map;
  private _deck;
  private _overlay;
  constructor(props: GoogleMapsOverlayProps);
  /** Add/remove the overlay from a map. */
  setMap(map: google.maps.Map | null): void;
  /**
   * Update (partial) props.
   */
  setProps(props: Partial<GoogleMapsOverlayProps>): void;
  /** Equivalent of `deck.pickObject`. */
  pickObject(params: any): import('@deck.gl/core').PickingInfo;
  /** Equivalent of `deck.pickObjects`.  */
  pickMultipleObjects(params: any): import('@deck.gl/core').PickingInfo[];
  /** Equivalent of `deck.pickMultipleObjects`. */
  pickObjects(params: any): import('@deck.gl/core').PickingInfo[];
  /** Remove the overlay and release all underlying resources. */
  finalize(): void;
  _createOverlay(map: google.maps.Map): void;
  _onAdd(): void;
  _onContextRestored({gl}: {gl: any}): void;
  _onContextLost(): void;
  _onRemove(): void;
  _onDrawRaster(): void;
  _onDrawVectorInterleaved({gl, transformer}: {gl: any; transformer: any}): void;
  _onDrawVectorOverlay({transformer}: {transformer: any}): void;
}
// # sourceMappingURL=google-maps-overlay.d.ts.map
