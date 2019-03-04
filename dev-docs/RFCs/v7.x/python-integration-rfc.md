# RFC: Jupyter Notebook/Python Integration Strategy for deck.gl and applications

* **Author**: Ib Green, Andrew Duberstein
* **Date**: Mar, 2019
* **Status**: **Draft**

## Summary

This RFC proposes adding a minimal official Python integration to deck.gl, focusing on Jupyter notebook support.


## Background

Improved support for data science and machine learning visualization is a focus area for deck.gl, and deck.gl is already very useful for geospatial visualizations in these contexts. Many data scientists work in Python and being able to easily visualized. A set of very simple bindings, focusing on overcoming the most basic integration issues and exposing a reasonable subset of the deck.gl API shoud be very valuable.


### Leveraging the deck.gl JSON API

Normally, exposing an API in a new language requires porting that API to the new language, creating a large set of class and function "wrappers" that glue to the original code. However, deck.gl now supports a JSON API. The JSON API makes it possible to access deck.gl layers and a large subset of deck.gl's functionality without directly using the deck.gl API, making it the ideal API entry point to expose in another language.

The idea is this to create a minimal binding in Python that allows a python application to generate a JSON payload compatible with the deck.gl API and then start an inline frame running deck.gl rendering that JSON payload.


### Focus Areas

We want to keep the scope very limited and focus on solving core problems such as:

* Making this Python module easy to install and use for Python users
* Handle proper initial sizing and resizing the JavaScript/HTML window
* Efficiently transfer large data sets between Python and JavaScript
* Make it easy to build more ambitions Python class libraries on top of the basic module.


### Constraints

deck.gl should not grow to include a major Python port of its API (e.g. a Python class library that mirrors all deck.gl layers). That would represent too big of a distraction to the core deck.gl mission. We should leave such work to the community, and instead encourage, support and promote such efforts as they happen.

Thus, other deck.gl/Pyton libraries could build on our official integration (i.e. use it as a python dependency), or just use it as an inspiration/springboard to get started and help solve some of the initial integration issues.


## Technical Challenges

* Starting up a JavaScript iframe in Notebook

* Controlling Size of iframe
  * full screen rendering
  * height of frame controllable by app?
  * frame resizable by user?

* One way communication
  * Most Python/JS bindings generate HTML dynamically using Python API then create the iframe, after that Python has no more control.
  * However deck.gl JSON api can accept new JSON payloads, they go through standard deck.gl layer diffing.
  * Maintain a network connection so that Python can push new payloads?

* Efficient data transfer
  * Many Python JS integrations serialize data into the HTML/JS payload.
  * Inefficient for large data sets.
  * Want to support binary data transfer: panda dataframe -> pyarrow -> deck


## Practical Concerns


* How to publish Python modules (pip, conda)?
* When to update? (every JS release)
* Versioning schemes (do Python package managers use semver)?
* Where to put Python code? (in same github repo, `bindings/python`?)
* ...


## Prior Art

### kepler.gl Jupyter Integration

* [RFC](https://github.com/uber/kepler.gl/issues/331)


### Mapbox Jupyter Integration

* [Blog Post](https://github.com/mapbox/mapboxgl-jupyter)
* [Github](https://github.com/mapbox/mapboxgl-jupyter/blob/master/docs/viz.md)


### Plotly Jupyter Integration

TBA


### D3 Integration

https://www.stefaanlippens.net/jupyter-custom-d3-visualization.html



## Future Extensions

Minimal integrations for other languages? Especially languages that run in Notebooks?

### R

See the [mapdeck](https://symbolixau.github.io/mapdeck/articles/mapdeck.html) integration for R.


### Sample External Python Framework Integration

Support development of an ongoing prototype integration.

* A richer Python class API exposing the deck.gl layers.
* Port it to use JSON API (at least as an option to generating HTML)
* Extend it to support two way updates if possible?
