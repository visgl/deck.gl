# Using Lighting

A deck.gl lighting effect is a visual approximation of environment illumination based on simplified models to make rendering appear more realistic.

To enable lighting in deck.gl, it is required that both the lighting effect and material instances are properly instantiated.

<iframe height="450" style="width: 100%;" scrolling="no" title="deck.gl LightingEffect Demo" src="https://codepen.io/vis-gl/embed/ZZwrZz/?height=450&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
  See the Pen <a href='https://codepen.io/vis-gl/pen/ZZwrZz/'>deck.gl LightingEffect Demo</a> by vis.gl
  (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
</iframe>

*Interactive demo of LightingEffect*

## Constructing A Lighting Effect Instance

A [LightingEffect](/docs/effects/lighting-effect.md) can be instantiated with a `lights` object:

```js
import {AmbientLight, PointLight, DirectionalLight, LightingEffect} from '@deck.gl/core';

// create ambient light source
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
// create point light source
const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  // use coordinate system as the same as view state
  position: [-125, 50.5, 5000]
});
// create directional light source
const directionalLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 1.0,
  direction: [-3, -9, -1]
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, pointLight, directionalLight});
```

The `lights` has all the light sources that the lighting effect uses to build the visualization. Users typically specify the following types of light sources:

* [AmbientLight](/docs/api-reference/lights/ambient-light.md)
* [PointLight](/docs/api-reference/lights/point-light.md)
* [DirectionalLight](/docs/api-reference/lights/directional-light.md)
* [CameraLight](/docs/api-reference/lights/camera-light.md)
* [SunLight](/docs/api-reference/lights/sun-light.md)


## Constructing A Material Instance

A material is a plain JavaScript object representing a lighting model specified per layer. Properties are `ambient` (number 0-1), `diffuse` (number 0-1), `shininess` (number > 0), `specularColor` (array [0-255, 0-255, 0-255]). Setting a material property to the value `true` will set all properties to their defaults, which are:

```js
{
  ambient: 0.35,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [30, 30, 30]
}
```


## Using Materials

```js
new GeoJsonLayer({
  id: 'geojson-layer',
  // layer props
  ...
  // lighting only applies to extruded polygons
  extruded: true,
  // specify material properties per layer
  material
});
```
Refer to each layer's [documentation](/docs/layers/README.md) to see if the material prop is supported.

## Using Effects

### Pure JS

```js
import {Deck, LightingEffect} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

const lightingEffect = new LightingEffect({
  ...
});

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  pitch: 45
};
const deckgl = new Deck({
  canvas: 'my-deck-canvas',
  initialViewState: INITIAL_VIEW_STATE,
  controller: true,
  // add lighting effect to deck
  effects: [lightingEffect],
  layers: [new GeoJsonLayer({
    ...
  })]
});
```

### React

```js
import DeckGL from '@deck.gl/react';
import {LightingEffect} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

const lightingEffect = new LightingEffect({
  ...
});

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  pitch: 45
};

<DeckGL
  initialViewState={INITIAL_VIEW_STATE}
  controller={true}
  effects={[lightingEffect]}
  layers={[new GeoJsonLayer({
    ...
  })]}
/>
```

## Remarks

* A default lighting effect is created in deck when user doesn't provide one.
* A default material is created in layers which support material prop.
* Lighting is only applied to extruded polygons or point clouds.
