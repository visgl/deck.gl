# Loading Data

deck.gl uses [loaders.gl](https://loaders.gl), a framework-agnostic library to read data and resources.

deck.gl core always includes loaders for JSON and standard image formats (e.g, png, jpeg, svg). Certain layers include additional loaders supporting their own use cases. It is easy for applications to provide options to configure the behavior of the default loaders or to add loaders to support for additional formats.

Some examples of when loaders are used:

- JSON array or object from an URL passed to the `data` prop of a layer
- Texture from an image, such as `image` in `BitmapLayer`, `iconAtlas` in `IconLayer`, and `texture` in `SimpleMeshLayer`
- Geometries from a binary tile, e.g. `MVTLayer`, `TerrainLayer`, and `Tile3DLayer`
- Geometries from a standard 3D format, e.g. `scenegraph` in `ScenegraphLayer`, and `mesh` in `SimpleMeshLayer`


## Customize Data Loading Behavior

All layers support a [loadOptions](/docs/api-reference/core/layer.md#loadoptions) prop that can be used to customize loading and parsing.

### Example: Fetch data with credentials

In a production environment, deck.gl applications may need to load data from secure APIs that require special HTTP headers (such as `Authorization`) to be set.

In order to access a secure API, the `loadOptions.fetch` option passes through additional parameters to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), which deck.gl calls under the hood to load resources.

```js
new ScatterplotLayer({
  data: 'https://secure-server.com/userActivity',
  loadOptions: {
    fetch: {
      method: 'POST',
      body: JSON.stringify(requestBody),
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    }
  }
  ...
});
```

### Example: Override the default image loading options

deck.gl uses [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) to read common image formats. The default loader options are:

```js
{
  image: {type: 'auto'},
  imagebitmap: {premultiplyAlpha: 'none'}
}
```

The image is decoded into an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap) if the browser supports it (Firefox, Chrome, Edge) for better performance. You can override the default [options](https://loaders.gl/modules/images/docs/api-reference/image-loader#magebitmap-options) for the `createImageBitmap` API as follows:

```js
new IconLayer({
  iconAtlas: '/path/to/image.png',
  loadOptions: {
    imagebitmap: {
      // Flip the image vertically
      imageOrientation: 'flipY'
    }
  }
})
```

If the image is a SVG that does not include width and height information, `createImageBitmap` will throw a `DOMException`: `The image element contains an SVG image without intrinsic dimensions, and no resize options or crop region are specified`. This can be fixed by explicitly setting its dimensions:


```js
new IconLayer({
  ...
  iconAtlas: '/path/to/image.svg',
  loadOptions: {
    imagebitmap: {
      resizeWidth: 256,
      resizeHeight: 256,
      resizeQuality: 'high'
    }
  }
})
```

## Support Additional Formats

All layers support a [loaders](/docs/api-reference/core/layer.md#loaders) prop that can be used to add [loaders.gl loaders](https://loaders.gl/docs/developer-guide/using-loaders) for parsing a specific input format.

For example, the following code adds the [CSVLoader](https://loaders.gl/modules/csv/docs/api-reference/csv-loader) to support CSV/TSV files:

```js
import {CSVLoader} from '@loaders.gl/csv';

new HexagonLayer({
  data: 'path/to/data.tsv',
  loaders: [CSVLoader],
  loadOptions: {
    csv: {
      delimiter: '\t',
      dynamicTyping: true,
      skipEmptyLines: true
    }
  }
});
```

The following code adds the [LASLoader](https://loaders.gl/modules/las/docs/api-reference/las-loader) to support LAS/LAZ files:

```js
import {LASLoader} from '@loaders.gl/las';

new PointCloudLayer({
  mesh: 'path/to/pointcloud.laz',
  loaders: [LASLoader]
});
```

## Force Reload From an URL

Usually, a layer refreshes its data when and only when the `data` prop changes.
The following code refreshes data from the same URL every 5 minutes by changing a query parameter:

```js
const deck = new Deck({...});

let dataVersion = 0;
function update() {
  const layer = new ScatterplotLayer({
    data: `path/to/data.json?v=${dataVersion}`
  });

  deck.setProps({layers: [layer]});
};

setInterval(() => {
  dataVersion++;
  update();
}, 5 * 60 * 1000);
```

## Load Resource Without an URL

In some use cases, resources do not exist at a static URL. For example, some applications construct images dynamically based on user input. Some applications receive arbitrary binary blobs from a server via a WebSocket connection.

Before reading on, remember that you don't have to use a loader if your app already knows how to interpret the content. For example, if you have the RGBA values of all pixels of an image. you can simply construct an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object:

```js
new BitmapLayer({
  image: new ImageData(pixels, 128, 128)
})
```

If you have a custom-formatted binary, consider the techniques in [using binary data](/docs/developer-guide/performance.md#use-binary-data).

The following examples only address the use cases where you need a loader/parser to interpret the incoming data.

### Example: Use image from a programmatically generated SVG string

The following code dynamically generates SVG icons and convert them to [data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

```js
function createSVGIcon(number) {
  const label = number < 10 ? number.toString : '10+';
  return `\
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#c00" stroke="#fa1" stroke-width="2"/>
    <text x="12" y="12" fill="#fff" text-anchor="middle" alignment-baseline="middle" font-size="8">${label}</text>
  </svg>`;
}

// Note that a xml string cannot be directly embedded in a data URL
// it has to be either escaped or converted to base64.
function svgToDataURL(svg) {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  // or
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

new IconLayer({
  getIcon: d => {
    icon: svgToDataURL(createSVGIcon(d.value)),
    width: 24,
    height: 24
  }
})
```

### Example: Parse glTF from a binary blob

The following code shows how to parse a glTF model that is already loaded into an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) object.

There are two ways for deck.gl to load it. One is to create a blob URL:

```js
const blob = new Blob([arraybuffer]);
const objectURL = URL.createObjectURL(blob);

new ScenegraphLayer({
  scenegraph: objectURL
});
```

Or more directly, import the [parse](https://loaders.gl/modules/core/docs/api-reference/parse) utility from loaders.gl (already a dependency of deck.gl), which returns a promise:

```js
import {parse} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';

new ScenegraphLayer({
  scenegraph: parse(arraybuffer, GLTFLoader)
})
```
