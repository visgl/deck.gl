# LightingEffect

The Lighting Effect applies ambient, point and directional lighting to layers which support material property.

```js
import DeckGL, {GeoJsonLayer, LightingEffect} from '@deck.gl/core';
import {AmbientLight, PointLight, DirectionalLight, PhongMaterial} from '@luma.gl/core';

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

const lightingEffect = new LightingEffect({ambientLight, pointLight, directionalLight});

const material =  new PhongMaterial({
  ambient: 0.2,
  diffuse: 0.5,
  shininess: 32,
  specularColor: [255, 255, 255]
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
  layers: [
    new GeoJsonLayer({
        id: 'geojson-layer',
        // layer props
        ...
        // lighting only applies to extruded polygons
        extruded: true,
        // specify material properties per layer
        material
    })
  ]
});
```

## Constructor

```js
new LightingEffect({light0, light1, light2, ...});
```

Parameters:
* props: a collection of light sources

## Properties

### Light Sources

##### `ambientLight` (Object, optional)

An ambient light source which illuminates all the objects equally.

* Default: ambient light source with color = `[255, 255, 255]` and intensity = `1.0`

##### `directionalLights` (Array, optional)

Array of Directional light source which emits from a specific directions.

* Default: Two directional light sources

| Light Source |      Color      | Intensity |   Direction  |
|:------------:|:---------------:|:---------:|:------------:|
| 1            | [255, 255, 255] | 1.0       | [-1, -3, -1] |
| 2            | [255, 255, 255] | 0.9       | [1, 8, -2.5] |

##### `pointLights` (Array, optional)

Array of point light source which emits from a point in all directions.

* Default: `[]`

## Remarks

* Point light position uses the same coordinate system as view state.
* To enable lighting on a layer, it is required that both the [effects prop of Deck](/docs/api-reference/deck.md?section=effects) and the material prop of the layer are specified. Refer to each layer's documentation to see if the lighting effect is supported.
    * [GeoJsonLayer](/docs/layers/geojson-layer.md)
    * [HexagonLayer](/docs/layers/hexagon-layer.md)
    * [HexagonCellLayer](/docs/layers/hexagon-cell-layer.md)
    * [GridLayer](/docs/layers/grid-layer.md)
    * [GridCellLayer](/docs/layers/grid-cell-layer.md)
    * [PointCloudLayer](/docs/layers/point-cloud-layer.md)
    * [PolygonLayer](/docs/layers/polygon-layer.md)

## Source

[/modules/core/src/effects/lighting-effect.js](https://github.com/uber/deck.gl/tree/master/modules/core/src/effects/lighting-effect.js)
