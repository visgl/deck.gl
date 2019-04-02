/* global google */
import {createDeckInstance, destroyDeckInstance, getViewState} from './utils';

const HIDE_ALL_LAYERS = () => false;

export default class GoogleMapsOverlay {
  constructor(props) {
    this.props = {};

    this._map = null;
    this._overlay = new google.maps.OverlayView();
    this._overlay.draw = this._draw.bind(this);

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
      if (this._deck) {
        destroyDeckInstance(this._deck);
      }
      this._deck = createDeckInstance(map);
      this._deck.setProps(this.props);
      this._map = map;
      this._overlay.setMap(map);
    }
  }

  setProps(props) {
    Object.assign(this.props, props);
    if (this._deck) {
      this._deck.setProps(this.props);
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
    if (this._deck) {
      destroyDeckInstance(this._deck);
    }
    if (this._map) {
      this._overlay.setMap(null);
      this._map = null;
    }
  }

  /* Private API */

  _draw() {
    const viewState = getViewState(this._map, this._overlay);
    this._deck.setProps({
      viewState,
      layerFilter: viewState.zoom >= 0 && viewState.pitch === 0 ? null : HIDE_ALL_LAYERS
    });
    if (this._deck.deckRenderer) {
      // Deck is initialized
      this._deck.redraw();
    }
  }
}
