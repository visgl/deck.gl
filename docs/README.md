# Introduction

<p align="center">
  These docs are for
  <a href="https://github.com/uber/deck.gl/blob/7.2-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v7.2-brightgreen.svg?style=flat-square" />
  </a>
  Looking for an old version?
  <a href="https://github.com/uber/deck.gl/blob/7.1-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v7.1-green.svg?style=flat-square" />
  <a href="https://github.com/uber/deck.gl/blob/7.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v7.0-green.svg?style=flat-square" />
  <a href="https://github.com/uber/deck.gl/blob/6.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/deck.gl-v6.0-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/blob/5.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/v-5.0-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/blob/4.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/v-4.0-green.svg?style=flat-square" />
  </a>
  <a href="https://github.com/uber/deck.gl/tree/3.0-release/docs/README.md">
    <img src="https://img.shields.io/badge/v-3.0-green.svg?style=flat-square" />
  </a>
</p>

deck.gl is designed to make visualization of large data sets simple. It enables users to quickly get impressive visual results with limited effort through composition of existing layers, while offering a complete architecture for packaging advanced WebGL based visualizations as reusable JavaScript layers.

## Brief Overview

The basic idea of using deck.gl is to render a stack of visual overlays, usually (but not always) over maps.

To make this simple concept work, deck.gl handles a number of challenges:

* Handling of large data sets and performant updates
* Interactive event handling such as picking
* Cartographic projections and integration with underlying map
* A catalog of proven, well-tested layers
* Easy to create new layers or customize existing layers

## Ecosystem

deck.gl is one of the main frameworks in the [vis.gl](http://vis.gl) framework suite.

deck.gl has been developed in parallel with a number of companion modules, e.g.:

* [luma.gl](https://luma.gl/) - A general purpose WebGL library designed to be interoperable both with the raw WebGL API and (as far as possible) with other WebGL libraries. In particular, luma.gl does not claim ownership of the WebGL context, and can work with any supplied context, including contexts created by the application or other WebGL libraries.
* [react-map-gl](https://uber.github.io/react-map-gl/) - A React wrapper around Mapbox GL which works seamlessly with deck.gl.
* [nebula.gl](https://nebula.gl/) - A high-performance feature editing framework for deck.gl.


## Learning deck.gl

How you approach learning deck.gl will depend on your previous knowledge and how you want to use it.

Getting familiar with the various layers and their props, and reading the basic articles in the deck.gl developer guide should of course be one of the first steps.

Exploring the deck.gl examples is a good starting point.

In-depth tutorials for how to develop deck.gl applications are available on the [Vis Academy](http://vis.academy/#/) website.

And our [blog](https://medium.com/vis-gl) contains a lot of additional information that might be helpful.

But where to go after that?


### Learning Reactive UI Programming

deck.gl is designed according to functional UI programming principles, made fashionable by frameworks like React. The key to writing good, performant deck.gl applications and layers lies in knowing how to minimize updates and redundant calculations, understanding concepts like "shallow equality" etc. This is critical when using deck.gl with React, but can still be helpful to understand when using deck.gl in non-React contexts.

There is an impressive amount of information (documentation, blog posts, educational videos, etc.) on the reactive programming paradigm in relation to modern web frameworks such as React, Flux and Redux. Where to start depends mostly on your application architecture choices. Exploring such information will take you beyond what we can cover in the basic deck.gl developer guide article on Updates.


### Understanding WebGL

Knowledge of WebGL is only needed if you want to create custom layers in deck.gl. Note that while trying out a new ambitious rendering approach for a new layer will likely require deeper knowledge, it is often possible to modify or extend existing deck.gl layers (including modifying the shader code) with a surprisingly limited amount of WebGL knowledge.

There are many web resources for learning WebGL. [luma.gl](https://uber.github.io/luma.gl/#/) can be a good start.
