import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import Controls from '../../controllers/controls';
import FirstPersonState from '../../controllers/first-person-state';
// import FirstPersonViewport from '../../viewports/first-person-viewport';

import EventManager from '../../controllers/events/event-manager';

const propTypes = {
  /* Primary viewport properties */
  position: PropTypes.arrayOf(PropTypes.number), // eye position
  lookAt: PropTypes.arrayOf(PropTypes.number), // target position
  up: PropTypes.arrayOf(PropTypes.number), // up direction

  /* Projection matrix properties */
  width: PropTypes.number.isRequired, // viewport width in pixels
  height: PropTypes.number.isRequired, // viewport height in pixels

  fov: PropTypes.number, // field of view
  near: PropTypes.number,
  far: PropTypes.number,

  /* Constraints */
  bounds: PropTypes.object, // bounds in the shape of {minX, minY, minZ, maxX, maxY, maxZ}

  /* Callbacks */
  onViewportChange: PropTypes.func.isRequired,

  /* Controls */
  controls: PropTypes.object // Custom controls
};

const defaultProps = {
  position: [0, 0, 0],
  lookAt: [0, -1, 0],
  up: [0, 1, 0],

  fov: 50,
  near: 1,
  far: 1000
};

/*
 * Maps mouse interaction to a deck.gl Viewport
 */
export default class FirstPersonController extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;
    this._controls = this.props.controls || new Controls(FirstPersonState);
    this._eventManager = new EventManager(eventCanvas);
    this._controls.setOptions(Object.assign({}, this.props, {
      onViewportChange: this.props.onViewportChange,
      onStateChange: this._onInteractiveStateChange.bind(this),
      eventManager: this._eventManager
    }));
  }

  componentWillUpdate(nextProps) {
    this._controls.setOptions(nextProps);
  }

  componentWillUnmount() {
    this._eventManager.destroy();
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  render() {
    return createElement('div', {ref: 'eventCanvas'}, this.props.children);
  }
}

FirstPersonController.propTypes = propTypes;
FirstPersonController.defaultProps = defaultProps;
