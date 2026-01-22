# MapboxLayer

:::caution Deprecated
`MapboxLayer` is no longer part of the public API. Use [MapboxOverlay](./mapbox-overlay.md) instead, which provides a simpler and more robust way to render deck.gl layers with Mapbox GL JS or MapLibre GL JS.
:::

`MapboxLayer` is an internal implementation of [Mapbox GL JS](https://www.npmjs.com/package/mapbox-gl)'s [CustomLayerInterface](https://docs.mapbox.com/mapbox-gl-js/api/properties/#customlayerinterface) API used by `MapboxOverlay` to render deck.gl layers inside the mapbox canvas / WebGL2 context.

## Migration

Replace direct `MapboxLayer` usage with `MapboxOverlay`:

```js
import {MapboxOverlay} from '@deck.gl/mapbox';
import {ScatterplotLayer} from '@deck.gl/layers';

const map = new mapboxgl.Map({...});

const overlay = new MapboxOverlay({
  interleaved: true,
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [
        {position: [-74.5, 40], size: 100}
      ],
      getPosition: d => d.position,
      getRadius: d => d.size,
      getColor: [255, 0, 0]
    })
  ]
});

map.addControl(overlay);

// Update layers
overlay.setProps({
  layers: [
    new ScatterplotLayer({
      id: 'my-scatterplot',
      data: [...],
      getColor: [0, 0, 255]
    })
  ]
});
```

See [MapboxOverlay](./mapbox-overlay.md) for full documentation.
