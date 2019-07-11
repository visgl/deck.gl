import {deepEqual} from '../utils/deep-equal';
import {default as LightingEffect} from '../effects/lighting/lighting-effect';
import {default as ShadowEffect} from '../effects/shadow-effect';

export default class EffectManager {
  constructor() {
    this.effects = [];
    this.internalEffects = [];
    this._needsRedraw = 'Initial render';
    this.defaultLightingEffect = new LightingEffect();
    this.needApplyDefaultLighting = false;
    this.needApplyDefaultShadow = false;
    this.applyLightingEffet();
  }

  setProps(props) {
    if ('effects' in props) {
      if (props.effects.length !== this.effects.length || !deepEqual(props.effects, this.effects)) {
        this.setEffects(props.effects);
        this._needsRedraw = 'effects changed';
      }
    }
  }

  createInternalEffects() {
    this.checkLightingEffect();
    this.checkShadowEffect();
    this.internalEffects = this.effects.slice();
    if (this.needApplyDefaultLighting) {
      this.applyLightingEffet();
    }
    if (this.needApplyDefaultShadow) {
      this.applyShadowEffect(this.internalEffects);
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
    return this.internalEffects;
  }

  finalize() {
    this.cleanup();
  }

  // Private
  setEffects(effects = []) {
    this.cleanup();
    this.effects = effects;
    this.createInternalEffects();
  }

  cleanup() {
    for (const effect of this.effects) {
      effect.cleanup();
    }

    for (const effect of this.internalEffects) {
      effect.cleanup();
    }
    this.effects.length = 0;
    this.internalEffects.length = 0;
  }

  checkLightingEffect() {
    let hasEffect = false;
    for (const effect of this.effects) {
      if (effect instanceof LightingEffect) {
        hasEffect = true;
        break;
      }
    }
    this.needApplyDefaultLighting = !hasEffect;
  }

  checkShadowEffect() {
    let shouldApplyShadow = false;
    for (const effect of this.effects) {
      if (effect instanceof LightingEffect && effect.directionalLights.length > 0) {
        shouldApplyShadow = true;
        break;
      }
    }
    this.needApplyDefaultShadow = shouldApplyShadow;
  }

  applyShadowEffect(effects) {
    const lights = [];
    for (const effect of this.effects) {
      if (effect instanceof LightingEffect) {
        for (const light of effect.directionalLights) {
          // eslint-disable-next-line max-depth
          if (light.castShadow) {
            lights.push(light);
          }
        }
      }
    }
    effects.push(new ShadowEffect({lights}));
  }

  applyLightingEffet() {
    this.internalEffects.push(this.defaultLightingEffect);
  }
}
