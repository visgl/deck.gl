// / <reference types="google.maps" />
import {Deck} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
/**
 * Get a new deck instance
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 * @param [deck] (Deck) - a previously created instances
 */
export declare function createDeckInstance(
  map: google.maps.Map,
  overlay: google.maps.OverlayView | google.maps.WebGLOverlayView,
  deck: Deck | null | undefined,
  props: any
): Deck;
/**
 * Safely remove a deck instance
 * @param deck (Deck) - a previously created instances
 */
export declare function destroyDeckInstance(deck: Deck): void;
/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param overlay (google.maps.OverlayView) - A maps Overlay instance
 */
export declare function getViewPropsFromOverlay(
  map: google.maps.Map,
  overlay: google.maps.OverlayView
):
  | {
      width: number;
      height: number;
      left: number;
      top: number;
      zoom?: undefined;
      bearing?: undefined;
      pitch?: undefined;
      latitude?: undefined;
      longitude?: undefined;
    }
  | {
      width: number;
      height: number;
      left: number;
      top: number;
      zoom: number;
      bearing: number;
      pitch: number;
      latitude: number;
      longitude: number;
    };
/**
 * Get the current view state
 * @param map (google.maps.Map) - The parent Map instance
 * @param transformer (google.maps.CoordinateTransformer) - A CoordinateTransformer instance
 */
export declare function getViewPropsFromCoordinateTransformer(
  map: google.maps.Map,
  transformer: google.maps.CoordinateTransformer
): {
  width: number;
  height: number;
  viewState: {
    altitude: number;
    bearing: number;
    latitude: number;
    longitude: number;
    pitch: number;
    projectionMatrix: Matrix4;
    repeat: boolean;
    zoom: number;
  };
};
// # sourceMappingURL=utils.d.ts.map
