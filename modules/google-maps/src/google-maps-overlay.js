/* global google */
import {getParameters, setParameters, withParameters} from '@luma.gl/core';
import GL from '@luma.gl/constants';
import {
  createDeckInstance,
  destroyDeckInstance,
  getViewPropsFromOverlay,
  getViewPropsFromCoordinateTransformer
} from './utils';

const HIDE_ALL_LAYERS = () => false;
const GL_STATE = {
  depthMask: true,
  depthTest: true,
  blend: true,
  blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
  blendEquation: GL.FUNC_ADD
};

export default class GoogleMapsOverlay {
  constructor(props) {
    this.props = {};
    this._map = null;
    this.setProps(props);
  }

  /* Public API */

  setMap(map) {
    if (map === this._map) {
      return;
    }
    if (this._map) {
      this._overlay.setMap(null);
      this._map = null;
    }
    if (map) {
      this._map = map;
      const {UNINITIALIZED} = google.maps.RenderingType;
      const renderingType = map.getRenderingType();
      if (renderingType !== UNINITIALIZED) {
        this._createOverlay(map);
      } else {
        map.addListener('renderingtype_changed', () => {
          this._createOverlay(map);
        });
      }
    }
  }

  setProps(props) {
    Object.assign(this.props, props);
    if (this._deck) {
      if (props.style) {
        Object.assign(this._deck.canvas.parentElement.style, props.style);
        props.style = null;
      }
      this._deck.setProps(props);
    }
  }

  pickObject(params) {
    return this._deck && this._deck.pickObject(params);
  }

  pickMultipleObjects(params) {
    return this._deck && this._deck.pickMultipleObjects(params);
  }

  pickObjects(params) {
    return this._deck && this._deck.pickObjects(params);
  }

  finalize() {
    this.setMap(null);
    if (this._deck) {
      destroyDeckInstance(this._deck);
      this._deck = null;
    }
  }

  /* Private API */
  _createOverlay(map) {
    const {VECTOR, UNINITIALIZED} = google.maps.RenderingType;
    const renderingType = map.getRenderingType();
    if (renderingType === UNINITIALIZED) {
      return;
    }
    const isVectorMap = renderingType === VECTOR && google.maps.WebglOverlayView;
    const OverlayView = isVectorMap ? google.maps.WebglOverlayView : google.maps.OverlayView;
    const overlay = new OverlayView();

    // Lifecycle methods are different depending on map type
    if (isVectorMap) {
      overlay.onAdd = () => {};
      overlay.onContextLost = this._onContextLost.bind(this);
      overlay.onContextRestored = this._onContextRestored.bind(this);
      overlay.onDraw = this._onDrawVector.bind(this);
    } else {
      overlay.onAdd = this._onAdd.bind(this);
      overlay.draw = this._onDrawRaster.bind(this);
    }
    overlay.onRemove = this._onRemove.bind(this);

    this._overlay = overlay;
    this._overlay.setMap(map);
  }

  _onAdd() {
    this._deck = createDeckInstance(this._map, this._overlay, this._deck, this.props);
  }

  _onContextRestored(gl) {
    const _customRender = () => {
      this._overlay.requestRedraw();
    };
    const deck = createDeckInstance(this._map, this._overlay, this._deck, {
      gl,
      _customRender,
      ...this.props
    });
    this._deck = deck;

    // By default, animationLoop._renderFrame invokes
    // animationLoop.onRender. We override this to wrap
    // in withParameters so we don't modify the GL state
    deck.animationLoop._renderFrame = () => {
      const ab = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
      withParameters(gl, {}, () => {
        deck.animationLoop.onRender();
      });
      gl.bindBuffer(gl.ARRAY_BUFFER, ab);
    };
  }

  _onContextLost() {
    // TODO this isn't working
    if (this._deck) {
      destroyDeckInstance(this._deck);
      this._deck = null;
    }
  }

  _onRemove() {
    // Clear deck canvas
    this._deck.setProps({layerFilter: HIDE_ALL_LAYERS});
  }

  _onDrawRaster() {
    const deck = this._deck;
    const {width, height, left, top, zoom, pitch, latitude, longitude} = getViewPropsFromOverlay(
      this._map,
      this._overlay
    );

    const canSyncWithGoogleMaps = pitch === 0;

    const parentStyle = deck.canvas.parentElement.style;
    parentStyle.left = `${left}px`;
    parentStyle.top = `${top}px`;

    deck.setProps({
      width,
      height,
      viewState: {latitude, longitude, zoom, repeat: true},
      // deck.gl cannot sync with the base map with zoom < 0 and/or tilt
      layerFilter: canSyncWithGoogleMaps ? this.props.layerFilter : HIDE_ALL_LAYERS
    });
    // Deck is initialized
    deck.redraw();
  }

  // Vector code path
  _onDrawVector(gl, coordinateTransformer) {
    if (!this._deck || !this._map) {
      return;
    }

    const deck = this._deck;

    deck.setProps({
      ...getViewPropsFromCoordinateTransformer(this._map, coordinateTransformer)
    });

    if (deck.layerManager) {
      // As an optimization, some renders are to an separate framebuffer
      // which we need to pass onto deck
      const _framebuffer = getParameters(gl, GL.FRAMEBUFFER_BINDING);
      deck.setProps({_framebuffer});

      // Camera changed, will trigger a map repaint right after this
      // Clear any change flag triggered by setting viewState so that deck does not request
      // a second repaint
      deck.needsRedraw({clearRedrawFlags: true});

      // Workaround for bug in Google maps where viewport state is wrong
      // TODO remove once fixed
      setParameters(gl, {
        viewport: [0, 0, gl.canvas.width, gl.canvas.height],
        scissor: [0, 0, gl.canvas.width, gl.canvas.height],
        stencilFunc: [gl.ALWAYS, 0, 255, gl.ALWAYS, 0, 255]
      });

      withParameters(gl, GL_STATE, () => {
        deck._drawLayers('google-vector', {
          clearCanvas: false
        });
      });
    }
  }
}
