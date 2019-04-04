/* global google */
import {createDeckInstance, destroyDeckInstance, getViewState} from './utils';

const HIDE_ALL_LAYERS = () => false;

export default class GoogleMapsOverlay {
  constructor(props) {
    this.props = {};

    this._map = null;

    const overlay = new google.maps.OverlayView();
    overlay.onAdd = this._onAdd.bind(this);
    overlay.draw = this._draw.bind(this);
    this._overlay = overlay;

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
    this.setMap(null);
  }

  /* Private API */
  _onAdd() {
    this._deck = createDeckInstance(this._map, this._overlay, this._deck);
    this._deck.setProps(this.props);
  }

  _draw() {
    const deck = this._deck;
    const viewState = getViewState(this._map, this._overlay);

    deck.setProps({
      viewState,
      // deck.gl cannot sync with the base map with zoom < 0 and/or tilt
      layerFilter:
        viewState.zoom >= 0 && viewState.pitch === 0 ? this.props.layerFilter : HIDE_ALL_LAYERS
    });
    if (deck.deckRenderer) {
      // Deck is initialized
      deck.redraw();
    }
  }
}
