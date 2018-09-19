import {Deck} from '@deck.gl/core';

function updateDeck(deck) {
  const layers = [];
  deck.props.userData.mapboxLayers.forEach(deckLayer => {
    const LayerType = deckLayer.props.type;
    const layer = new LayerType(deckLayer.props);
    layers.push(layer);
  });
  deck.setProps({layers});
}

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
    this.deck = this._getDeckInstance(map, gl);
    updateDeck(this.deck);
  }

  onRemove() {
    const {mapboxLayers} = this.deck.props.userData;
    mapboxLayers.delete(this);
    updateDeck(this.deck);
  }

  setProps(props) {
    // id cannot be changed
    Object.assign(this.props, props, {id: this.id});
    updateDeck(this.deck);
    this.map.triggerRepaint();
  }

  render(gl, matrix) {
    const viewState = this._getViewState();

    this.deck.setProps({
      viewState,
      layerFilter: ({layer}) => this.id === layer.id
    });
    this.deck._drawLayers();

    // this.map.triggerRepaint();
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
      nearZMultiplier: deck && deck.height ? 1 / deck.height : 1,
      farZMultiplier: 1
    };
  }

  _getDeckInstance(map, gl) {
    // Only create one deck instance per context
    let deck = map.__deck;

    if (!deck) {
      deck = new Deck({
        // TODO - this should not be needed
        canvas: 'deck-canvas',
        width: '100%',
        height: '100%',
        controller: false,
        _customRender: true,
        userData: {
          mapboxLayers: new Set()
        },
        viewState: this._getViewState()
      });
      deck._setGLContext(gl);
      map.__deck = deck;
    }

    deck.props.userData.mapboxLayers.add(this);

    return deck;
  }
}
