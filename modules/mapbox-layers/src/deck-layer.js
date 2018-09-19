import {Deck} from '@deck.gl/core';

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

  onAdd(map, gl) {
    // console.log('onAdd', map, gl);

    this.map = map;
    this.deck = new Deck({
      // TODO - this should not be needed
      canvas: 'deck-canvas',
      width: '100%',
      height: '100%',
      controller: false,
      _customRender: true,
      viewState: this._getViewState()
    });
    this.deck._setGLContext(gl);
    this.deck.setProps({layers: this.layers});
  }

  render(gl, matrix) {
    const viewState = this._getViewState();
    // console.log('render3D', viewState, matrix);
    // gl.depthRange(0.9999, 1.0);

    this.deck.setProps({viewState});
    this.deck._drawLayers();

    // this.map.triggerRepaint();
  }
}
