<p class="badges">
  <img src="https://img.shields.io/badge/lighting-yes-blue.svg?style=flat-square" alt="lighting" />
</p>

# ImageryLayer (Experimental)

> From v8.9

The `ImageryLayer` is a composite layer that connects with an image service that can render map images optimized for the current view. Instead of loading a detailed map image covering the entire globe, an image is rendered.

In contrast to the [`TileLayer`](/docs/api-reference/geo-layers/tile-layer.md) which loads many small image tiles, the `_ImageryLayer` loads a single image that covers the entire viewport in one single request, and updates the image by performing additional requests when the viewport changes.

To use this layer, an *image source* must be specified. Image sources are specified by supplying a URL to the `ImageryLayer` `data` property. See the section on image sources below for mor information.

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
import {_ImageryLayer as ImageryLayer} from '@deck.gl/geo-layers';
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

The `ImageryLayer` can accept URLs to geospatial image services such as WMS, however it is also possible to specify a custom URL template. 

### Layers

Image servers such as WMS can render different layers. Typically as list of layers **must** be specified, otherwise requests for map images will fail.

### Image Service Metadata

Image services like WMS can often provide metadata (aka capabilities) about the service, listing attribution information, available layers and additional capabilities. The `ImageryLayer` will automatically attempt to query metadata for known service types. Template URLs are specific to image requests and to not support metadata queries.

### Interactivity

WMS services sometimes provide a mechanism to query a specific pixel. This is supported through a method on the `ImageryLayer`

## Image Request Parameters

- `east`
- `north`
- `west`
- `south`
- `width`
- `height`


## Properties

Inherits all properties from [base `Layer`](/docs/api-reference/core/layer.md).

### Data Options

##### `data` (string, optional)

A base URL to a well-known service type, or a full URL template from which the map images should be loaded.

If `props.serviceType` is set to `'template'`, data is expected to be a URL template. Substrings `{east}` `{north}` `{east}` `{west}` `{south}`, `{width}` and `{height}` will be replaced with a viewports actual bounds and size. `{layers}` will be replaced with content of props.layers.

##### `serviceType` (string, optional)

- Default: `'auto'`

Specifies the type of service at the URL supplied in `props.data`. Currently accepts either `'wms'` or `'template'`. The default `'auto'` setting will try to autodetect service from the URL.

##### `layers` (string\[\], optional)

- Default: `[]` \*

Specifies names of layers that should be visualized from the image service. 

> Note that WMS services will typically not display anything unless at least on valid layer name is provided.


### Callbacks

##### `onMetadataLoadStart` (Function, optional)

`onMetadataLoadStart` is a function that is called when the `ImageryLayer` starts loading metadata after a new image source has been specified.

- Default: `data => null`


##### `onMetadataLoadComplete` (Function, optional)

`onMetadataLoadComplete` called when a tile successfully loads.

- Default: `(metadata) => {}`

Receives arguments:

- `metadata` (Object) - The metadata for the image services has been loaded. 

Note that metadata will not be loaded when `props.serviceType` is set to `'template`.

##### `onMetadataLoadError` (Function, optional)

`onMetadataLoadError` called when metadata failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)

##### `onImageLoadStart` (Function, optional)

`onImageLoadStart` is a function that is called when the `ImageryLayer` starts loading metadata after a new image source has been specified.

- Default: `data => null`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests

##### `onImageLoadComplete` (Function, optional)

`onImageLoadComplete` called when an image successfully loads.

- Default: `() => {}`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests

##### `onImageLoadError` (Function, optional)

`onImageLoadError` called when a tile failed to load.

- Default: `console.error`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests
- `error` (`Error`)


## Source

[modules/geo-layers/src/imagery-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/imagery-layer)
