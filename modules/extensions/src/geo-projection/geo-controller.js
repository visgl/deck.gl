import {clamp} from 'math.gl';
import {MapController, Controller} from '@deck.gl/core';

const MapState = new MapController().ControllerState;

class GeoState extends MapState {
  constructor(opts = {}) {
    const {
      /** Viewport constraints */
      minPitch = -90,
      maxPitch = 90
    } = opts;
    super(Object.assign({}, opts, {maxPitch, minPitch}));
  }

  /* Modified from MapState source */
  _getUpdatedState(newProps) {
    const props = Object.assign(
      {ViewportType: this.ViewportType},
      this._viewportProps,
      this._interactiveState,
      newProps
    );
    const validate = this.ViewportType.isValid;
    if (validate && !validate([props.longitude, props.latitude])) {
      return this;
    }
    // Update _viewportProps
    return new GeoState(props);
  }

  // Apply any constraints (mathematical or defined by _viewportProps) to map state
  _applyConstraints(props) {
    props.zoom = clamp(props.zoom, props.minZoom, props.maxZoom);
    props.pitch = clamp(props.pitch, props.minPitch, props.maxPitch);
    return props;
  }

  // Calculates a new pitch and bearing from a position (coming from an event)
  _calculateNewPitchAndBearing({deltaScaleX, deltaScaleY, startBearing, startPitch}) {
    return {
      pitch: startPitch + 180 * deltaScaleY,
      bearing: startBearing + 180 * deltaScaleX
    };
  }
}

export default class GeoController extends Controller {
  constructor(props) {
    super(GeoState, props);
    this.invertPan = true;
  }
}
