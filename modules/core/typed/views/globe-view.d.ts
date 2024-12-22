import View, {CommonViewState} from './view';
import GlobeViewport from '../viewports/globe-viewport';
import GlobeController from '../controllers/globe-controller';
export declare type GlobeViewState = {
  /** Longitude of the map center */
  longitude: number;
  /** Latitude of the map center */
  latitude: number;
  /** Zoom level */
  zoom: number;
  /** Min zoom, default `0` */
  minZoom?: number;
  /** Max zoom, default `20` */
  maxZoom?: number;
} & CommonViewState;
declare type GlobeViewProps = {
  /** The resolution at which to turn flat features into 3D meshes, in degrees. Smaller numbers will generate more detailed mesh. Default `10`. */
  resolution?: number;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter. */
  nearZMultiplier?: boolean;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter. */
  farZMultiplier?: boolean;
  /** Distance of the camera relative to viewport height. Default `1.5`. */
  altitude?: number;
};
export default class GlobeView extends View<GlobeViewState, GlobeViewProps> {
  static displayName: string;
  get ViewportType(): typeof GlobeViewport;
  get ControllerType(): typeof GlobeController;
}
export {};
// # sourceMappingURL=globe-view.d.ts.map
