import {getDeckInstance, addLayer, removeLayer, updateLayer, drawLayer} from './deck-utils';

export default class DeckLayer {
  constructor(props) {
    if (!props.id) {
      throw new Error('Layer must have an unique id');
    }

    this.id = props.id;
    this.type = 'custom';
    this.renderingMode = '3d';
    this.deck = null;
    this.props = props;
  }

  onAdd(map, gl) {
    this.map = map;
    this.deck = getDeckInstance({map, gl});
    addLayer(this.deck, this);
  }

  onRemove() {
    removeLayer(this.deck, this);
  }

  setProps(props) {
    // id cannot be changed
    Object.assign(this.props, props, {id: this.id});
    updateLayer(this.deck, this);
    this.map.triggerRepaint();
  }

  render(gl, matrix) {
    this.deck.setProps({
      viewState: this._getViewState()
    });
    drawLayer(this.deck, this);
  }

  /* Private API */

  _getViewState() {
    const {map, deck} = this;
    const {lng, lat} = map.getCenter();
    return {
      longitude: lng,
      latitude: lat,
      zoom: map.getZoom(),
      bearing: map.getBearing(),
      pitch: map.getPitch(),
      nearZMultiplier: deck.height ? 1 / deck.height : 1,
      farZMultiplier: 1
    };
  }
}
