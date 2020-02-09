# ArcGISDeckLayer

This class inherits from the ArcGIS [Layer](https://developers.arcgis.com/javascript/latest/api-reference/esri-layers-Layer.html) class and can be added to maps created with the ArcGIS API for JavaScript.

## Usage

```js
  import ArcGISMap from 'esri/Map';
  import MapView from 'esri/views/MapView';
  import {ArcGISDeckLayer} from '@deck.gl/arcgis';
  import {GeoJsonLayer} from '@deck.gl/layers';

  const layer = new ArcGISDeckLayer({
    getDeckLayer() {
      return [
        new GeoJsonLayer({
          ...
        })
      ];
    }
  });

  const view = new MapView({
    container: 'app',
    map: new ArcGISMap({
      basemap: 'dark-gray-vector',
      layers: [layer]
    }),
    center: [0.119167, 52.205276],
    zoom: 3
  });
```


## Constructor

```js
const layer = new ArcGISDeckLayer(props)
```

`props` are forwarded to a `Deck` instance. The following [Deck](/docs/api-reference/deck.md) props are supported:

- `layers`
- `effects`
- `parameters`
- `pickingRadius`
- `useDevicePixels`
- `onWebGLInitialized`
- `onBeforeRender`
- `onAfterRender`
- `onLoad`

## Methods

##### `foo`

```js
layer.foo();
```

Does `bar/baz`.
