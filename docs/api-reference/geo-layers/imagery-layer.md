<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# ImageryLayer (Experimental)

> From v8.9

The `ImageryLayer` is a composite layer that connects with an image service that can render map images optimized for the current view. Instead of loading a detailed map image covering the entire globe, an image is rendered.

To use this layer, an *image source* must be specified. Image sources are typically specified by supplying a URL to the `ImageryLayer` `data` property. See the section on image sources below for mor information.

> Caveats: 
> - The `ImageryLayer` currently does not work well with multiple views.
> - The `ImageryLayer` currently does not work well with perspective views.
> - The `ImageryLayer` has not been adapted to work with non-geospatial views such as the [OrthographicView](/docs/api-reference/core/orthographic-view.md) or the [OrbitView](/docs/api-reference/core/orbit-view.md).


```typescript
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {ImageryLayer} from '@deck.gl/geo-layers';

function App({viewState}) {
  const layer = new ImageryLayer({
    data: `https://ows.terrestris.de/osm/service`,
    serviceType: 'wms',
    layers: ['OSM-WMS']
  });

  return <DeckGL viewState={viewState} layers={[layer]} />;
}
```


## Installation

To install the dependencies from NPM:

```bash
npm install deck.gl
# or
npm install @deck.gl/core @deck.gl/layers @deck.gl/geo-layers
```

```typescript
import {ImageryLayer} from '@deck.gl/geo-layers';
new ImageryLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^8.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^8.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^8.0.0/dist.min.js"></script>
```

```typescript
new deck.ImageryLayer({});
```

## Image Sources

The `ImageryLayer` knows how to URLs for some well-known geospatial services such as WMS, however it is also possible to specify a custom URL template. 

### Layers

Many image servers such as WMS can render multiple layers. In fact .

### Image Request Parameters

- `bounds`
- `width`
- `height

At each integer zoom level (`z`), the XY plane in the view space is divided into square tiles of the same size, each uniquely identified by their `x` and `y` index. When `z` increases by 1, the view space is scaled by 2, meaning that one tile at `z` covers the same area as four tiles at `z+1`.

The `ImageryLayer` is optimized for use with geospatial views, such as the [MapView](/docs/api-reference/core/map-view.md).

> The `ImageryLayer` has not yet been tested with non-geospatial views such as the [OrthographicView](/docs/api-reference/core/orthographic-view.md) or the [OrbitView](/docs/api-reference/core/orbit-view.md).


### Service Metadata

Many map image services provide an end-point for querying 

### Service Interactivity

Some map image services support performing queries around a certain pixel.

## Properties

Inherits all properties from [base `Layer`](/docs/api-reference/core/layer.md).

### Data Options

##### `data` (string, optional)

- Default: ``

A base URL to a well-known service type, or a full URL template from which the map images should be loaded.

If `props.serviceType` is `'template'`: a URL template. Substrings `{east}` `{north}` `{east}` `{west}` `{south}`, `{width}` and `{height}` if present, will be replaced with a viewports actual bounds and size. `{layers}` will be replaced with content of props.layers.

##### `serviceType` (string, optional)

- Default: `wms`

Specifies the type of service at the URL supplied in `props.data`. Either `'wms'` or `'template'`.

##### `layers` (string\[\], optional)

- Default: `[]`

Specifies names of layers that should be visualized from the image service. Note that WMS services will not display anything unless valid layer names are provided.


### Callbacks

##### `onMetadataLoadStart` (Function, optional)

`onMetadataLoadStart` is a function that is called when the `ImageryLayer` starts loading metadata after a new image source has been specified.

- Default: `data => null`


##### `onMetadataLoadComplete` (Function, optional)

`onMetadataLoadComplete` called when a tile successfully loads.

- Default: `() => {}`

Receives arguments:

- `tile` (Object) - the [tile](#tile) that has been loaded.

##### `onMetadataLoadError` (Function, optional)

`onMetadataLoadError` called when a tile failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)

##### `onMetadataLoadStart` (Function, optional)

`onMetadataLoadStart` is a function that is called when the `ImageryLayer` starts loading metadata after a new image source has been specified.

- Default: `data => null`

##### `onMetadataLoadComplete` (Function, optional)

`onMetadataLoadComplete` called when a tile successfully loads.

- Default: `() => {}`

Receives arguments:

- `tile` (Object) - the [tile](#tile) that has been loaded.

##### `onMetadataLoadError` (Function, optional)

`onMetadataLoadError` called when a tile failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)


## Source

[modules/geo-layers/src/imagery-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/imagery-layer)
