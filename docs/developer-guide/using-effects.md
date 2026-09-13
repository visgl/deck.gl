# Using Effects

Effects are part of the render pipeline that affect the visuall of all layers. Deck.gl by default uses a `LightingEffect` to render its 3D geometries. Other effects can be found in `core` and `extensions` modules. Applications may also implement the `Effect` interface to create custom effects.

The effect system is part of deck.gl's highly extensible architecture. It allows users to choose from a wide variety of features without adding excessive weight to the bundle size.

## Lighting

A lighting effect is a visual approximation of environment illumination based on simplified models to make rendering appear more realistic.

<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" width="100%" scrolling="no" title="deck.gl LightingEffect Demo" src="https://codepen.io/vis-gl/embed/ZZwrZz/?height=450&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/ZZwrZz/'>deck.gl LightingEffect Demo</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>

*Interactive demo of LightingEffect*

### Light Settings

A [LightingEffect](../api-reference/core/lighting-effect.md) can be instantiated with one or more light instances:


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="ts" label="TypeScript">

```js
import {Deck, AmbientLight, SunLight, LightingEffect} from '@deck.gl/core';

// create an ambient light
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
// create directional light from the sun
const directionalLight = new SunLight({
  timestamp: Date.UTC(2024, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, directionalLight});

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11,
    pitch: 45
  },
  controller: true,
  // Add lighting effect to deck
  effects: [lightingEffect]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {AmbientLight, SunLight, LightingEffect} from '@deck.gl/core';

// create an ambient light
const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});
// create directional light from the sun
const directionalLight = new SunLight({
  timestamp: Date.UTC(2024, 7, 1, 22),
  color: [255, 255, 255],
  intensity: 1.0,
});
// create lighting effect with light sources
const lightingEffect = new LightingEffect({ambientLight, directionalLight});

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 27.8,
  zoom: 11,
  pitch: 45
};

function App() {
  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller
    effects={[lightingEffect]}
  />;
}
```

  </TabItem>
</Tabs>


The `lights` has all the light sources that the lighting effect uses to build the visualization. Users typically specify the following types of light sources:

* [AmbientLight](../api-reference/core/ambient-light.md)
* [PointLight](../api-reference/core/point-light.md)
* [DirectionalLight](../api-reference/core/directional-light.md)
* [CameraLight](../api-reference/core/camera-light.md)
* [SunLight](../api-reference/core/sun-light.md)

If no LightingEffect is supplied by the user, a default LightingEffect is used.

#### Shadows

`DirectionalLight` and `SunLight` have an experimental option `_shadow`. If enabled, geometries rendered by layers will cast shadows on each other. A layer can opt-out by setting a prop `shadowEnabled: false`.

### Material Settings

Lighting is only applied to 2.5D (e.g. extruded `HexagonLayer` or `PolygonLayer`) or 3D (e.g. `PointCloudLayer`, `SimpleMeshLayer`) layers. 
Most of these layers support a `material` prop that defines how the layer interacts with the global lighting.

A material is a plain JavaScript object with the following fiields:
- `ambient` (number) Between 0-1. Default `0.35`.
- `diffuse` (number) Between 0-1. Default `0.6`.
- `shininess` (number) Larger than 0. Default `32`.
- `specularColor` (number[3]). RGB color, each channel in 0-1 range. Default `[0.15, 0.15, 0.15]`.

Setting a material property to the value `true` will set all properties to their defaults.

```ts
new GeoJsonLayer({
  id: 'geojson-layer',
  data: '/path/to/data.geo.json',
  // lighting only applies to extruded polygons
  extruded: true,
  getElevation: f => f.properties.height,
  material: {
    ambient: 0.8,
    specularColor: [0.3, 0.1, 0.2]
  }
});
```

Some layers, such as `ScenegraphLayer` and `Tile3DLayer`, uses materials defined inside the glTF format. Refer to the documentation of each layer to see what settings are supported.


## Post-Processing

The post-processing effect applies screen space pixel manipulation effects to the deck.gl canvas.


<div style={{position:'relative',height:450}}></div>
<div style={{position:'absolute',transform:'translateY(-450px)',paddingLeft:'inherit',paddingRight:'inherit',left:0,right:0}}>
  <iframe height="450" width="100%" scrolling="no" title="deck.gl PostProcessEffect Demo" src="https://codepen.io/vis-gl/embed/YbRGvv/?height=450&theme-id=light&default-tab=result" frameborder="no" allowtransparency="true" allowfullscreen="true">
    See the Pen <a href='https://codepen.io/vis-gl/pen/YbRGvv/'>deck.gl PostProcessEffect Demo</a> by vis.gl
    (<a href='https://codepen.io/vis-gl'>@vis-gl</a>) on <a href='https://codepen.io'>CodePen</a>.
  </iframe>
</div>
*Interactive demo of PostProcessEffect*


`@luma.gl/effects` provides a collection of [shader modules](https://luma.gl/docs/api-reference/shadertools/shader-passes/image-processing) that implements some common image processing algorithms. You may also refer to their source code to see how to implement your own.

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {brightnessContrast} from '@luma.gl/effects';
import {Deck, PostProcessEffect} from '@deck.gl/core';

const postProcessEffect = new PostProcessEffect(brightnessContrast, {
  brightness: 1.0,
  contrast: 1.0
});

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 37.8,
    zoom: 11
  },
  controller: true,
  // add post-processing effect to deck
  effects: [postProcessEffect]
});
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {brightnessContrast, BrightnessContrastProps} from '@luma.gl/effects';
import {Deck, PostProcessEffect} from '@deck.gl/core';

const postProcessEffect = new PostProcessEffect(brightnessContrast, {
  brightness: 1.0,
  contrast: 1.0
} as BrightnessContrastProps);

const deckInstance = new Deck({
  // ...
  effects: [postProcessEffect]
});
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React from 'react';
import {DeckGL} from '@deck.gl/react';
import {brightnessContrast, BrightnessContrastProps} from '@luma.gl/effects';
import {PostProcessEffect} from '@deck.gl/core';

const postProcessEffect = new PostProcessEffect(brightnessContrast, {
  brightness: 1.0,
  contrast: 1.0
} as BrightnessContrastProps);

function App() {
  return <DeckGL
    // ...
    effects={[postProcessEffect]}
  />;
}
```

  </TabItem>
</Tabs>


