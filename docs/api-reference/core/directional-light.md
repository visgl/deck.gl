# DirectionalLight

Create a directional light source which emits from a specific direction.A directional light can be considered "infinitely" far away (like the Sun) and does not attenuate with distance. At most 5 directional lights can be supported.

![](https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/directional-light.gif)

*Two spheres with directional light*

## Usage[​](#usage "Direct link to Usage")

Create a directional light source with color, intensity and direction.

```
const directionalLight= new DirectionalLight({

  color: [128, 128, 0],

  intensity: 2.0,

  direction: [0, -100, -100]

});
```

## Methods[​](#methods "Direct link to Methods")

### constructor[​](#constructor "Direct link to constructor")

The constructor for the `DirectionalLight` class. Use this to create a new `DirectionalLight`.

```
const directionalLight = new DirectionalLight({color, intensity, direction});
```

* `color` - (number\[3],) RGB color of directional light source, default value is `[255, 255, 255]`.
* `intensity` - (number) Strength of directional light source, default value is `1.0`.
* `direction` - (number\[3]) 3D vector specifies the direction the light comes from, default value is `[0, 0, -1]`.
* `_shadow` - (boolean, optional) Enable experimental shadow effect, default value is `false`.

## Source[​](#source "Direct link to Source")

[/modules/core/src/effects/lighting/directional-light.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/effects/lighting/directional-light.ts)
