# Layer Catalog Overview

The deck.gl layer catalog is organized into a couple of sections.

## Base Layer

All deck.gl layers inherit from the `Layer` base class and
its props are available to all layers unless otherwise documented.

## Core Layers

The Core Layers are a group of geospatial visualization focused layers,
intended to represent a small set of widely applicable data visualization
building blocks.

The core layers are the most stable and supported deck.gl layers.

### Extrusions and 2.5D support.

Some of the Core layers support extrusions and heights. The layers
that support extrusions are marked with an "Extrusion" tag.

## 64-bit Layers

Core Layers have 64 bit counterparts that can be used to achieve
higher precision, particularly under high zoom levels (> 1.000.000x)
at the cost of sacrificing some performance and memory.

Layers that have a 64 bit counterpart are marked with a 64-bit tag.

## Sample Layers

Deck.gl provides a number of sample layers in the examples folders
intended to illustrate various ideas and approaches to how layers
can be designed. These layers sometimes have documentation in the example
code, but they are not listed here in the official documentation.

To use one of the sample layers an application simply needs to copy it into
its own source tree, as these layers are not `export`ed by deck.gl.
