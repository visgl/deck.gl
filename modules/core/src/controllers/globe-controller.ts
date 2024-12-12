// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {clamp} from '@math.gl/core';
import Controller, {ControllerProps} from './controller';

import {MapState, MapStateProps} from './map-controller';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';

import {MAX_LATITUDE} from '@math.gl/web-mercator';

class GlobeState extends MapState {
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  applyConstraints(props: Required<MapStateProps>): Required<MapStateProps> {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = clamp(zoom, minZoom, maxZoom);

    const {longitude, latitude} = props;
    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = clamp(latitude, -MAX_LATITUDE, MAX_LATITUDE);

    return props;
  }
}

export default class GlobeController extends Controller<MapState> {
  ControllerState = GlobeState;

  transition = {
    transitionDuration: 300,
    transitionInterpolator: new LinearInterpolator(['longitude', 'latitude', 'zoom'])
  };

  dragMode: 'pan' | 'rotate' = 'pan';

  setProps(props: ControllerProps) {
    super.setProps(props);

    // TODO - support pitching?
    this.dragRotate = false;
    this.touchRotate = false;
  }
}
