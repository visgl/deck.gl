import {deepEqual} from '../utils/deep-equal';
import {default as LightingEffect} from '../effects/lighting-effect';

export default class EffectManager {
  constructor() {
    this.effects = [];
    this._needsRedraw = 'Initial render';
  }

  setProps(props) {
    if ('effects' in props) {
      if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
        this.setEffects(props.effects);
        this._needsRedraw = 'effects changed';
      }
    }
    this.applyDefaultLightingEffect();
  }

  needsRedraw(opts = {clearRedrawFlags: false}) {
    const redraw = this._needsRedraw;
    if (opts.clearRedrawFlags) {
      this._needsRedraw = false;
    }
    return redraw;
  }

  setEffects(effects = []) {
    this.effects = effects;
  }

  getEffects() {
    return this.effects;
  }

  // Private
  applyDefaultLightingEffect() {
    let hasEffect = false;
    for (const effect of this.effects) {
      if (effect instanceof LightingEffect) {
        hasEffect = true;
        break;
      }
    }
    if (!hasEffect) {
      this.effects.push(new LightingEffect());
    }
  }
}
