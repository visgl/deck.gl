# RFC: Component Wrapping Library RFC

* **Authors**: Ib Green, Hong Wang
* **Date**: Aug 2019
* **Status**: Draft

## Abstract

This RFC proposes a general system for registering prop-based components so that they can be instantiated (hydrated) from a hierarchical description, such as a simple JSON file. This system can be used by component authors to wrap components and "automatically" make them accesible from conformant binding layers such as JSON, python/jupyter notebook, R, etc.

## Background

Multiple parallel efforts have started on exposing our components (deck.gl layers, React components and even applications such as kepler.gl and [Manifold](https://github.com/uber/manifold)) into non-JavaScript "binding environments", which, at this moment, primarily consists of Jupyter Notebook and the JSON editor (https://deck.gl/json).

Many of wheels are being reinvented, but more importantly, as we scale up and aim to expose potentially hundreds of JS components to multiple non-JS binding environments, we will need an efficient system that does not require every JS engineer to spend weeks learning about the specifics of the "binding environments", e.g. Python build system and Jupyter nbextensions and widgets.

Therefore, a common JS component registration mechanism that language specific bindings can be written towards should be able to provide a big efficiency improvement for JS developers who want to create bindings for their projects. This improvement in efficiency may accelerate the adoption of JS libraries/tools in the other environments (e.g. Jupyter notebooks), which potentially benefit not just the JS developers but also the end users, in particular, the data scientists. This is because the end users such as data scientists typically have some needs for visualizations, and nowadays, many innovations on visualizations happen within the web ecosystem in which Javascript is heavily involved. This project can help increase the exposure of new visualization projects to data scientists by simplifying the creation of Jupyter Python wrappers for the JS projects, unlocking their potentials to accelerate machine learning workflows.


## Highlighted Benefit

**For Visualization Developers**

Easing the creation of wrappers in the other "binding environments".

**For Data Scientists**

Increasing the amount/quality of the available visualization tools/libraries in Python and Juypter, many of which have to potential to accelerate machine learning workflows.

## Functionality Handled by Wrapper Library

### A Configuration Object

The current [deck.gl/json library](https://deck.gl/#/documentation/submodule-api-reference/deckgl-json/json-converter) already allows for a set of layers and enumerations to be exposed to the JS API through a small configuration object. It is highly deck.gl specific (deals with maps of `layers` and `views`), but can easily be generalized to deal with classes and react components.

The JSON converter traverses through the JSON object and converts the "dehydrated" objects in the JSON tree to "live" JavaScript components* bottom-up, returning a real JS object that can be rendered by React or passed to deck.gl as a new set of props. It also resolves enum strings to values, and string expressions to functions, etc.


### JavaScript Class Registration

Any prop based JS class (that is instantiated with a `new Class({...props})`) can be wrapped. JSON props are mapped 1-to-1.

### React Class Registration

React components are prop based, and we could traverse through a JSON hierarcy and call `React.createElement` instead of `new` on each object we find. Some handlings are also necessary for `children` prop, and the top level component needs to be passed to the React renderer.

We don't want this library to have hard dependencies on React, because the wrapped project may not necessarily depend on react, e.g. when this library is used to wrap the deck.gl JS components. Allowing simple injection of `react` and `react-dom` into the configuration object enables soft dependencies, where the wrapped app makes the importing/bundling choice, and, at the same time, our wrapper component still gets access to the modules.

### Application Registration

* Some support for "iframe" based applications is likely worthwhile, at least on the binding implementation sides, allowing us to easily expose hosted/deployed apps.

* **method-based (imperative) APIs** - kepler currently exposes an imperative API in Python `kepler.add_data()`. "Wrapping" of method-based APIs is not handled in this RFC, but can potentially be added to the configuration (easy for simple cases, though complexity could quickly increase).

### Component Instantiation

Apart from defining the configuration object, there should also be a support for accepting the intermediary format(s), such as the current JSON format in deck, that allows components to be instantiated from a description format that can be sent between processes.

### String Expression Support

Callbacks are one of the harder things to implement in a cross-language environment. A simple way to create expressions from strings is already implemented in the JSON parser and is expected to be generically available to all binding layers (it may not be the most natural/elegant way to define a callback in e.g. Python, but it will get the job done in many cases).

Good error handling for parsing and evaluating string expressions is, of course, highly desirable.

### Two Way Messaging

Another take on callbacks, there should be a standard mechanism for wiring up callbacks to generate events that can be captured in the binding layer.

### Error Handling

Asking developers working in the binding environment (e.g. Jupyter Notebook or the JSON editor) to constantly open the JavaScript console and check for errors does not cut it.

Before rushing to add special error handling to the binding layer, consider that improved error handling is just as valuable JavaScript as well. The recommendation is to provide good standardized error capture and forwarding mechanisms, and when they are lacking, always consider if we can solve the problem by improving error handling on the JS side, so that ALL incarnations of our components benefit.

A quick list of techniques for general error handling:
- Intercept console.warn, console.error
- Intercept window.onerror (uncaught exceptions)
- Integrate with probe.gl log
- Improve our libraries if needed to report errors through probe.gl
- Define a standard messaging mechanism for forwarding error messages to binding layer


### Type "Forwarding"

In some bindings such as Python, there is a big interest to automatically generate Python class definitions that have Python type definitions for all props. Automating this requires 1. knowing the types of props in JavaScript and 2. being able to forward these in a standardized way (e.g. a JSON payload) to the binding layer which can then proceed to dynamically generate classes.

deck.gl components have a semantic `propType` system with types that should be well suited to this purpose, and in addition is fully under our control so we can make necessary additions. If this works out, no additional work should be needed to make the Python class that is a counterpart a specific deck.gl layer fully typed in Python.

On the other hand, React components have a PropType system that is not fully semantic (React `prop-types` are just functions that can be invoked to check the type. They do not have metadata about the type, and they can be composed meaning that the identity of the functions does not belong to a small well-known set). In addition, React is moving away from prop-types to compile time mechanisms such as flow and typescript, which are even harder (but perhaps not impossible) to capture.

For components that do not have deck.gl propTypes, it could be valuable to allow such type data to be added to the configuration object.

```js
const configuration = {
  classes: {
    MyClassThatAlreadyHasTypes,
    MyUntypedClass: {
      type: MyUntypedClass,
      propTypes: {
        value: {type: 'integer'}
      }
    }
  }
};
```

 Perhaps deck.gl's type syntax could be made available as a general purpose module.


### Binary Data Transport

In particular for the arrow case, the binding layer should contain support for binary data transport.
