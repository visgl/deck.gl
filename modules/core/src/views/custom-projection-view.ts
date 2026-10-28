// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import View from './view';
import {resolveCRS} from '../utils/crs';
import {deepEqual} from '../utils/deep-equal';
import type {CRSDescriptor, TypeScriptCRSInput} from '@math.gl/projection/core';
import type {CommonViewProps, CommonViewState} from './view';
import CustomProjectionViewport from '../viewports/custom-projection-viewport';
import type {CustomProjectionViewportOptions} from '../viewports/custom-projection-viewport';
import CustomProjectionController from '../controllers/custom-projection-controller';

/** World-coordinate center and zoom with MapView-style pitch and bearing. */
export type CustomProjectionViewState = {
  /** Center in WGS84 longitude/latitude coordinates. Navigation fixes its Z component at zero. */
  center: [number, number, number];
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
  Pick<CustomProjectionViewportOptions, 'orthographic'> & {
    /** Planar CRS identifier, PROJ string, WKT, PROJJSON or spatial reference accepted by math.gl. */
    crs: TypeScriptCRSInput;
  };

/** A planar WGS84 view with a target CRS resolved by math.gl.
 * @experimental Exported as `_CustomProjectionView`; this API may change.
 */
export default class CustomProjectionView extends View<
  CustomProjectionViewState,
  CustomProjectionViewProps
> {
  static displayName = 'CustomProjectionView';
  // Private slots can hold async state even though View seals its public properties.
  #crs?: CRSDescriptor;
  #initialization?: Promise<void>;
  constructor(props: CustomProjectionViewProps) {
    super(props);
  }
  /** Compare CRS definition contents while retaining ordinary View prop equality. */
  equals(view: this): boolean {
    if (this === view) return true;
    if (this.constructor !== view.constructor) return false;
    const {crs, ...props} = this.props;
    const {crs: otherCrs, ...otherProps} = view.props;
    // Structured CRS definitions can nest more deeply than View's layout and controller props.
    return deepEqual(crs, otherCrs, -1) && deepEqual(props, otherProps, 2);
  }
  /** Resolve the target CRS once for this view before creating its synchronous viewport. */
  initialize(): void | Promise<void> {
    if (this.#crs) return;
    if (this.#initialization) return this.#initialization;
    const resolved = resolveCRS(this.props.crs);
    const setCrs = (crs: CRSDescriptor | null) => {
      if (!crs || crs.coordinateFrame !== 'projected') {
        throw new Error('CustomProjectionView requires a projected CRS');
      }
      this.#crs = crs;
    };
    if (resolved instanceof Promise) {
      this.#initialization = resolved.then(setCrs);
      return this.#initialization;
    }
    setCrs(resolved);
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
    if (!dimensions.width || !dimensions.height || !this.#crs) return null;
    const {crs, ...viewportProps} = this.props;
    return new CustomProjectionViewport({
      ...viewState,
      ...viewportProps,
      ...dimensions,
      crs: this.#crs,
      padding: dimensions.padding
    });
  }
}
