import {clamp} from 'math.gl';
import Controller from './controller';

import {MapState} from './map-controller';
import {mod} from '../utils/math-utils';
import LinearInterpolator from '../transitions/linear-interpolator';
import {TRANSITION_EVENTS} from './transition-manager';

const LINEAR_TRANSITION_PROPS = {
  transitionDuration: 300,
  transitionEasing: t => t,
  transitionInterpolator: new LinearInterpolator(['longitude', 'latitude', 'zoom']),
  transitionInterruption: TRANSITION_EVENTS.BREAK
};

class GlobeState extends MapState {
  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    // Ensure zoom is within specified range
    const {maxZoom, minZoom, zoom} = props;
    props.zoom = clamp(zoom, minZoom, maxZoom);

    const {longitude, latitude} = props;
    if (longitude < -180 || longitude > 180) {
      props.longitude = mod(longitude + 180, 360) - 180;
    }
    props.latitude = clamp(latitude, -89, 89);

    return props;
  }
}

export default class GlobeController extends Controller {
  constructor(props) {
    super(GlobeState, props);
    this.invertPan = true;
  }

  setProps(props) {
    super.setProps(props);

    // TODO - support pitching?
    this.dragRotate = false;
    this.touchRotate = false;
  }

  _getTransitionProps() {
    // Enables Transitions on double-tap and key-down events.
    return LINEAR_TRANSITION_PROPS;
  }
}
