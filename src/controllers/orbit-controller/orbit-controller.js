import React, {createElement} from 'react';
import PropTypes from 'prop-types';
import OrbitViewport from '../../lib/viewports/orbit-viewport';
import OrbitControls from './orbit-controls';

import EventManager from '../../utils/events/event-manager';

/*
 * Maps mouse interaction to a deck.gl Viewport
 */
export default class OrbitController extends React.Component {

  // Returns a deck.gl Viewport instance, to be used with the DeckGL component
  static getViewport(viewport) {
    return new OrbitViewport(viewport);
  }

  constructor(props) {
    super(props);

    this.state = {
      // Whether the cursor is down
      isDragging: false
    };

    this._eventManager = null;
    this._handleEvent = this._handleEvent.bind(this);
    this._onInteractiveStateChange = this._onInteractiveStateChange.bind(this);
  }

  componentDidMount() {
    const {eventCanvas} = this.refs;
    const {orbitControls} = this.props;

    // Register event handlers defined by map controls
    const events = {};
    orbitControls.events.forEach(eventName => {
      events[eventName] = this._handleEvent;
    });

    const eventManager = new EventManager(eventCanvas, {events});
    this._eventManager = eventManager;
  }

  componentWillUnmount() {
    if (this._eventManager) {
      // Must destroy because hammer adds event listeners to window
      this._eventManager.destroy();
    }
  }

  _handleEvent(event) {
    const controlOptions = Object.assign({}, this.props, {
      onStateChange: this._onInteractiveStateChange
    });

    return this.props.orbitControls.handleEvent(event, controlOptions);
  }

  _onInteractiveStateChange({isDragging = false}) {
    if (isDragging !== this.state.isDragging) {
      this.setState({isDragging});
    }
  }

  render() {
    return (
      createElement('div', {
        ref: 'eventCanvas'
      }, this.props.children)
    );
  }
}

OrbitController.propTypes = {
  // target position
  lookAt: PropTypes.arrayOf(PropTypes.number),
  // camera distance
  distance: PropTypes.number,
  // rotation
  rotationX: PropTypes.number,
  rotationY: PropTypes.number,
  // translation
  translationX: PropTypes.number,
  translationY: PropTypes.number,
  zoom: PropTypes.number,
  minZoom: PropTypes.number,
  maxZoom: PropTypes.number,
  // field of view
  fov: PropTypes.number,
  near: PropTypes.number,
  far: PropTypes.number,
  // viewport width in pixels
  width: PropTypes.number.isRequired,
  // viewport height in pixels
  height: PropTypes.number.isRequired,
  // bounds (optional)
  bounds: PropTypes.object,
  // callback
  onViewportChange: PropTypes.func.isRequired,

  orbitControls: PropTypes.object
};

OrbitController.defaultProps = {
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
  orbitControls: new OrbitControls()
};
