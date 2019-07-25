import {deepEqual} from '../utils/deep-equal';
import {default as LightingEffect} from '../effects/lighting/lighting-effect';

export default class EffectManager {
  constructor() {
    this.effects = [];
    this._internalEffects = [];
    this._needsRedraw = 'Initial render';
    this.defaultLightingEffect = new LightingEffect();
    this._applyLightingEffect();
  }

  setProps(props) {
    if ('effects' in props) {
      if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
        this.setEffects(props.effects);
        this._needsRedraw = 'effects changed';
      }
    }
  }

  needsRedraw(opts = {clearRedrawFlags: false}) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  getEffects() {
    return this._internalEffects;
  }

  finalize() {
    this.cleanup();
  }

  // Private
  setEffects(effects = []) {
    this.cleanup();
    this.effects = effects;
    this._createInternalEffects();
  }

  cleanup() {
    for (const effect of this.effects) {
      effect.cleanup();
    }

    for (const effect of this._internalEffects) {
      effect.cleanup();
    }
    this.effects.length = 0;
    this._internalEffects.length = 0;
  }

  _needApplyLightingEffect() {
    let hasEffect = false;
    for (const effect of this.effects) {
      if (effect instanceof LightingEffect) {
        hasEffect = true;
        break;
      }
    }
    return !hasEffect;
  }

  _applyLightingEffect() {
    this._internalEffects.push(this.defaultLightingEffect);
  }

  _createInternalEffects() {
    this._internalEffects = this.effects.slice();
    if (this._needApplyLightingEffect()) {
      this._applyLightingEffect();
    }
  }
}
