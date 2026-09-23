// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View from './view';
import type {CommonViewProps, CommonViewState} from './view';
import CustomProjectionViewport from '../viewports/custom-projection-viewport';
import type {CustomProjectionViewportOptions} from '../viewports/custom-projection-viewport';
import CustomProjectionController from '../controllers/custom-projection-controller';

/** Common-space target and zoom with MapView-style pitch and bearing. */
export type CustomProjectionViewState = {
  /** Common-space center. Navigation fixes its Z component at zero. */
  target: [number, number, number];
  /** Zoom level; one increment doubles the scale. */
  zoom: number;
  /** Map pitch in degrees. Default 0. */
  pitch?: number;
  /** Map bearing in degrees. Default 0. */
  bearing?: number;
  /** Minimum zoom. Default -Infinity. */
  minZoom?: number;
  /** Maximum zoom. Default Infinity. */
  maxZoom?: number;
  /** Minimum pitch, constrained to [0, 85]. Default 0. */
  minPitch?: number;
  /** Maximum pitch, constrained to [minPitch, 85]. Default 85. */
  maxPitch?: number;
} & CommonViewState;
/** Configuration for a custom planar projection. */
export type CustomProjectionViewProps = CommonViewProps<CustomProjectionViewState> &
  Pick<
    CustomProjectionViewportOptions,
    | 'projection'
    | 'outputBounds'
    | 'inputBounds'
    | 'projectionId'
    | 'resolution'
    | 'zScale'
    | 'getUnitsPerMeter'
    | 'inputUnits'
    | 'orthographic'
  >;

/** A planar view for pluggable input/output coordinate conversion.
 * @experimental Exported as `_CustomProjectionView`; this API may change.
 */
export default class CustomProjectionView extends View<
  CustomProjectionViewState,
  CustomProjectionViewProps
> {
  static displayName = 'CustomProjectionView';
  constructor(props: CustomProjectionViewProps) {
    super(props);
  }
  getViewportType() {
    return CustomProjectionViewport;
  }
  get ControllerType() {
    return CustomProjectionController;
  }
  makeViewport(options: {width: number; height: number; viewState: CustomProjectionViewState}) {
    const viewState = this.filterViewState(options.viewState);
    const dimensions = this.getDimensions(options);
    if (!dimensions.width || !dimensions.height) return null;
    return new CustomProjectionViewport({
      ...viewState,
      ...this.props,
      ...dimensions,
      padding: dimensions.padding
    });
  }
}
