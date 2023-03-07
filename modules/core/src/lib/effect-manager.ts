import {deepEqual} from '../utils/deep-equal';
import LightingEffect from '../effects/lighting/lighting-effect';
import type {Effect} from './effect';

const DEFAULT_LIGHTING_EFFECT = new LightingEffect();

/** Sort two effects. Returns 0 if equal, negative if e1 < e2, positive if e1 > e2 */
function compareEffects(e1: Effect, e2: Effect): number {
  const o1 = e1.order ?? Infinity;
  const o2 = e2.order ?? Infinity;
  return o1 - o2;
}

export default class EffectManager {
  effects: Effect[];
  private _resolvedEffects: Effect[] = [];
  /** Effect instances and order preference pairs, sorted by order */
  private _defaultEffects: Effect[] = [];
  private _needsRedraw: false | string;

  constructor() {
    this.effects = [];
    this._needsRedraw = 'Initial render';
    this._setEffects([]);
  }

  /**
   * Register a new default effect, i.e. an effect presents regardless of user supplied props.effects
   */
  addDefaultEffect(effect: Effect) {
    const defaultEffects = this._defaultEffects;
    if (!defaultEffects.find(e => e.id === effect.id)) {
      const index = defaultEffects.findIndex(e => compareEffects(e, effect) > 0);
      if (index < 0) {
        defaultEffects.push(effect);
      } else {
        defaultEffects.splice(index, 0, effect);
      }
      this._setEffects(this.effects);
    }
  }

  setProps(props) {
    if ('effects' in props) {
      // Compare effects against each other shallowly
      if (!deepEqual(props.effects, this.effects, 1)) {
        this._setEffects(props.effects);
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
    return this._resolvedEffects;
  }

  private _setEffects(effects: Effect[]) {
    const oldEffectsMap: Record<string, Effect> = {};
    for (const effect of this.effects) {
      oldEffectsMap[effect.id] = effect;
    }

    const nextEffects: Effect[] = [];
    for (const effect of effects) {
      const oldEffect = oldEffectsMap[effect.id];
      if (oldEffect && oldEffect !== effect) {
        if (oldEffect.setProps) {
          oldEffect.setProps(effect.props);
          nextEffects.push(oldEffect);
        } else {
          oldEffect.cleanup();
          nextEffects.push(effect);
        }
      } else {
        nextEffects.push(effect);
      }
      delete oldEffectsMap[effect.id];
    }
    for (const removedEffectId in oldEffectsMap) {
      oldEffectsMap[removedEffectId].cleanup();
    }
    this.effects = nextEffects;

    this._resolvedEffects = nextEffects.concat(this._defaultEffects);
    // Special case for lighting: only add default instance if no LightingEffect is specified
    if (!effects.some(effect => effect instanceof LightingEffect)) {
      this._resolvedEffects.push(DEFAULT_LIGHTING_EFFECT);
    }
    this._needsRedraw = 'effects changed';
  }

  finalize() {
    for (const effect of this._resolvedEffects) {
      effect.cleanup();
    }

    this.effects.length = 0;
    this._resolvedEffects.length = 0;
    this._defaultEffects.length = 0;
  }
}
