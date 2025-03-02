// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View, {CommonViewState, CommonViewProps} from './view';
import GlobeViewport from '../viewports/globe-viewport';
import WebMercatorViewport from '../viewports/web-mercator-viewport';
import GlobeController from '../controllers/globe-controller';

export type GlobeViewState = {
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
  /** The near plane position */
  nearZ?: number;
  /** The far plane position */
  farZ?: number;
} & CommonViewState;

export type GlobeViewProps = {
  /** The resolution at which to turn flat features into 3D meshes, in degrees. Smaller numbers will generate more detailed mesh. Default `10`. */
  resolution?: number;
  /** Scaler for the near plane, 1 unit equals to the height of the viewport. Default to `0.1`. Overwrites the `near` parameter. */
  nearZMultiplier?: number;
  /** Scaler for the far plane, 1 unit equals to the distance from the camera to the top edge of the screen. Default to `1.01`. Overwrites the `far` parameter. */
  farZMultiplier?: number;
  /** Distance of the camera relative to viewport height. Default `1.5`. */
  altitude?: number;
} & CommonViewProps<GlobeViewState>;

export default class GlobeView extends View<GlobeViewState, GlobeViewProps> {
  static displayName = 'GlobeView';

  constructor(props: GlobeViewProps = {}) {
    super(props);
  }

  getViewportType(viewState: GlobeViewState) {
    return viewState.zoom > 12 ? WebMercatorViewport : GlobeViewport;
  }

  get ControllerType() {
    return GlobeController;
  }
}
