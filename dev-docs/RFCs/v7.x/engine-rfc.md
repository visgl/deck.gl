# RFC: Deck 3D Engine

* Authors: Tarek Sherif
* Date: April 16, 2019
* Status: **Draft**


## Overview

This RFC is written as an article for the deck.gl Developer's Guide, rather than in the standard format. The intention is to copy this text to the developer's guide once it matures.

> This documents references some in-progress or hypothetical functionality, not everything is implemented yet. The intent is to show a "complete story" that will help us understand how each piece fits in to the big picture.


## Main Text

There is currently no proper 3D engine in the deck.gl stack. Luma.gl's stated goal is to remain a relatively thin layer over WebGL, while Deck generally works at a higher level, manipulating geospatial data. Missing in between, is a component to manage 3D assets and GL objects collectively to ensure maximal re-use and optimization while exposing an API to the rest of deck.gl that makes it straightforward to visualize geospatial data without worrying about implementation details. That lack of this engine layer has lead to several problems:
  1. A tight coupling between deck.gl and luma.gl that makes it hard to update luma.gl and have a clear idea of what parts of deck.gl might be affected. Of particular concern is the fact that users of deck.gl can manipulate luma.gl objects directly in custom layers, meaning that clear knowledge of how luma.gl is being used is impossible.
  2. Both libraries have had to partially implement 3D engine functionality in an uncoordinated way, without a clear picture of what functionality is the responsibility of which library. Some examples of this include scenegraph functionality in luma.gl and attribute management in deck.gl.
  3. Without a single system managing resources, it's impossible to properly reuse assets or batch operations (e.g. reuse buffers for the same data, reuse programs, compile programs in parallel).

The key components discussed in this article will be:

* **Batch-focused Renderable** - A new renderable model that would focus on simplifying the description of how a layer's 3D data should be drawn.
* **Program and Shader Management** - A centralized factory would be used to create shaders and programs, re-using them where possible. Would allow an API for parallel compilation.
* **Buffer and Texture Management** - Buffers and textures would be created with an identifier indicating what data they contain. This would allow for re-use rather than re-creation for each layer in which they're used.

## Batch-Focused Renderable

## Program and Shader Management

## Buffer and Texture Management

## Possible Future Work
