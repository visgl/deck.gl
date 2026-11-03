# DirectionalLight

Create a directional light source which emits from a specific direction.A directional light can be considered "infinitely" far away (like the Sun) and does not attenuate with distance. At most 5 directional lights can be supported.

<div align="center">
  <div>
    <img src="https://raw.github.com/visgl/deck.gl-data/master/images/whats-new/directional-light.gif" />
    <p><i>Two spheres with directional light</i></p>
  </div>
</div>

## Usage

Create a directional light source with color, intensity and direction.
```js
const directionalLight= new DirectionalLight({
  color: [128, 128, 0],
  intensity: 2.0,
  direction: [0, -100, -100]
});
```

## Methods

### constructor

The constructor for the `DirectionalLight` class. Use this to create a new `DirectionalLight`.

```js
const directionalLight = new DirectionalLight({color, intensity, direction});
```

* `color` - (number[3],)  RGB color of directional light source, default value is `[255, 255, 255]`.
* `intensity` - (number) Strength of directional light source, default value is `1.0`.
* `direction` - (number[3])  3D vector specifies the direction the light comes from, default value is `[0, 0, -1]`.
* `_shadow` - (boolean, optional) Enable experimental shadow effect, default value is `false`.
* `_shadowBounds` - (number[2][3], optional) Experimental. Fit the light's shadow map to the part of these bounds in view, instead of to the whole view: `[[minX, minY, minZ], [maxX, maxY, maxZ]]` in world coordinates (longitude, latitude and meters in geospatial views). Without bounds, the shadow map stretches over everything in view, so in zoomed-out or steeply pitched views its texels get coarse and small objects' shadows fade out. The shadow map covers a light-aligned box around the bounds: geometry just outside the bounds may still cast and receive shadows, and geometry beyond that box does not. The bounds should cover the full height of the shadow casters. Default value is `null`.

## Source

[/modules/core/src/effects/lighting/directional-light.ts](https://github.com/visgl/deck.gl/tree/master/modules/core/src/effects/lighting/directional-light.ts)
