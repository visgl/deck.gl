import {deepEqual} from '../utils/deep-equal';
import LightingEffect from '../effects/lighting/lighting-effect';
import MaskEffect from '../effects/mask/mask-effect';
import type {Effect} from './effect';

const DEFAULT_LIGHTING_EFFECT = new LightingEffect();

export default class EffectManager {
  effects: Effect[];
  _internalEffects: Effect[];
  _needsRedraw: false | string;

  constructor() {
    this.effects = [];
    this._internalEffects = [];
    this._needsRedraw = 'Initial render';
    this.setEffects();
  }

  setProps(props) {
    if ('effects' in props) {
      if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
        this.setEffects(props.effects);
        this._needsRedraw = 'effects changed';
      }
    }
  }

  needsRedraw(opts = {clearRedrawFlags: false}): false | string {
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
  setEffects(effects: Effect[] = []) {
    this.cleanup();
    this.effects = effects;

    this._internalEffects = effects.slice();
    // Unique MaskEffect per EffectManager as GL context may be different
    this._internalEffects.push(new MaskEffect());
    if (!effects.some(effect => effect instanceof LightingEffect)) {
      this._internalEffects.push(DEFAULT_LIGHTING_EFFECT);
    }
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
}
