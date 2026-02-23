// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global google */
import {GL, GLParameters} from '@luma.gl/constants';
import {WebGLDevice} from '@luma.gl/webgl';
import {
  createDeckInstance,
  destroyDeckInstance,
  getViewPropsFromOverlay,
  getViewPropsFromCoordinateTransformer,
  POSITIONING_CONTAINER_ID
} from './utils';
import {Deck} from '@deck.gl/core';

import type {DeckProps, MapViewState} from '@deck.gl/core';
import type {Device} from '@luma.gl/core';
const HIDE_ALL_LAYERS = () => false;
const GL_STATE: GLParameters = {
  depthMask: true,
  depthTest: true,
  blend: true,
  blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA, GL.ONE, GL.ONE_MINUS_SRC_ALPHA],
  blendEquation: GL.FUNC_ADD
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
function noop() {}

const defaultProps = {
  interleaved: true
};

export type GoogleMapsOverlayProps = Omit<
  DeckProps,
  | 'width'
  | 'height'
  | 'gl'
  | 'deviceProps'
  | 'parent'
  | 'canvas'
  | '_customRender'
  | 'viewState'
  | 'initialViewState'
  | 'controller'
> & {
  interleaved?: boolean;
};

export default class GoogleMapsOverlay {
  private props: GoogleMapsOverlayProps = {};
  private _map: google.maps.Map | null = null;
  private _deck: Deck | null = null;
  private _overlay: google.maps.WebGLOverlayView | google.maps.OverlayView | null = null;
  private _positioningOverlay: google.maps.OverlayView | null = null;

  constructor(props: GoogleMapsOverlayProps) {
    this.setProps({...defaultProps, ...props});
  }

  /* Public API */

  /** Add/remove the overlay from a map. */
  setMap(map: google.maps.Map | null): void {
    if (map === this._map) {
      return;
    }

    const {VECTOR, UNINITIALIZED} = google.maps.RenderingType;
    if (this._map) {
      if (!map && this._map.getRenderingType() === VECTOR && this.props.interleaved) {
        (this._overlay as google.maps.WebGLOverlayView).requestRedraw();
      }
      this._overlay?.setMap(null);
      this._positioningOverlay?.setMap(null);
      this._map = null;
    }
    if (map) {
      this._map = map;
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

  /**
   * Update (partial) props.
   */
  setProps(props: Partial<GoogleMapsOverlayProps>): void {
    Object.assign(this.props, props);
    if (this._deck) {
      const canvas = this._deck.getCanvas();
      if (props.style && canvas?.parentElement) {
        const parentStyle = canvas.parentElement.style;
        Object.assign(parentStyle, props.style);
        props.style = null;
      }
      this._deck.setProps(props);
    }
  }

  /** Equivalent of `deck.pickObject`. */
  pickObject(params) {
    return this._deck && this._deck.pickObject(params);
  }

  /** Equivalent of `deck.pickObjects`.  */
  pickMultipleObjects(params) {
    return this._deck && this._deck.pickMultipleObjects(params);
  }

  /** Equivalent of `deck.pickMultipleObjects`. */
  pickObjects(params) {
    return this._deck && this._deck.pickObjects(params);
  }

  /** Remove the overlay and release all underlying resources. */
  finalize() {
    this.setMap(null);
    if (this._deck) {
      destroyDeckInstance(this._deck);
      this._deck = null;
    }
  }

  /* Private API */
  _createOverlay(map: google.maps.Map) {
    const {VECTOR, UNINITIALIZED} = google.maps.RenderingType;
    const renderingType = map.getRenderingType();
    if (renderingType === UNINITIALIZED) {
      return;
    }

    const isVectorMap = renderingType === VECTOR && google.maps.WebGLOverlayView;
    if (isVectorMap) {
      this._createOverlayVector(map);
    } else {
      this._createOverlayRaster(map);
    }
  }

  /**
   * Create overlays for vector maps.
   * Uses OverlayView for DOM positioning (correct z-index) and
   * WebGLOverlayView for camera data (smooth animations).
   * In interleaved mode, WebGLOverlayView also provides the shared GL context.
   */
  _createOverlayVector(map: google.maps.Map) {
    const interleaved = this.props.interleaved ?? defaultProps.interleaved;
    // Create positioning overlay for proper DOM placement
    const positioningOverlay = new google.maps.OverlayView();
    positioningOverlay.onAdd = this._onAddVectorOverlay.bind(this);
    positioningOverlay.draw = this._updateContainerSize.bind(this);
    positioningOverlay.onRemove = this._onRemove.bind(this);
    this._positioningOverlay = positioningOverlay;
    this._positioningOverlay.setMap(map);

    // Create WebGL overlay for camera data (and GL context if interleaved)
    const overlay = new google.maps.WebGLOverlayView();
    overlay.onAdd = noop;
    overlay.onContextRestored = interleaved ? this._onContextRestored.bind(this) : noop;
    overlay.onDraw = this._onDrawVector.bind(this);
    overlay.onContextLost = interleaved ? this._onContextLost.bind(this) : noop;
    overlay.onRemove = interleaved ? this._onRemove.bind(this) : noop;
    this._overlay = overlay;
    this._overlay.setMap(map);
  }

  _createOverlayRaster(map: google.maps.Map) {
    // Raster maps use standard OverlayView
    const overlay = new google.maps.OverlayView();
    overlay.onAdd = this._onAdd.bind(this);
    overlay.draw = this._onDrawRaster.bind(this);
    overlay.onRemove = this._onRemove.bind(this);
    this._overlay = overlay;
    this._overlay.setMap(map);
  }

  _onAdd() {
    // @ts-ignore (TS2345) map is defined at this stage
    this._deck = createDeckInstance(this._map, this._overlay, this._deck, this.props);
  }

  _onAddVectorOverlay() {
    // For non-interleaved vector maps, create a positioning container
    // that Google Maps will place correctly in the DOM with proper z-index
    const overlay = this._positioningOverlay as google.maps.OverlayView;
    const panes = overlay.getPanes();
    if (panes) {
      const container = document.createElement('div');
      container.id = POSITIONING_CONTAINER_ID;
      container.style.position = 'absolute';
      panes.overlayLayer.appendChild(container);
    }

    // @ts-ignore (TS2345) map is defined at this stage
    // Pass the positioning overlay for deck canvas creation (not WebGL overlay)
    this._deck = createDeckInstance(this._map, overlay, this._deck, this.props);
  }

  _updateContainerSize() {
    // Update positioning container size and position to match map
    if (!this._map) return;

    const container = this._map
      .getDiv()
      .querySelector(`#${POSITIONING_CONTAINER_ID}`) as HTMLElement;
    if (!container) return;

    const mapContainer = this._map.getDiv().firstChild as HTMLElement;
    if (!mapContainer) return;

    const width = mapContainer.offsetWidth;
    const height = mapContainer.offsetHeight;

    container.style.width = `${width}px`;
    container.style.height = `${height}px`;
    // Position at top-left (overlayLayer uses centered coords, so offset by half)
    container.style.left = `${-width / 2}px`;
    container.style.top = `${-height / 2}px`;
  }

  _onContextRestored({gl}) {
    if (!this._map || !this._overlay) {
      return;
    }
    const _customRender = () => {
      if (this._overlay) {
        (this._overlay as google.maps.WebGLOverlayView).requestRedraw();
      }
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
    // @ts-ignore accessing protected member
    const animationLoop = deck.animationLoop!;
    animationLoop._renderFrame = () => {
      const ab = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
      // @ts-expect-error accessing protected member
      const device: Device = deck.device;
      device.withParametersWebGL({}, () => {
        animationLoop.props.onRender(animationLoop.animationProps!);
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
    this._deck?.setProps({layerFilter: HIDE_ALL_LAYERS});
  }

  _onDrawRaster() {
    if (!this._deck || !this._map) {
      return;
    }
    const deck = this._deck;

    const {width, height, left, top, ...rest} = getViewPropsFromOverlay(
      this._map,
      this._overlay as google.maps.OverlayView
    );

    const canvas = deck.getCanvas();
    const parent = canvas?.parentElement || deck.props.parent;
    if (parent) {
      const parentStyle = parent.style;
      parentStyle.left = `${left}px`;
      parentStyle.top = `${top}px`;
    }

    const altitude = 10000;
    deck.setProps({
      width,
      height,
      // @ts-expect-error altitude is accepted by WebMercatorViewport but not exposed by type
      viewState: {altitude, ...rest} as MapViewState
    });
    // Deck is initialized
    deck.redraw();
  }

  _onDrawVector({gl, transformer}) {
    if (!this._deck || !this._map) {
      return;
    }

    const deck = this._deck;
    const {interleaved} = this.props;

    deck.setProps({
      ...getViewPropsFromCoordinateTransformer(this._map, transformer),
      // Using external gl context - do not set css size
      ...(interleaved && {width: null, height: null})
    });

    if (interleaved && deck.isInitialized) {
      // @ts-expect-error
      const device: Device = deck.device;

      // As an optimization, some renders are to an separate framebuffer
      // which we need to pass onto deck
      if (device instanceof WebGLDevice) {
        const _framebuffer = device.getParametersWebGL(GL.FRAMEBUFFER_BINDING);
        deck.setProps({_framebuffer});
      }

      // Camera changed, will trigger a map repaint right after this
      // Clear any change flag triggered by setting viewState so that deck does not request
      // a second repaint
      deck.needsRedraw({clearRedrawFlags: true});

      // Workaround for bug in Google maps where viewport state is wrong
      // TODO remove once fixed
      if (device instanceof WebGLDevice) {
        device.setParametersWebGL({
          viewport: [0, 0, gl.canvas.width, gl.canvas.height],
          scissor: [0, 0, gl.canvas.width, gl.canvas.height],
          stencilFunc: [gl.ALWAYS, 0, 255, gl.ALWAYS, 0, 255]
        });

        device.withParametersWebGL(GL_STATE, () => {
          deck._drawLayers('google-vector', {
            clearCanvas: false
          });
        });
      }
    } else if (!interleaved) {
      deck.redraw();
    }
  }
}
