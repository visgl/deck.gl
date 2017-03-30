---
title: Introducing Deck.gl v4.0
description: Creating a wind map with deck.gl
author: shaojing, ib
tags:
  - Vis
  - WebGL
---

## Introducing deck.gl v4.0

We've just released a new major version of deck.gl. It is a good time to share some information about the improvements that went into the new version, the rationale behind them, and provide some hints on what we are currently thinking about the future of deck.gl.

### What motivated the release?

Since the v3 release in last November, deck.gl saw rapid adoption across a number of internal data visualization applications at Uber and we also received substantial amount of comments, suggestions and help requests from external users and developers. We noticed that developers are not only building apps using deck.gl's highly performant layers, but also starting to unleash their own creativity by creating various new layers. This is pushing deck.gl into areas that we have never thought it would be.

While some of these layers are highly specialized and application specific, many others are general-purpose and solves some common problems in certain applications. Those general-purpose layers saves other developers with similar needs considerable amount of time, so why reinvent the wheel?

Therefore, in this v4 release, the stars are the new layers enlisted in our deck.gl layer catalog that do magic with data. Now, the numder of core layers in deck.gl has grown to over a dozen and all of them are carefully audited, tested and documented layers.

### Why a major version bump?

In spite of the major version bump, deck.gl v4 is highly compatible with the v3 in terms of public APIs and the way layers work. We did take an extensive APIs audit of the new layers and decided that it's the right time to make all layer APIs consistent so that the whole framework is much user friendly. This resulted in a short list of deprecations and changes to the existing layers, and thus led to a bump in the major version.

To ensure a smooth transition, an upgrade guide is provided and we expect the upgrade effort for applications to be minimal.

## A Growing Layer Catalog

### New Layers

Deck.gl is a geospatial data visualization framework from the very beginning and geospatial use cases will always be the top priority. The new layers added to the layer catalog are widely used in geospatial data analysis within Uber and we hope they will solve the problems of deck.gl users face everyday.

#### GeoJsonLayer

[pic here]

The GeoJsonLayer is designed to render geometry primitives in the widely accepted GeoJson data format. The GeoJsonLayer itself is very powerful as it renders multiple types of geometry primitives, including points, lines, multilines, polygons and multipolygons all at once. Moreover, it can render polygons and multipolygons in different styles, currently supporting filled and outline styles in 2D, and filled and wireframe styles in extruded.

The flexibility of the GeoJson layer combined with deck.gl's high rendering performance makes it possible to render large amount of data on the city or even the world level, like what we are doing in the GeoJson layer example on our demo site. [links here]

#### PathLayer

[pic here]

The `PathLayer` is created to render a path consists of multiple line segments specified by a sequence of coordinates. The path drawn has customizable width with mitered or rounded line joints.

### PolygonLayer

[pic here]

The `PolygonLayer` renders general flat or extruded polygons specified by a "closed" sequence of coordinates, like how polygon features are specified in the GeoJson specifications. Polygons can be rendered as filled or outline in 2D and filled or wireframe in 3D. This layer supports rendering convex, concave and polygon with holes.

### IconLayer

[pic here]

The `IconLayer` allows the user to render customizable markers on top of the base map. Multiple icons can be used in a single layer through a texture atlas and a configuration object in JSON. The size of the icons can be separately controlled and bounded with user specified values.

### PointCloudLayer

[pic here]

The `PointCloudLayer` is designed to visualize 3D point cloud data, usually generated from different types of sensors that are ubiquitous nowadays. Point cloud data can contain position, normal and color values to control the style of rendered points, whic are "billboarded" towards the user.

### GridLayer and HexagonLayer

[pic here]

In this deck.gl release, we add these two special layers that goes beyond simply putting user data on the map. This is a very exiciting new direction of deck.gl as we not only want to provide layers that are visually compelling to our users, but also ***smart***. The `GridLayer` and `HexagonLayer` draw equal-area rectangular or hexagonal cells, and at the same time automatically "bin" user-provided point data and do aggregations on the data points that fall into each rectangular or hexagonal cells. The aggregated data can be mapped to the color of the cells, the height of the cells or both, depending on the specific style settings. This effectively makes these two layers two different implementations of typical grid-based **heatmaps**. Both layer supports 2D and 3D cells.

The `GridLayer` and `HexagonLayer` are different from the `ScreenGridLayer` provided in the previous version as both the rendered geometry and the aggregation boundaries are in the ***world coordinates***.

## Layer extrusion and lighting

Some of deck.gl layers now support extrusion. Extrusion can be enabled by setting the `extruded` property to true, if available. Users can provide a `getElevation` accessor to control how much each individual element would extrude.

To make extrusion looks natural and make extruded layers look visually pleasing, deck.gl v4 includes an experimental lighting module that provides basic shading of 3D layers. It has very straightforward APIs and should be easy for users to understand by simplying looking at every increasing number of examples that comes with deck.gl. It's worth mentioning that since it's experimental, the public APIs might change in the future release of deck.gl.

## Interactive Documentation

Deck.gl's documentation has been significantly improved and reorganized in response to user feedback. In particular, every layer now has an interactive layer browser allowing users to tweak all properties of the layer and see how they affect the final rendering of layers while reading the docs. It also serves as an intuitive tool for users to select appropriate layers for their use cases.

## Stand-Alone Examples

deck.gl v3 came with essentially a single example that was interleaved with the complicated build scripts and extensive package dependencies of the main library. This has been called out by many entry-level users, so the deck.gl team decide to provide multiple stand-alone examples with minimal configuration files. These examples should jump start the learning process on deck.gl and intrigued users can easily copy them out and bootstrapping their own app from them. These examples are located in the **example** folder in deck.gl's main repository.

## Interoperability Examples

To leverage your knowledge in data visualization with the tools you are familiar with, we also provide examples to demonstrate the interoperability between deck.gl and regular SVG-based visualizations. That is, you can use for example the modularized d3-* utilities for layout calculation, and have deck.gl take care of the rendering, so there is no heavy DOM manipulations and you get GPU-accelerated rendering of up to millions of elements for free.

## What’s Next?

Deck.gl v4 is an important milestone for us, but what's next? We have many ideas on how to move deck.gl forward and we would like to provide a bit more information on some of them.

### More layers

Layers are where the most of the users start using deck.gl. We plan to add more layers, both in the geospatial area and the InfoVis area in the future releases of deck.gl. We also encourages all deck.gl users and developers to consider submitting your fancy new layers to deck.gl through PR. If they actually help address some common questions and accomplish some common tasks in any areas of data visualization, they might end up being in the core layers catalog of deck.gl in next release!

### Text rendering support

Texts are crucial in various data visualization applications and can be implemented in various ways depending on specific use cases. Using WebGL to render text labels or geometries are both very performant and versartile. In deck.gl v4 we are not providing any official support for text rendering besides a basic sample layer called `LabelLayer` that was built on top of `IconLayer`. This is an area we are actively investigating and developing.

### Improved aggregation

The new aggregating layers in deck.gl v4 are only scratching the surface. More advanced aggregation algorithms will be researched and implemented if they are useful for our internal or external customers. We are even considering using powerful features in the newly released WebGL 2.0 to do the data aggregation on the GPUs.

### Improved layer composition

In the new v4 release of deck.gl, some new layers like the `GeoJsonLayer` and `HexagonLayer` are what we called **composite** layers as they are actually built on top of other core deck.gl layers. The composite layers have their own props but leverages  its underlying layers for part of their functionalities. This kind of layer composition greatly reduces the efforts in creating new layers and makes the internal structure of layers much easier to follow. In the future releases, we will continue making layer development easier by decoupling different sets of functionalities of layers and keeping improving our guides and docs.

### More advanced picking (selection) support

Picking or selection is also one of the most common tasks of any data visualization applications and is a core functionality we provide with deck.gl. In the v4 release, a color-coded picking process that are both much more robust and performant is implemented. We plan to continue improving picking by adopting better picking boundary arbitration, supporting square or polygon area picking, etc.

### Performance

High performance is always what we are seeking as deck.gl from the first day is designed to be a ***high performance*** visualization framework. Many under-the-hood performance improvements has went into the v4 release, including a 3.5~4X faster scatterplot layer, faster 64-bit maths, and ~2X performance boost in picking. In the future, we are considering implementing a better WebGL state manager that faciliate the resource sharing and reuse, a better layer manager that manages and update resources in a smarter way and a better rendering engine that only allows necessary data to hit GPUs from the very beginning.

### More data processing, possibly on GPU, for geospatial data analysis

As we march forward in the geospatial data analysis field, it's obvious that the single threaded Javascript engine in our browsers will soon be overwhelmed by computation intensive tasks. We can solve this by seeking help from backend, but not without its own limitations. The recently released WebGL 2.0 provided a way to access powerful GPUs on every desktops and laptops in a way that is not possible in the past. With features like transform feedback, we might be able to vastly accelerate many computational tasks in geospatial data analysis.


Finally, just in case there is any doubt from our users, we would like to reiterate our commitments that deck.gl be a  "geospatial visualization" library. All the non-geospatial use cases we are showing do not in any way compromise the geospatial visualization aspects of the library. To the contrary, as we mentioned earlier in this article, users can expect us to add even more "advanced" geospatial processing functionalities to the future releases of deck.gl.
