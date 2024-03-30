# WMSLayer (Experimental)

<p class="badges">
  <img src="https://img.shields.io/badge/from-v8.9-green.svg?style=flat-square" alt="from v8.9" />
</p>

import {WMSLayerDemo} from '@site/src/doc-demos/geo-layers';

<WMSLayerDemo />

> This class is experimental, which means it does not provide the compatibility and stability that one would typically expect from other layers, detailed in the [limitations](#limitations) section. Use with caution and report any issues that you find on GitHub.


The `WMSLayer` is a composite layer that connects with an image service that can render map images optimized for the current view. Instead of loading a detailed map image covering the entire globe, an image is rendered.

In contrast to the [TileLayer](./tile-layer.md) which loads many small image tiles, the `WMSLayer` loads a single image that covers the entire viewport in one single request, and updates the image by performing additional requests when the viewport changes.

To use this layer, an *image source* must be specified. Image sources are specified by supplying a URL to the `WMSLayer` `data` property. See the section on image sources below for mor information.


```typescript
import DeckGL from '@deck.gl/react';
import {BitmapLayer} from '@deck.gl/layers';
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';

function App({viewState}) {
  const layer = new WMSLayer({
    data: 'https://ows.terrestris.de/osm/service',
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
import {_WMSLayer as WMSLayer} from '@deck.gl/geo-layers';
new WMSLayer({});
```

To use pre-bundled scripts:

```html
<script src="https://unpkg.com/deck.gl@^9.0.0/dist.min.js"></script>
<!-- or -->
<script src="https://unpkg.com/@deck.gl/core@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/layers@^9.0.0/dist.min.js"></script>
<script src="https://unpkg.com/@deck.gl/geo-layers@^9.0.0/dist.min.js"></script>
```

```typescript
new deck._WMSLayer({});
```

## Image Sources

The `WMSLayer` needs a URL to an image source from which it can start loading map images. The `WMSLayer` knows how to build URLs for geospatial image services such as WMS. 

However, it is also possible to connect the WMSLayer to any other REST based service that can render map images from a set of web mercator bounds and a given pixel resolution (perhaps an ArcGIS image server) by specify a custom URL template.

Note that additional features, such as metadata loading, is only supported for known image services, which currently only includes WMS.

### Layers

Image servers such as WMS can render different layers. Typically as list of layers **must** be specified, otherwise requests for map images will fail. For WMS services, this is controlled by `props.layers`. For other services, layers (if required by that service) can be specified in the template URL, either as a parameter or as a hard-coded part of the template string. 

### Image Service Metadata

Image services like WMS can often provide metadata (aka capabilities) about the service, listing;
- attribution information, 
- available layers
- additional capabilities (pixel/neighborhood queries, legend generation etc). 

The `WMSLayer` will automatically attempt to query metadata for known service types (currently WMS). 

Template URLs only cover image requests and there is no support for providing a custom URL for the metadata queries. This needs to be handled by the application for non-WMS services.

### Interactivity

WMS services sometimes provide a mechanism to query a specific pixel. This is supported through the `getFeatureInfoText()` method on the `WMSLayer`

## Methods

##### `getFeatureInfoText()` {#getfeatureinfotext}

This is a method on the layer that can be called to retrieve additional information from the image service about the map near the specified pixel.

Arguments:

- `x` (number) - The x component of the pixel in the image
- `y` (number) - The y component of the pixel in the image

Returns

- `Promise<string>` - Resolves to a string containing additional information about the map around the provided pixel


## Properties

Inherits all properties from [base `Layer`](../core/layer.md).

### Data Options

##### `data` (string) {#data}

A base URL to a well-known service type, or a full URL template from which the map images should be loaded.

If `props.serviceType` is set to `'template'`, data is expected to be a URL template. The template may contain the following substrings, which will be replaced with a viewport's actual bounds and size at request time:

- `{east}`
- `{north}`
- `{west}`
- `{south}`
- `{width}`
- `{height}`
- `{layers}` - replaced with a string built from the content of `props.layers`. The array of layer name strings in `props.layers` will be joined by commas (`,`) into a single string.


##### `serviceType` (string, optional) {#servicetype}

- Default: `'auto'`

Specifies the type of service at the URL supplied in `props.data`. Currently accepts either `'wms'` or `'template'`. The default `'auto'` setting will try to autodetect service from the URL.

##### `layers` (string\[\], optional) {#layers}

- Default: `[]`

Specifies names of layers that should be visualized from the image service. 

> Note that WMS services will typically not display anything unless at least one valid layer name is provided.

##### `srs` (string, optional) {#srs}

- Default: `'auto'`

Spatial Reference System for map output, used to query image from the server. Can be one of `EPSG:4326'`, `'EPSG:3857'` or `'auto'`. 

If `'auto'`, the layer will request `EPSG:3857` in `MapView`, and `EPSG:4326` otherwise. Note that a particular SRS may not be supported by your image server.


### Callbacks

##### `onMetadataLoad` (Function, optional) {#onmetadataload}

`onMetadataLoad` called when the metadata of the image source successfully loads.

- Default: `metadata => {}`

Receives arguments:

- `metadata` (object) - The metadata for the image services has been loaded. 

Note that metadata will not be loaded when `props.serviceType` is set to `'template`.

##### `onMetadataLoadError` (Function, optional) {#onmetadataloaderror}

`onMetadataLoadError` called when metadata failed to load.

- Default: `console.error`

Receives arguments:

- `error` (`Error`)

##### `onImageLoadStart` (Function, optional) {#onimageloadstart}

`onImageLoadStart` is a function that is called when the `WMSLayer` starts loading metadata after a new image source has been specified.

- Default: `data => null`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests

##### `onImageLoad` (Function, optional) {#onimageload}

`onImageLoad` called when an image successfully loads.

- Default: `() => {}`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests

##### `onImageLoadError` (Function, optional) {#onimageloaderror}

`onImageLoadError` called when an image failed to load.

- Default: `console.error`

Receives arguments:

- `requestId` (`number`) - Allows tracking of specific requests
- `error` (`Error`)

## Limitations

- Each instance of the `WMSLayer` only supports being rendered in one view. See [rendering layers in multiple views](../../developer-guide/views.md#rendering-layers-in-multiple-views) for a workaround.
- This layer currently does not work well with perspective views (i.e. `pitch>0`).
- This layer does not work with non-geospatial views such as the [OrthographicView](../core/orthographic-view.md) or the [OrbitView](../core/orbit-view.md).

## Source

[modules/geo-layers/src/wms-layer](https://github.com/visgl/deck.gl/tree/master/modules/geo-layers/src/wms-layer)
