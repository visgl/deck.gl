// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
import { deepEqual } from "../utils/deep-equal.js";
import LightingEffect from "../effects/lighting/lighting-effect.js";
const DEFAULT_LIGHTING_EFFECT = new LightingEffect();
/** Sort two effects. Returns 0 if equal, negative if e1 < e2, positive if e1 > e2 */
function compareEffects(e1, e2) {
    const o1 = e1.order ?? Infinity;
    const o2 = e2.order ?? Infinity;
    return o1 - o2;
}
export default class EffectManager {
    constructor(context) {
        this._resolvedEffects = [];
        /** Effect instances and order preference pairs, sorted by order */
        this._defaultEffects = [];
        this.effects = [];
        this._context = context;
        this._needsRedraw = 'Initial render';
        this._setEffects([]);
    }
    /**
     * Register a new default effect, i.e. an effect presents regardless of user supplied props.effects
     */
    addDefaultEffect(effect) {
        const defaultEffects = this._defaultEffects;
        if (!defaultEffects.find(e => e.id === effect.id)) {
            const index = defaultEffects.findIndex(e => compareEffects(e, effect) > 0);
            if (index < 0) {
                defaultEffects.push(effect);
            }
            else {
                defaultEffects.splice(index, 0, effect);
            }
            effect.setup(this._context);
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
    needsRedraw(opts = { clearRedrawFlags: false }) {
        const redraw = this._needsRedraw;
        if (opts.clearRedrawFlags) {
            this._needsRedraw = false;
        }
        return redraw;
    }
    getEffects() {
        return this._resolvedEffects;
    }
    _setEffects(effects) {
        const oldEffectsMap = {};
        for (const effect of this.effects) {
            oldEffectsMap[effect.id] = effect;
        }
        const nextEffects = [];
        for (const effect of effects) {
            const oldEffect = oldEffectsMap[effect.id];
            let effectToAdd = effect;
            if (oldEffect && oldEffect !== effect) {
                if (oldEffect.setProps) {
                    oldEffect.setProps(effect.props);
                    effectToAdd = oldEffect;
                }
                else {
                    oldEffect.cleanup(this._context);
                }
            }
            else if (!oldEffect) {
                effect.setup(this._context);
            }
            nextEffects.push(effectToAdd);
            delete oldEffectsMap[effect.id];
        }
        for (const removedEffectId in oldEffectsMap) {
            oldEffectsMap[removedEffectId].cleanup(this._context);
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
            effect.cleanup(this._context);
        }
        this.effects.length = 0;
        this._resolvedEffects.length = 0;
        this._defaultEffects.length = 0;
    }
}
//# sourceMappingURL=effect-manager.js.map