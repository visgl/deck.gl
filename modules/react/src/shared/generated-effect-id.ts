// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Marks effects whose id the renderer may replace with one from the element's path.
 *
 * deck.gl effects take no `id` prop, so, unlike layers, views and widgets, an effect cannot say
 * whether its id was chosen by the app. Only the effect components know they built the effect
 * without one, so they mark it here. Raw effects passed to `<deckEffect>` are never marked and
 * keep their id.
 *
 * The mark is a property under a `Symbol.for` key rather than a WeakSet, so it survives when the
 * component subpaths and the root are bundled separately, each with its own copy of this module.
 * @internal
 */
const GENERATED_EFFECT_ID = Symbol.for('@deck.gl/react/generated-effect-id');

/** Marks an effect a component built, so the renderer gives it an id from its path. */
export function markGeneratedEffectId<EffectT extends object>(effect: EffectT): EffectT {
  Object.defineProperty(effect, GENERATED_EFFECT_ID, {value: true});
  return effect;
}

/** Whether a component built this effect, so the renderer may give it an id from its path. */
export function hasGeneratedEffectId(effect: object): boolean {
  return Object.prototype.hasOwnProperty.call(effect, GENERATED_EFFECT_ID);
}
