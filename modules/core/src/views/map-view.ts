import View, {CommonViewState} from './view';
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import MapController from '../controllers/map-controller';

import type {NumericArray} from '../types/types';

export type MapViewState = {
  /** Longitude of the map center */
  longitude: number;
  /** Latitude of the map center */
  latitude: number;
  /** Zoom level */
  zoom: number;
  /** Pitch (tilt) of the map, in degrees. `0` looks top down */
  pitch?: number;
  /** Bearing (rotation) of the map, in degrees. `0` is north up */
  bearing?: number;
  /** Min zoom, default `0` */
  minZoom?: number;
  /** Max zoom, default `20` */
  maxZoom?: number;
  /** Min pitch, default `0` */
  minPitch?: number;
  /** Max pitch, default `60` */
  maxPitch?: number;
} & CommonViewState;

type MapViewProps = {
  /** Whether to render multiple copies of the map at low zoom levels. Default `false`. */
  repeat?: boolean;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter. */
  nearZMultiplier?: boolean;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter. */
  farZMultiplier?: boolean;
  /** Custom projection matrix */
  projectionMatrix?: NumericArray;
  /** Field of view covered by the camera, in the perspective case. In degrees. If not supplied, will be calculated from `altitude`. */
  fovy?: number;
  /** Distance of the camera relative to viewport height. Default `1.5`. */
  altitude?: number;
  /** Whether to create an orthographic or perspective projection matrix. Default is `false` (perspective projection). */
  orthographic?: boolean;
};

export default class MapView extends View<MapViewState, MapViewProps> {
  static displayName = 'MapView';

  get ViewportType() {
    return WebMercatorViewport;
  }

  get ControllerType() {
    return MapController;
  }
}
