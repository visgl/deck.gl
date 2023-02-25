# RFC: WMSLayer

- **Authors**: Ib Green
- **Date**: Jan 12, 2023
- **Status**: Implemented (in deck.gl 8.9 as experimental export)

Summary: This RFC Proposes a new generic deck.gl layer that reloads a single image covering the full screen, with the goal of having full built-in support for standard WMS services and their functional equivalents (e.g. ArcGIS ImageServer etc.)

## Overview

Some services can generate on-demand images that covers an arbitrary specified viewport (rather than set of tiles). WMS services are one of the most common examples of this type of data source and the lack of WMS support in deck.gl is a notable omission.

### Prior Art

OpenLayers offers an [`ImageLayer` and a sample app](https://openlayers.org/en/latest/examples/wms-image.html)
that handles the single-image WMS visualization scenario.

### WMSLayer High-Level Requirements

In some sense the `WMSLayer` is the simplest possible dynamically loading layer. Just like the `TileLayer` and `Tile3DLayer` it loads new data when the viewport changes.

## WMS Services

A common use case are WMS services, where the service provides a `GetMap` request that returns an image covering a specified viewport, along with some additional request types, to get service metadata, information about specific pixel neighborhoods, legends etc.

An overview of the WMS Service protocol can be found in the [`@loaders.gl/wms` module documentation](https://github.com/visgl/loaders.gl/blob/4.0-dev/modules/wms/docs/formats/wms.md).

## Loading a full screen image

GetMap loads a full image. This is a flat image on the ground.

## Issues with Tiling

Why not just use the `TileLayer` and have it request multiple small images from the service?

A WMS-style image service can indeed be used with the `TileLayer` (it can be done today with custom URLs that call `GetMap` with bounds generated from tile dimensions)

However, for some image services, the results of tiling are sometimes not ideal:

- The performance of running multiple (parallel) queries may not be good. Imagine a backend database that renders a query of a massive dataset server side. A tile layer could generated dozens of queries, causing heavy loads on the backend.
- If the service is not aware that the image is being tiled, it may do different layout decisions. Duplicated labels is perhaps the major side-effect, as the image service makes efforts to include the same label in each image (tile).

To provide the option of non-tiled rendering, a new layer, tentatively called the `WMSLayer` is proposed.

## Debounce

Fetching full screen images is expensive (server rendering and network transport), so fetches should be debounced (in particular to avoid fetches happening during pans and zoom).

The right timeout is not clear. Perhaps make it configurable?

### Multiview & Caching

The WMSLayer should support multiple view. A question is whether there should be some reuse between views. The simplest solution is of course that each view issues and independent fetch.

At minimum, the current images for all views must be cached, so that views can be quickly redrawn without requesting new images when a view is rerendered. It is not clear if more sophisticated caching is useful.

### Query and vendor parameter pass-through

WMS services can typically render a number of layers (roads, map features etc), and this is specified through the `&LAYER=...,...` URL parameter.

There must be a way to provide parameters to the underlying (WMS) URL that can be freely mixed with WMS request parameters generated automatically by the `WMSLayer`s Viewport monitoring.

## Naming

| Name               | Status           | Comment                                                                                                                                              |
| ------------------ | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WMSLayer`     | currently chosen |     While the layer supports non-WMS image services, highlighting WMS support was preferred by the API Auditors.        |
| `ImageryLayer`         | rejected         | Does not capture the dynamic loading aspect of the layer. There are other image related use cases that could also lay claim to this name.              |
| `ViewportLayer`    | A superclass?    | Superclass handling multi view load and caching (Tileset2D-style helper class). WMSLayer would be a trivial sublass that renders `BitmapLayer`s? |
| `SingleImageLayer` | Rejected         |                                                                                                                                                      |
| `SingleTileLayer`  | Rejected         |                                                                                                                                                      |
| `GeoImageLayer`    | Rejected         |                                                                                                                                                      |
| `WMSImageryLayer`  | Rejected         | Starts taking us a down a road of a "forest" of subclasses, which ends up being hard to maintain and refactor.                                       |
| `WMSTileLayer`     | Rejected         | Ditto                                                                                                                                                |

## WMS Integration

WMS is one of the oldest and most established OGC standards, and it stands to reason that a geospatial framework like deck.gl should have strong support for it.

While WMS data sources can already be integrated into the tile layer today by customizing a long `GetMap` URL, this requires acquiring a bit more knowledge about the WMS service and protocol than most users would prefer. Also this URL template approach does not provide support for any of the remaining features of the WMS protocol (metadata/capabilities query, interactive queries, legends, ...)

Support for the full WMS protocol has been added in loaders.gl 3.3.0 in a new module `@loaders.gl/wms`.

### DataSource ideas

The loaders.gl support generalizes ImageSources such as WMS into an interface. Under the hood, the `WMSLayer` will build such an image source. 

```typescript
interface ImageSource {
  getCapabilities(): Promise<ImageDataSourceCapabilities>;
  getImage({boundingBox, width, height, layers, parameters}): Promise<Image>;
  getLegendImage({layers, parameters}): Promise<Image>;
  getFeatureInfo({layers, parameters}): Promise<ImageFeatureInfo>;
  getLayerInfo({layers, parameters}): Promise<ImageDataSourceLayerInfo>
}

import {load, LoaderOptions} from '@loaders.gl/core';
import {WMSCapabilitiesLoader, WMSFeatureInfoLoader} from '@loaders.gl/wms';
import {ImageLoader} from '@loaders.gl/images';

class WMSDataSource implements ImageDataSource {
  url: string;
  loadOptions: LoaderOptions = {};

  constructor({url, loadOptions: LoaderOptions}) {
    this.url = url;
    this.loadOptions = loadOptions;
  }

  getCapabilities(): Promise<ImageDataSourceCapabilities> {
    const url = this._getUrl({request: 'GetCapabilities', layers, parameters});
    return load(url, WMSCapabilitiesLoader, this.loadOptions);
  }

  getImage({boundingBox, width, height, layers: string[], parameters: Record<string, unknown>}): Promise<Image> {
    const url = this._getUrl({request: 'GetMap', layers, parameters});
    return load(url, ImageLoader, this.loadOptions);
  }

  getLegendImage(options: {layers: string[], parameters: Record<string, unknown>}): Promise<Image> {
    const url = this._getUrl({request: 'GetLegendImage', layers, parameters});
    return load(url + '?REQUEST=GetCapabilities', WMSCapabilitiesLoader, this.loadOptions);
  }

  getFeatureInfo({layers: string[], parameters: Record<string, unknown>}): Promise<ImageFeatureInfo> {
    const url = this._getUrl({request: 'GetFeatureInfo', layers, parameters});
    return load(url + '?REQUEST=GetCapabilities', ImageLoader, this.loadOptions);
  }

  getLayerInfo({layers: string[], parameters: Record<string, unknown>}): Promise<ImageDataSourceLayerInfo> {
    const url = this._getUrl({request: 'GetLayerInfo', layers, parameters})
    return load(url + '?REQUEST=GetLayerInfo', WMSLayerInfoLoader, this.loadOptions);
  }

  /**
   * @note protected, since perhaps getUrl may need to be overridden to handle certain backends?
   * @note if override is common, maybe add a callback prop?
   * */
  protected getUrl(options: {request: string; layers: string[], parameters: Record<string, unknown>}): string {
    let url = `${this.url}?REQUEST=${options.request}`;
    if (options.layers.length) {
      url += `&LAYERS=[${options.layers.join(',')}]`;
    }
  }
}
```

This might trigger a process to define similar data sources for other services.

```typescript
interface VectorTileDataSource {
  getCapabilities(): Promise<IVectorTileDataSourceCapabilities>;
  getTile({boundingBox, width, height, layers, parameters}): Promise<VectorTile>;
}
```

Such a set of data sources would ideally be completely independent of deck.gl,
and probably best placed in loaders.gl.

## Appendix: Potential Future Improvements

The loaders.gl support generalizes ImageSources such as WMS into an interface. Under the hood, the `WMSLayer` will build such an image source. As loaders.gl 3.4 matures this functionality, we can expose ImageSource interface in the `WMSLayer`

### Mosaicing and Client-Side Tiling ideas

It is inevitable that zooming and panning will temporarily show empty areas and a pixelated image.

- So it is tempting to reuse existing images from a cache if they partially cover the empty/pixelated areas.
- However, "mosaicing" a collection of "random-size" images from a cache does not sound practical.

A possible solution would be client-side tiling: request a full screen image but then cut it into tiles on the client. This way we can leverage the tile layers existing "mosaicing" logic.

We could request a slightly bigger image than is needed to cover the screen to make sure we can cut it into an even number of tiles.


## Appendix: WMS Protocol

| **WMS Request**    | **Response Loader**         | **Description**                                                                                                                                                                                                                    |
| ------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GetCapabilities`  | `WMSCapabilitiesLoader`     | Returns parameters about the WMS (such as map image format and WMS version compatibility) and the available layers (map bounding box, coordinate reference systems, URI of the data and whether the layer is mostly opaque or not) |
| `GetMap`           | `ImageLoader`               | returns a map image. Parameters include: width and height of the map, coordinate reference system, rendering style, image format                                                                                                   |
| `GetFeatureInfo`   | `WMSFeatureInfoLoader`      | if a layer is marked as 'queryable' then you can request data about a coordinate of the map image.                                                                                                                                 |
| `DescribeLayer`    | `WMSLayerDescriptionLoader` | gets feature types of the specified layer or layers, which can be further described using WFS or WCS requests. This request is dependent on the Styled Layer Descriptor (SLD) Profile of WMS.                                      |
| `GetLegendGraphic` | `ImageLoader`               | An image of the map's legend, giving a visual guide to map elements.                                                                                                                                                               |

Note that only the `GetCapabilities` and `GetMap` request types are are required to be supported by a WMS server. The response to `GetCapabilities` contains information about which request types are supported
