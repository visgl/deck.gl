<p align="right">
  <a href="https://github.com/uber/deck.gl/blob/4.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/current-v4-brightgreen.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/tree/3.0-release/docs">
    <img src="https://img.shields.io/badge/legacy-v3-green.svg?style=flat-square" />
  </a>
</p>

# Introduction

deck.gl is designed to make visualization of large data sets simple.
It enables users to quickly get impressive visual results with limited effort
through composition of existing layers, while offering a complete architecture
for packaging advanced WebGL based visualizations as reusable JavaScript
layers.

## Brief Overview

The basic idea of using deck.gl is to render a stack of visual overlays,
usually (but not always) over maps.

To make this simple concept work, deck.gl handles a number of challenges:

* Handling of large data sets and performant updates
* Interactive event handling such as picking
* Cartographic projections and integration with underlying map
* A catalog of proven, well-tested layers
* Easy to create new layers or customize existing layers

## Ecosystem

deck.gl has been developed in parallel with a number of companion modules:

* [luma.gl](https://uber.github.io/luma.gl/#/) -
  A general purpose WebGL library designed to be interoperable both with the
  raw WebGL API and (as far as possible) with other WebGL libraries.
  In particular, luma.gl does not claim ownership of the WebGL context, and can
  work with any supplied context, including contexts created by the application
  or other WebGL libraries.
* [react-map-gl](https://uber.github.io/react-map-gl/#/) - A React wrapper
  around Mapbox GL which works seamlessly with deck.gl.

In addition, in the future we plan to publish additional deck.gl layers and
layer packages as separate modules.

## Learning deck.gl

How you approach learning deck.gl will depend on your previous
knowledge and how you want to use it.

Learning the layer props, and reading the basic articles in the deck.gl
documentation should of course be the first step. But where to go
after that?

### Understanding the Reactive Programming Model

deck.gl is designed according to the principles of the
[Reactive Programming Model](https://en.wikipedia.org/wiki/Reactive_programming).

The key to writing good, performant deck.gl applications and layers
lies in understanding how to minimize updates and redundant calculations.

It is important to understand the implications of the shallow equality
comparisons deck.gl performs on layer properties, and how this implies that
new data and property objects must only be created when the underlying
data actually changes in order to prevent unnecessary updates.

There is an impressive amount of information (documentation, blog posts,
educational videos, etc.) on the reactive programming paradigm in relation to
modern web frameworks such as React, Flux and Redux. Where to start depends
mostly on your application architecture choices.

### Understanding WebGL

This is only needed if you want to create custom layers in deck.gl.
Note that while trying out a new ambitious rendering approach for a
new layer will likely require deeper knowledge, it is often possible to modify
or extend existing deck.gl layers (including modifying the shader code) with
a surprisingly limited amount of WebGL knowledge.

There are many web resources for learning WebGL.
