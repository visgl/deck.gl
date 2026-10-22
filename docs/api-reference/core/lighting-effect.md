# LightingEffect

The `LightingEffect` applies ambient, point and directional lighting to layers which support material property.

[deck.gl LightingEffect Demo](https://codepen.io/vis-gl/embed/ZZwrZz/?height=450\&theme-id=light\&default-tab=result)

## Constructor[​](#constructor "Direct link to Constructor")

```
new LightingEffect({light0, light1, light2, ...});
```

Parameters:

* `lights`(object) - a collection of light sources. Keys can be any arbitrary name and values.

## Members[​](#members "Direct link to Members")

### Light Sources[​](#light-sources "Direct link to Light Sources")

#### `ambientLight` (AmbientLight, optional)[​](#ambientlight "Direct link to ambientlight")

An [AmbientLight](https://deck.gl/docs/api-reference/core/ambient-light.md) source which illuminates all the objects equally.

* Default: ambient light source with color = `[255, 255, 255]` and intensity = `1.0`

#### `directionalLights` (DirectionalLight\[], optional)[​](#directionallights "Direct link to directionallights")

Array of [DirectionalLight](https://deck.gl/docs/api-reference/core/directional-light.md) source which emits from a specific directions.

* Default: two directional light sources

| Light Source | Color            | Intensity | Direction     | \_shadow |
| ------------ | ---------------- | --------- | ------------- | -------- |
| 1            | \[255, 255, 255] | 1.0       | \[-1, -3, -1] | false    |
| 2            | \[255, 255, 255] | 0.9       | \[1, 8, -2.5] | false    |

* For rendering experimental shadow effect, `_shadow` prop of [DirectionalLight](https://deck.gl/docs/api-reference/core/directional-light.md) must be set to `true`. The effect can be toggled on and off for a layer by setting layer's `shadowEnabled` prop.

#### `pointLights` (PointLight\[], optional)[​](#pointlights "Direct link to pointlights")

Array of [PointLight](https://deck.gl/docs/api-reference/core/point-light.md) source which emits from a point in all directions.

* Default: `[]`

## Remarks[​](#remarks "Direct link to Remarks")

* Only one ambient light is supported.
* Point light position uses the same coordinate system as view state.

## Source[​](#source "Direct link to Source")

[/modules/core/src/effects/lighting/lighting-effect.ts](https://github.com/visgl/deck.gl/tree/9.4-release/modules/core/src/effects/lighting/lighting-effect.ts)
