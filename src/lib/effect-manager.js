/* eslint-disable no-try-catch */

export default class EffectManager {
  constructor({gl, layerManager}) {
    this.gl = gl;
    this.layerManager = layerManager;
    this._effects = [];
  }

  addEffect(effect) {
    this._effects.push(effect);
    this._sortEffects();
    effect.initialize({gl: this.gl, layerManager: this.layerManager});
  }

  removeEffect(effect) {
    if (this._effects.indexOf(effect) >= 0) {
      effect.finalize({gl: this.gl, layerManager: this.layerManager});
      this._effects.remove(effect);
    }
  }

  preDraw() {
    for (const effect of this._effects) {
      if (effect.needsRedraw) {
        effect.preDraw({gl: this.gl, layerManager: this.layerManager});
      }
    }
  }

  draw() {
    for (const effect of this._effects) {
      if (effect.needsRedraw) {
        effect.draw({gl: this.gl, layerManager: this.layerManager});
      }
    }
  }
  
  
   _sortEffects() {
    /*
     * this should really be made stable in the future...
     */
    this._effects.sort((a, b) => {
      if (a.priority > b.priority) {
        return -1;
      } else if (a.priority < b.priority) {
        return 1;
      }
      return a.count - b.count;
    });
  }
  
}
