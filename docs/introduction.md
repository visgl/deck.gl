# Introduction

deck.gl was created to make "reactive" WebGL-based visualizations of
"big data" simple, and to enable new users to quickly get impressive
results, while gradually enabling more flexibility and power as
users climb the learning curve.


## Brief Overview

The basic idea is to render a stack of visual overlays, usually (but
not always) over maps.

While the concept is simple, to do this right, deck.gl handles
a number of challenges, such as:

* Handling of large data sets and performant updates
* Event handling and picking
* Cartographic Projections and Integration with underlying map
* Selection of proven, well-tested Layers
* Ability for the user to create new Layers and customize existing Layers


## Ecosystem

deck.gl has been developed in parallel with a number of companion modules:

* [luma.gl](https://uber.github.io/luma.gl/#/) -
  A general purpose WebGL library that is designed to be interoperable
  both with the raw WebGL API and (as far as possible) with other WebGL
  libraries.
  In particular, luma.gl does not claim ownership of the WebGL context,
  and can work with any supplied context, including contexts created
  by the application or other WebGL libraries.
* [react-map-gl](https://uber.github.io/react-map-gl/#/) - A React
  wrapper around Mapbox GL which works seamlessly with deck.gl.
* [viewport-mercator-project](https://uber-common.github.io/viewport-mercator-project/#/) - The perspective enabled Web Mercator
  projections and transformations that were created for deck.gl.
  These are independently useful and can for instance be used with
  react-map-gl to create perspective enabled SVG overlays.

In addition, in the future we hope to publish additional deck.gl layers and
layer packages as separate modules.


## Learning deck.gl

How you approach learning deck.gl will probably depend on your previous
knowledge and how you want to use it.

Learning the layer props, and reading the basic articles in the deck.gl
documentation should of course be the first step. But where do you go
after that?


### Understanding Dataflow Architecture

The key to writing good, performant deck.gl layers lies in understanding
how to minimize updates of any calculated data, such as WebGL.

There is an impressive amount of information (documentation, blog posts,
educational videos etc) on data flow architecture in relation to
React, Flux and Redux. Where to start depends mostly on your
application architecture choices


### Understanding WebGL

This is really only needed if you want to create custom layers in deck.gl
and experience has shown that it is often possible to modify or extend
an existing deck.gl layer with a surprisingly limited amount of WebGL
knowledge.

There are many web resources for learning WebGL. The
[luma.gl](https://uber.github.io/luma.gl/#/) documentation
can be a starting point.
