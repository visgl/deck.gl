import {_DebugContext as DebugContext, COLOR_MODE} from '@luma.gl/debug';

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

    this.debugContext = new DebugContext(deck.canvas);
  }

  setOptions(opts) {
    Object.assign(this.opts, opts);

    // Hack: trigger rerender
    this.deck.setProps({
      layers: [...this.deck.props.layers]
    });
  }

  _onRender() {
    const {deck} = this;

    this.debugContext.clear({
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
      this.debugContext.drawModel(model, {
        colorMode: this.opts.colorMode
      });
    });
  }
}
