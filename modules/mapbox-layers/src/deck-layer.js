import {Deck} from '@deck.gl/core';

const deckInstances = new Map();

function updateDeck(deck) {
  const layers = [];
  deck.props._mapboxLayers.forEach(deckLayer => {
    layers.push(deckLayer.layers);
  });
  deck.setProps({layers});
}

export default class DeckLayer {
  constructor({id = 'deck-layer', layers}) {
    this.id = id;
    this.type = 'custom';
    this.renderingMode = '3d';
    this.deck = null;
    this.layers = layers;
  }

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

  _getDeckInstance(gl) {
    // Only create one deck instance per context
    let deck = deckInstances.get(gl);

    if (!deck) {
      deck = new Deck({
        // TODO - this should not be needed
        canvas: 'deck-canvas',
        width: '100%',
        height: '100%',
        controller: false,
        _customRender: true,
        _mapboxLayers: new Set(),
        viewState: this._getViewState()
      });
      deck._setGLContext(gl);
      deckInstances.set(gl, deck);
    }

    deck.props._mapboxLayers.add(this);

    return deck;
  }

  onAdd(map, gl) {
    this.map = map;
    this.deck = this._getDeckInstance(gl);
    updateDeck(this.deck);
  }

  onRemove() {
    const mapboxLayers = this.deck.props._mapboxLayers;
    mapboxLayers.delete(this);

    if (mapboxLayers.size === 0) {
      // this deck instance is now empty
      deckInstances.delete(this.map);
      this.deck.finalize();
    } else {
      updateDeck(this.deck);
    }
  }

  setProps(props) {
    if ('layers' in props) {
      this.layers = props.layers;
      updateDeck(this.deck);
      this.map.triggerRepaint();
    }
  }

  render(gl, matrix) {
    const viewState = this._getViewState();

    this.deck.setProps({
      viewState,
      layerFilter: ({layer}) => this.layers.includes(layer)
    });
    this.deck._drawLayers();

    // this.map.triggerRepaint();
  }
}
