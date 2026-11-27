# ShadowMapEffect

`ShadowMapEffect` adds soft, cascaded directional shadows to a WebGPU scene using luma.gl's `ShadowMapRenderer`. Pair it with a `LightingEffect` to light the scene and pass the same direction to both effects.

```
import {Deck, DirectionalLight, LightingEffect, ShadowMapEffect} from '@deck.gl/core';



const direction: [number, number, number] = [1, -0.5, -1];

const deck = new Deck({

  deviceProps: {type: 'webgpu'},

  effects: [

    new LightingEffect({sun: new DirectionalLight({direction})}),

    new ShadowMapEffect({direction, quality: 'balanced'})

  ],

  layers

});
```

## Options[​](#options "Direct link to Options")

* `direction` is the direction the light travels in Deck common space.
* `quality` is `'low'`, `'balanced'`, or `'cinematic'`. Higher quality increases the shadow-map resolution and sampling cost. The default is `'balanced'`.
* `shadowColor` is a normalized RGBA tint. The default is `[0, 0, 0, 0.6]`.

The effect renders shadows for one WebGPU viewport with a finite, positive camera depth range. Set `repeat: false` when using a map view with world wrapping. Set `shadowEnabled: false` on a layer that should receive shadows without casting them. Leave the experimental `DirectionalLight._shadow` option disabled when using this effect, since that option selects the shadow pass built into `LightingEffect`.
