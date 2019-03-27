"use strict";module.export({default:()=>EffectManager});var deepEqual;module.link('../utils/deep-equal',{deepEqual(v){deepEqual=v}},0);var LightingEffect;module.link('../effects/lighting-effect',{default(v){LightingEffect=v}},1);


class EffectManager {
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
