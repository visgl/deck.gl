import {Deck} from '@deck.gl/core';
import GL from 'luma.gl/constants';

export default class DeckLayer {
  constructor({id = 'deck-layer', layers}) {
    this.id = id;
    this.type = 'custom';
    this.renderingMode = '3d';
    this.deck = null;
    this.layers = layers;
  }

  _getViewState() {
    const {lng, lat} = this.map.getCenter();
    return {
      longitude: lng,
      latitude: lat,
      zoom: this.map.getZoom(),
      bearing: this.map.getBearing(),
      pitch: this.map.getPitch()
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
      viewState: this._getViewState(),
      // views: [new MapView({farZmultiplier: 0.101})]
      parameters: {
        depthTest: false
      }
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
    this.map.triggerRepaint();
  }
}
