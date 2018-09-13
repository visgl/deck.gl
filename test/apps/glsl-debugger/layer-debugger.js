/* global document */
import renderModel, {DrawingContext, COLOR_MODE} from 'luma.gl-debugger';

const DEFAULT_OPTIONS = {
  enabled: false,
  colorMode: COLOR_MODE.NONE
};

export default class LayerDebugger {
  constructor(deck, opts) {
    this.deck = deck;
    this.opts = Object.assign({}, DEFAULT_OPTIONS, opts);

    deck.setProps({
      onBeforeRender: this._onRender.bind(this)
    });

    const canvas = this._createCanvas(deck.canvas.offsetParent);
    this.drawingContext = new DrawingContext(canvas);
  }

  setOptions(opts) {
    Object.assign(this.opts, opts);

    // Hack: trigger rerender
    this.deck.setProps({
      layers: [...this.deck.props.layers]
    });
  }

  _createCanvas(container) {
    const canvas = document.createElement('canvas');
    container.append(canvas);
    Object.assign(canvas.style, {
      position: 'absolute',
      left: '0px',
      top: '0px',
      pointerEvents: 'none'
    });
    return canvas;
  }

  _onRender() {
    const {deck} = this;

    this.drawingContext.resize({width: deck.width, height: deck.height});

    this.drawingContext.clear({
      strokeStyle: '#000',
      fillStyle: '#000'
    });

    const {layerManager} = deck;
    layerManager.layers = layerManager.layers.map(this._inject, this);
  }

  _inject(layer) {
    if (!layer.__debugger) {
      const originalDraw = layer.draw;

      layer = Object.create(layer);

      layer.draw = (...args) => {
        originalDraw.call(layer, ...args);
        this._drawLayer(layer);
      };
      layer.__debugger = this;
    }
    return layer;
  }

  _drawLayer(layer) {
    if (!this.opts.enabled) {
      return;
    }

    layer.getModels().forEach(model => {
      renderModel({
        model,
        context: this.drawingContext,
        colorMode: this.opts.colorMode
      });
    });
  }
}
