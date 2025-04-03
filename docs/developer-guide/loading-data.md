# Loading Data

deck.gl uses [loaders.gl](https://loaders.gl), a framework-agnostic library to read data and resources.

deck.gl core always includes loaders for JSON and standard image formats (e.g, png, jpeg, svg). Certain layers include additional loaders supporting their own use cases. It is easy for applications to provide options to configure the behavior of the default loaders or to add loaders to support for additional formats.

Some examples of when loaders are used:

- JSON array or object from an URL passed to the `data` prop of a layer
- Texture from an image, such as `image` in `BitmapLayer`, `iconAtlas` in `IconLayer`, and `texture` in `SimpleMeshLayer`
- Geometries from a binary tile, e.g. `MVTLayer`, `TerrainLayer`, and `Tile3DLayer`
- Geometries from a standard 3D format, e.g. `scenegraph` in `ScenegraphLayer`, and `mesh` in `SimpleMeshLayer`


## Customize Data Loading Behavior

All layers support a [loadOptions](../api-reference/core/layer.md#loadoptions) prop that can be used to customize loading and parsing.

### Example: Fetch data with credentials

In a production environment, deck.gl applications may need to load data from secure APIs that require special HTTP headers (such as `Authorization`) to be set.

In order to access a secure API, the `loadOptions.fetch` option passes through additional parameters to [fetch](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch), which deck.gl calls under the hood to load resources.

```ts
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
});
```

### Example: Override the default image loading options

deck.gl uses [ImageLoader](https://loaders.gl/modules/images/docs/api-reference/image-loader) to read common image formats. The default loader options are:

```ts
{
  image: {type: 'auto'},
  imagebitmap: {premultiplyAlpha: 'none'}
}
```

The image is decoded into an [ImageBitmap](https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/createImageBitmap) if the browser supports it (Firefox, Chrome, Edge) for better performance. You can override the default [options](https://loaders.gl/modules/images/docs/api-reference/image-loader#magebitmap-options) for the `createImageBitmap` API as follows:

```ts
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

If the image is a SVG that does not include width and height information, `createImageBitmap` will throw a `DOMException`:

```
The image element contains an SVG image without intrinsic dimensions, and no resize options or crop region are specified.
```

This can be fixed by explicitly setting its dimensions:


```ts
new IconLayer({
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

All layers support a [loaders](../api-reference/core/layer.md#loaders) prop that can be used to add [loaders.gl loaders](https://loaders.gl/docs/developer-guide/using-loaders) for parsing a specific input format.

For example, the following code adds the [CSVLoader](https://loaders.gl/modules/csv/docs/api-reference/csv-loader) to support CSV/TSV files:

```ts
import {CSVLoader} from '@loaders.gl/csv';

new HexagonLayer({
  data: '/path/to/data.tsv',
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

```ts
import {LASLoader} from '@loaders.gl/las';

new PointCloudLayer({
  mesh: '/path/to/pointcloud.laz',
  loaders: [LASLoader]
});
```

## Force Reload From an URL

Usually, a layer refreshes its data when and only when the `data` prop changes.
The following code refreshes data from the same URL every 5 minutes by changing a query parameter:


import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

<Tabs groupId="language">
  <TabItem value="js" label="JavaScript">

```js
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 27.8,
    zoom: 8
  },
  controller: true
});

let dataVersion = 0;
function update() {
  const layers = [
    new ScatterplotLayer({
      data: `path/to/data.json?v=${++dataVersion}`,
      getPosition: d => d.position
    })
  ];

  deckInstance.setProps({layers});

  // Refresh after 5 minutes
  return setTimeout(update, 5 * 60 * 1000);
};

update();
```

  </TabItem>
  <TabItem value="ts" label="TypeScript">

```ts
import {Deck} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const deckInstance = new Deck({
  initialViewState: {
    longitude: -122.4,
    latitude: 27.8,
    zoom: 8
  },
  controller: true
});

type DataType = {
  position: [longitude: number, latitude: number];
};

let dataVersion: number = 0;
function update() {
  const layers = [
    new ScatterplotLayer<DataType>({
      data: `path/to/data.json?v=${++dataVersion}`,
      getPosition: (d: DataType) => d.position
    })
  ];

  deckInstance.setProps({layers});

  // Refresh after 5 minutes
  return setTimeout(update, 5 * 60 * 1000);
};

update();
```

  </TabItem>
  <TabItem value="react" label="React">

```tsx
import React, {useState, useEffect} from 'react';
import {DeckGL} from '@deck.gl/react';
import {MapViewState} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -122.4,
  latitude: 27.8,
  zoom: 8
};

type DataType = {
  position: [longitude: number, latitude: number];
};

function App() {
  const [dataVersion, setDataVersion] = useState<number>(0);

  useEffect(() => {
    const nextUpdate = setTimeout(() => setDataVersion(dataVersion + 1), 5 * 60 * 1000);
    return () => clearTimeout(nextUpdate);
  }, [dataVersion]);

  const layers = [
    new ScatterplotLayer<DataType>({
      data: `/path/to/data.json?v=${++dataVersion}`,
      getPosition: (d: DataType) => d.position
    })
  ];

  return <DeckGL
    initialViewState={INITIAL_VIEW_STATE}
    controller
    layers={layers}
  />;
}
```

  </TabItem>
</Tabs>



## Loaders and Web Workers

For the best performance, some specialized loaders parse data using web workers, for example `TerrainLoader` in the [TerrainLayer](../api-reference/geo-layers/terrain-layer.md) and `MVTLoader` in the [MVTLayer](../api-reference/geo-layers/mvt-layer.md). By default, the worker code is loaded from from the latest published NPM module on [unpkg.com](https://unpkg.com).

It might be desirable for some applications to serve the worker code itself without relying on the CDN. To do this, locate the worker bundle locally in `node_modules/@loaders.gl/<module>/dist/<name>-worker.js` and serve it as a static asset with your server. Point the loader to use this alternative URL using `loadOptions.<name>.workerUrl`:

```ts
new MVTLayer({
  loadOptions: {
    mvt: {
      // cp node_modules/@loaders.gl/mvt/dist/mvt-worker.js static/mvt-worker.js
      workerUrl: '/static/mvt-worker.js'
    }
  }
}
```

If the layer is used in an environment that does not support web workers, or you need to debug the loader code on the main thread, you may import the full loader like this:

```ts
import {MVTLoader} from '@loaders.gl/mvt';
new MVTLayer({
  loaders: [MVTLoader],
  loadOptions: {worker: false}
});
```

Refer to each specific layer's documentation to see which loaders are used.


## Load Resource Without an URL

In some use cases, resources do not exist at a static URL. For example, some applications construct images dynamically based on user input. Some applications receive arbitrary binary blobs from a server via a WebSocket connection.

Before reading on, remember that you don't have to use a loader if your app already knows how to interpret the content. For example, if you have the RGBA values of all pixels of an image. you can simply construct an [ImageData](https://developer.mozilla.org/en-US/docs/Web/API/ImageData) object:

```ts
new BitmapLayer({
  image: new ImageData(pixels, 128, 128)
})
```

If you have a custom-formatted binary, consider the techniques in [using binary data](./performance.md#use-binary-data).

The following examples only address the use cases where you need a loader/parser to interpret the incoming data.

### Example: Use image from a programmatically generated SVG string

The following code dynamically generates SVG icons and convert them to [data URLs](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/Data_URIs).

```ts
function createSVGIcon(n: number): string {
  const label = n < 10 ? n.toString() : '10+';
  return `\
  <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" fill="#c00" stroke="#fa1" stroke-width="2"/>
    <text x="12" y="12" fill="#fff" text-anchor="middle" alignment-baseline="middle" font-size="8">${label}</text>
  </svg>`;
}

// Note that a xml string cannot be directly embedded in a data URL
// it has to be either escaped or converted to base64.
function svgToDataUrl(svg: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

// You may need base64 encoding if the SVG contains certain special characters
function svgToDataUrlBase64(svg: string): string {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

const layer = new IconLayer({
  getIcon: d => {
    url: svgToDataUrl(createSVGIcon(d.value)),
    width: 24,
    height: 24
  }
})
```

### Example: Parse glTF from a binary blob

The following code shows how to parse a glTF model that is already loaded into an [ArrayBuffer](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer) object.

There are two ways for deck.gl to load it. One is to create a blob URL:

```ts
const blob = new Blob([arraybuffer]);
const objectURL = URL.createObjectURL(blob);

const layer = new ScenegraphLayer({
  scenegraph: objectURL
});
```

Or more directly, import the [parse](https://loaders.gl/modules/core/docs/api-reference/parse) utility from loaders.gl (already a dependency of deck.gl), which returns a promise:

```ts
import {parse} from '@loaders.gl/core';
import {GLTFLoader} from '@loaders.gl/gltf';

const layer = new ScenegraphLayer({
  scenegraph: parse(arraybuffer, GLTFLoader)
})
```
