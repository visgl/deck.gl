/* global window, document */
/* eslint-disable max-statements */
import Mapbox from './mapbox';

const CANVAS_STYLE = {
  position: 'absolute',
  left: 0,
  top: 0,
  width: '100%',
  height: '100%'
};

/**
 * @params container (Element) - DOM element to add deck.gl canvas to
 * @params map (Object) - map API. Set to falsy to disable
 * @params controller (Object) - Controller class. Leave empty for auto detection
 */
class DeckGL {
  constructor(props = {}) {
    if (typeof document === 'undefined') {
      // Not browser
      return;
    }

    const {container = document.body} = props;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Add DOM elements
    const containerStyle = window.getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = 'relative';
    }

    const mapCanvas = document.createElement('div');
    container.appendChild(mapCanvas);
    Object.assign(mapCanvas.style, CANVAS_STYLE);

    const deckCanvas = document.createElement('canvas');
    container.appendChild(deckCanvas);
    Object.assign(deckCanvas.style, CANVAS_STYLE);

    const {map, controller} = props;

    this._getViewState(props);
    const isMap = Number.isFinite(props.viewState.latitude);
    const isOrbit = Number.isFinite(props.viewState.distance);

    // Update viewport dimensions
    Object.assign(props, {
      width,
      height
    });

    this._deck = new DeckGL.experimental.DeckGLJS(
      Object.assign({}, props, {
        canvas: deckCanvas
      })
    );

    if (controller === undefined) {
      // Deduce controller class from viewport type
      let Controller;
      if (isMap) {
        Controller = DeckGL.experimental.MapControllerJS;
      } else if (isOrbit) {
        Controller = DeckGL.experimental.OrbitControllerJS;
      }

      this._controller =
        Controller &&
        new Controller(
          Object.assign({}, props.viewState, props, {
            canvas: deckCanvas,
            onViewportChange: this._onViewportChange
          })
        );
    } else {
      this._controller = controller;
      controller.setProps({
        onViewportChange: this._onViewportChange
      });
    }

    if (map === undefined) {
      // Create mapbox map
      this._map =
        isMap && window.mapboxgl && new Mapbox(Object.assign({}, props, {container: mapCanvas}));
    } else {
      this._map = map;
    }

    this.props = props;
    this._container = container;
    this._onViewportChange = this._onViewportChange.bind(this);
    this._resize = this._resize.bind(this);

    window.addEventListener('resize', this._resize);
    this._resize();
  }

  getMapboxMap() {
    return this._map && this._map._mapbox;
  }

  pickObject(opts) {
    return this._deck.pickObject(opts);
  }

  pickObjects(opts) {
    return this._deck.pickObjects(opts);
  }

  finalize() {
    window.removeEventListener('resize', this._resize);
    if (this._deck) {
      this._deck.finalize();
    }
    if (this._controller) {
      this._controller.finalize();
    }
    if (this._map) {
      this._map.finalize();
    }

    this._container = null;
    this.props = null;
  }

  setProps(props) {
    if (this._deck) {
      this._deck.setProps(props);
    }
    if (this._controller) {
      this._controller.setProps(
        Object.assign({}, props.viewState, props, {
          onViewportChange: this._onViewportChange
        })
      );
    }
    if (this._map) {
      this._map.setProps(props.viewState);
    }

    Object.assign(this.props, props);
  }

  _getViewState(props) {
    // Support old `viewports` prop
    props.views = props.views || props.viewports || (props.viewport && [props.viewport]);

    // Support old "geospatial view state as separate props" style
    if (!props.viewState) {
      props.viewState = Object.assign({}, (props.views && props.views[0]) || props);
    }
  }

  _onViewportChange(viewport) {
    const {viewState, onViewportChange} = this.props;

    this.setProps({
      viewState: Object.assign(viewState, viewport)
    });

    if (onViewportChange) {
      onViewportChange(viewport);
    }
  }

  _resize() {
    this.setProps({
      width: this._container.clientWidth,
      height: this._container.clientHeight
    });
  }
}

export default DeckGL;
