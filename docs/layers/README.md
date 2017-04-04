# Layer Catalog Overview

The deck.gl layer catalog is organized into a couple of sections.

## Base Layer

All deck.gl layers inherit from the
[`Layer`](/docs/api-reference/base-layer.md) base class
and its props are available to all layers unless otherwise documented.

## Core Layers

The [Core Layers](/docs/layers/scatterplot-layer.md)
are a group of geospatial visualization focused layers,
intended to represent a small set of widely applicable data visualization
building blocks.

The core layers are the most stable and supported deck.gl layers.

Some notable features of the core deck.gl layers

* **64-bit Mode**
Most core Layers support a 64 bit mode that can be used
to achieve higher precision, particularly under high zoom levels (> 1.000.000x)
at the cost of sacrificing some performance and memory.
Layers that have a 64 bit counterpart are marked with a "64-bit" tag.
* **Extrusions**
Some of the Core layers support extrusions and heights (aka "elevations")
enabling applications to show a "2.5D" view of their data when using the map
in perspective mode.
The layers that support extrusions are marked with an "Extrusion" tag.

## Deprecated Layers

These are layers from an older releases that now have better counterparts.
They should not be used in new applications as they may be removed in future
deck.gl releases.

## Sample Layers

Deck.gl provides a number of sample layers in the
[examples folders](https://github.com/uber/deck.gl/tree/4.0-release/examples/sample-layers)
intended to illustrate various ideas and approaches to how layers
can be designed. These layers sometimes have documentation in the example
code, but they are not listed here in the official documentation.

To use one of the sample layers an application simply needs to copy it into
its own source tree. This is necessary because these layers are not
included in the deck.gl distribution (i.e. they are not `export`ed by deck.gl).
