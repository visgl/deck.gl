import PropTypes from 'prop-types';
import OrbitViewport from '../viewports/orbit-viewport';
import OrbitState from '../controllers/orbit-state';
import ViewportControls from '../controllers/viewport-controls';
import {EventManager} from 'mjolnir.js';

const PREFIX = '-webkit-';

const CURSOR = {
  GRABBING: `${PREFIX}grabbing`,
  GRAB: `${PREFIX}grab`,
  POINTER: 'pointer'
};

const propTypes = {
  /* Viewport properties */
  lookAt: PropTypes.arrayOf(PropTypes.number), // target position
  distance: PropTypes.number, // distance from camera to the target
  rotationX: PropTypes.number, // rotation around X axis
  rotationY: PropTypes.number, // rotation around Y axis
  translationX: PropTypes.number, // translation x in screen space
  translationY: PropTypes.number, // translation y in screen space
  zoom: PropTypes.number, // scale in screen space
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  fov: PropTypes.number, // field of view
  near: PropTypes.number,
  far: PropTypes.number,
  width: PropTypes.number.isRequired, // viewport width in pixels
  height: PropTypes.number.isRequired, // viewport height in pixels

  /* Model properties */
  bounds: PropTypes.object, // bounds in the shape of {minX, minY, minZ, maxX, maxY, maxZ}

  /* Callbacks */
  onViewportChange: PropTypes.func.isRequired,

  /** Accessor that returns a cursor style to show interactive state */
  getCursor: PropTypes.func,

  /* Controls */
  orbitControls: PropTypes.object
};

const getDefaultCursor = ({isDragging}) => (isDragging ? CURSOR.GRABBING : CURSOR.GRAB);

const defaultProps = {
  lookAt: [0, 0, 0],
  rotationX: 0,
  rotationY: 0,
  translationX: 0,
  translationY: 0,
  distance: 10,
  zoom: 1,
  minZoom: 0,
  maxZoom: Infinity,
  fov: 50,
  near: 1,
  far: 1000,
  getCursor: getDefaultCursor
};

/*
 * Maps mouse interaction to a deck.gl Viewport
 */
export default class OrbitControllerJS {
  // Returns a deck.gl Viewport instance, to be used with the DeckGL component
  static getViewport(viewport) {
    return new OrbitViewport(viewport);
  }

  constructor(props) {
    props = Object.assign({}, defaultProps, props);

    this.props = props;

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    this.canvas = props.canvas;

    const eventManager = new EventManager(this.canvas);

    this._eventManager = eventManager;

    this._controls = props.orbitControls || new ViewportControls(OrbitState);
    this._controls.setOptions(
      Object.assign({}, this.props, {
        onStateChange: this._onInteractiveStateChange.bind(this),
        eventManager
      })
    );
  }

  setProps(props) {
    props = Object.assign({}, this.props, props);
    this.props = props;

    this._controls.setOptions(props);
  }

  finalize() {
    this._eventManager.destroy();
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.state.isDragging = isDragging;
      const {getCursor} = this.props;
      this.canvas.style.cursor = getCursor(this.state);
    }
  }
}

OrbitControllerJS.displayName = 'OrbitController';
OrbitControllerJS.propTypes = propTypes;
OrbitControllerJS.defaultProps = defaultProps;
