# Layer Catalog Overview

The deck.gl layer catalog is organized into a couple of sections.

## Base Layer

All deck.gl layers inherit from the [`Layer`](/docs/api-reference/layer.md) base class and its props are available to all layers unless otherwise documented.

## Core Layers

The [Core Layers](/docs/layers/scatterplot-layer.md) are a group of geospatial visualization focused layers, intended to represent a small set of widely applicable data visualization building blocks.

The core layers are the most stable and supported deck.gl layers.

Some notable features of the core deck.gl layers

* **64-bit Mode** Most core Layers support a 64 bit mode that can be used to achieve higher precision, particularly under high zoom levels (> 1.000.000x) at the cost of sacrificing some performance and memory. Layers that have a 64 bit counterpart are marked with a "64-bit" tag.
* **Extrusions** Some of the Core layers support extrusions and heights (aka "elevations") enabling applications to show a "2.5D" view of their data when using the map in perspective mode. The layers that support extrusions are marked with an "Extrusion" tag.

## Deprecated Layers

These are layers from an older releases that now have better counterparts. They should not be used in new applications as they may be removed in future deck.gl releases.

## Experimental Layers

deck.gl provides a number of experimental layers in the [@deck.gl/experimental-layers](https://github.com/uber/deck.gl/tree/master/modules/experimental-layers) module. These layers are being actively developed and subject to major changes. Their documentations can be found along with the source code, but not hosted on the official documentation website.

The experimental layers may graduate to core layers in a later release.

To use one of the experimental layers, install the module:

```bash
npm install @deck.gl/experimental-layers
```

Then import in code:

```js
import {SimpleMeshLayer} from '@deck.gl/experimental-layers'
```

