# LightingEffect

The Lighting Effect applies ambient, point and directional lighting to layers which support material property.

## Constructor

```js
new LightingEffect({light0, light1, light2, ...});
```

Parameters:
* `lights`(Object) - a collection of light sources. Keys can be any arbitrary name and values are instances of [LightSource](https://github.com/uber/luma.gl/tree/7.0-release/modules/core/src/lighting/light-source.js).

## Members

### Light Sources

##### `ambientLight` (Object, optional)

An [AmbientLight](/docs/api-reference/lights/ambient-light.md) source which illuminates all the objects equally.

* Default: ambient light source with color = `[255, 255, 255]` and intensity = `1.0`

##### `directionalLights` (Array, optional)

Array of [DirectionalLight](/docs/api-reference/lights/directional-light.md) source which emits from a specific directions.

* Default: two directional light sources

| Light Source |      Color      | Intensity |   Direction  |
|:------------:|:---------------:|:---------:|:------------:|
| 1            | [255, 255, 255] | 1.0       | [-1, -3, -1] |
| 2            | [255, 255, 255] | 0.9       | [1, 8, -2.5] |

##### `pointLights` (Array, optional)

Array of [PointLight](/docs/api-reference/lights/point-light.md) source which emits from a point in all directions.

* Default: `[]`

## Remarks

* Only one ambient light is supported.
* Point light position uses the same coordinate system as view state.

## Source

[/modules/core/src/effects/lighting-effect.js](https://github.com/uber/deck.gl/tree/7.0-release/modules/core/src/effects/lighting/lighting-effect.js)
