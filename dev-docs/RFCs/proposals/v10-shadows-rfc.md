# RFC: Shadows in deck.gl v10

* **Authors**: Ib Green, Chris Gervang
  * Builds on Ib's `ShadowMapEffect` (#11355) and luma.gl's `ShadowMapRenderer` and hybrid shadow RFC. Chris adds the light-property approach for comparison.
* **Date**: Nov 2026
* **Status**: Draft for discussion

References:

* [RFC: Shadow for directional lights](../v7.2/shadow-for-directional-lights.md) (v7.2, approved)
* luma.gl [RFC: High-Quality Hybrid Shadow System](https://github.com/visgl/luma.gl/blob/master/dev-docs/RFCs/vNext/hybrid-shadow-system-rfc.md)
* #11355 (`ShadowMapEffect`), #11353 (closed WebGPU port of `_shadow`), #11361, trackers #9504 and #10712

## Abstract

luma.gl's `ShadowMapRenderer` gives deck.gl soft, cascaded shadows. It works on WebGPU and WebGL2. This RFC settles how deck.gl v10 exposes it to apps. It compares two approaches:

* **A. Shadow effect.** This is the current approach, merged as an experimental, opt-in effect in #11355.
* **B. Shadow option on the light.** This is a proposed alternative.

## Background

* The v7.2 RFC made `DirectionalLight` the public interface for shadows, with `_shadow: true` and the layer prop `shadowEnabled`.
* `ShadowMapRenderer` (`@luma.gl/engine/lighting`) owns the shadow maps and records the depth draws an app supplies. It supports cascaded directional lights, spot lights and point lights. luma.gl master adds multiple directional casters (luma.gl #3945).
* #11353, a WebGPU port of `_shadow`, was closed. Per #11361, `_shadow` stays WebGL-only, and `ShadowMapEffect` is the WebGPU path.
* #11317 makes standalone Deck instances prefer WebGPU, and fall back to WebGL2 when no WebGPU adapter is available.

## Goals

1. One way for apps to get shadows, whichever backend Deck selects.
2. The light's direction is written in one place.
3. Works the same in JavaScript, `@deck.gl/json` and pydeck, and the React renderer.
4. Room for more lights later: multiple directional casters, spot and point lights.
5. A clear path for `_shadow`.

## Approach A: shadow effect (current)

```ts
const direction: [number, number, number] = [1, -0.5, -1];
new Deck({
  effects: [
    new LightingEffect({sun: new DirectionalLight({direction})}),
    new ShadowMapEffect({direction, quality: 'balanced'})
  ]
});
```

* Shadows are a separate effect. Default `LightingEffect` behavior stays exactly as it was, and apps opt in by adding one effect.
* It maps directly onto `ShadowMapRenderer`'s inputs, so it is a thin layer over luma.gl.
* As merged, it supports one directional light and one viewport, and only WebGPU (`setup` throws on WebGL).

Possible changes within this approach:

* **A1.** Accept WebGL2 devices, since the renderer supports both backends.
* **A2.** Take the light instead of a separate `direction`: `new ShadowMapEffect({light: sun})`, as Babylon.js's `ShadowGenerator` does.
* **A3.** Refer to the light by name (`{light: 'sun'}`), so that JSON can express A2.

## Approach B: shadow option on the light (proposed)

```ts
new LightingEffect({
  sun: new DirectionalLight({direction: [1, -0.5, -1], shadow: true})
});
```

* `shadow` (`boolean | {quality?: 'low' | 'balanced' | 'cinematic'}`, optional). Default: `false`. `true` means `{}`.
* `LightingEffect` creates a `ShadowMapRenderer` when any of its lights has `shadow` set, and passes those lights to it each frame. `shadowColor` and the layer prop `shadowEnabled` stay as they are.
* The caster pass and receiver plugin from #11355 move into `LightingEffect`.
* `_shadow` maps to `shadow: true` with a deprecation warning, and is removed in v11. This follows the v7.2 RFC's choice of the light as the public interface.

## Comparison

| | A as merged | A with A1 and A2 | B |
| --- | --- | --- | --- |
| Works on WebGL2 fallback | No | Yes | Yes |
| Direction written once | No | Yes in JavaScript | Yes |
| JSON, pydeck | Two directions | Two light copies, or a name (A3) | One object |
| React | Two sibling effects | Shared memoized light | One element |
| Default `LightingEffect` unchanged | Yes | Yes | Yes when no light sets `shadow` |
| More lights later | New props on the effect | Accept a list of lights | One option per light |
| `_shadow` | Stays separate | Stays separate | Maps to `shadow` |

The same setup written in JSON:

```json
[
  {"@@type": "LightingEffect", "sun": {"@@type": "DirectionalLight", "direction": [1, -0.5, -1]}},
  {"@@type": "ShadowMapEffect", "direction": [1, -0.5, -1]}
]
```

```json
[
  {"@@type": "LightingEffect",
   "sun": {"@@type": "DirectionalLight", "direction": [1, -0.5, -1], "shadow": true}}
]
```

`@deck.gl/json` has no object references. Every `@@type` creates a new instance, so A2 needs A3 to work in JSON.

## Questions for discussion

1. Is `ShadowMapRenderer`'s WebGL2 path supported for production use? Its docs say "works with WebGPU and WebGL2". The luma.gl RFC status says "Implemented experimentally for WebGPU". Both A1 and B depend on the answer.
2. Should shadows stay an opt-in effect (A) or become part of lighting (B)? Is there a case for keeping the effect as a lower-level escape hatch next to B?
3. What happens to `_shadow` in v10: kept as WebGL-only, deprecated, or mapped onto the new renderer?
4. Should multiple shadowed directional lights be in v10, or come after it?

## Follow-ups that apply to either approach

* Reset the caster state for the collision pass. See the #11355 review.
* Rewrite the reference page in the standard prop format, and add a whats-new entry.
* Add render cases on both backends: one light, a layer with `shadowEnabled: false`, and an off-center camera.
