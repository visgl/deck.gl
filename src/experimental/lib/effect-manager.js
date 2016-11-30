/* eslint-disable no-try-catch */

export default class EffectManager {
  constructor({gl, layerManager}) {
    this.gl = gl;
    this.layerManager = layerManager;
    this._effects = [];
  }

  /**
   * Adds an effect to be managed.  That effect's initialize function will
   * be called, and the effect's preDraw and draw callbacks will be
   * called at the appropriate times in the render loop
   * @param {Effect} effect - the effect to be added
   */
  addEffect(effect) {
    this._effects.push(effect);
    this._sortEffects();
    effect.initialize({gl: this.gl, layerManager: this.layerManager});
  }

  /**
   * Removes an effect that is already being managed.  That effect's
   * finalize function will be called, and its callbacks will no longer
   * be envoked in the render loop
   * @param {Effect} effect - the effect to be removed
   * @return {bool} - True if the effect was already being managed, and
   * thus successfully removed; false otherwise
   */
  removeEffect(effect) {
    const i = this._effects.indexOf(effect);
    if (i >= 0) {
      effect.finalize({gl: this.gl, layerManager: this.layerManager});
      this._effects.splice(i, 1);
      return true;
    }
    return false;
  }

  /**
   * Envoke the preDraw callback of all managed events, in order of
   * decreasing priority
   */
  preDraw() {
    for (const effect of this._effects) {
      if (effect.needsRedraw) {
        effect.preDraw({gl: this.gl, layerManager: this.layerManager});
      }
    }
  }

  /**
   * Envoke the draw callback of all managed events, in order of
   * decreasing priority
   */
  draw() {
    for (const effect of this._effects) {
      if (effect.needsRedraw) {
        effect.draw({gl: this.gl, layerManager: this.layerManager});
      }
    }
  }

  _sortEffects() {
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
