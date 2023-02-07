import {deepEqual} from '../utils/deep-equal';
import LightingEffect from '../effects/lighting/lighting-effect';
import type {Effect} from './effect';

const DEFAULT_LIGHTING_EFFECT = new LightingEffect();

export default class EffectManager {
  effects: Effect[];
  private _resolvedEffects: Effect[] = [];
  /** Effect instances and order preference pairs, sorted by order */
  private _defaultEffects: {effect: Effect; order: number}[] = [];
  private _needsRedraw: false | string;

  constructor() {
    this.effects = [];
    this._needsRedraw = 'Initial render';
    this._setEffects([]);
  }

  // TODO - better Effect API, may be cleaner to add `order` to `Effect` class
  /**
   * Register a new default effect, i.e. an effect present regardless of user supplied props.effects
   */
  addDefaultEffect(
    /** Effect instance. The same effect can only be added once. */
    effect: Effect,
    /** Used to sort effects. In case of conflict, effects will be used in the order of registration. */
    order: number = Infinity
  ) {
    const defaultEffects = this._defaultEffects;
    if (!defaultEffects.find(e => e.effect.constructor === effect.constructor)) {
      const index = defaultEffects.findIndex(e => e.order > order);
      if (index < 0) {
        defaultEffects.push({effect, order});
      } else {
        defaultEffects.splice(index, 0, {effect, order});
      }
      this._setEffects(this.effects);
    }
  }

  setProps(props) {
    if ('effects' in props) {
      // Compare effects against each other shallowly
      if (
        props.effects.length !== this.effects.length ||
        !deepEqual(props.effects, this.effects, 1)
      ) {
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

    this._resolvedEffects = nextEffects.concat(this._defaultEffects.map(e => e.effect));
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
