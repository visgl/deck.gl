# Layer Catalog Overview

The deck.gl layer catalog is organized into a couple of sections.

## Base Layer

All deck.gl layers inherit from the `Layer` base class and
all its props are available to all layers unless otherwise documented.

## Core Layers

Core layers are the most stable and supported deck.gl layers. They are
intended to represent a small set of widely applicable data visualization
building blocks.

## 64-bit Layers

Core Layers have 64 bit counterparts that can be used to achieve
higher precision, particularly under high zoom levels.

## Sample Layers

Deck.gl provides a number of sample layers intended to illustrate
various ideas and approaches to how layers can be designed.

**Warning**:
The sample layers are not as actively supported as core layers,
and could even have breaking changes between minor releases of deck.gl.

If a production application wants to use one of these layers, we recommend
copying these layers rather than importing them into to your application to
avoid being affected by changes when updating to new versions of deck.gl.
