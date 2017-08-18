# RFC: Property Types System for deck.gl

* **Authors**: Ib Green, ...
* **Date**: Aug 2017
* **Status**: Initial draft, not ready for review

# Overview

It would be useful to support a prop types system similar to React
```js
Layer.propTypes = {
  maxRadius: PropTypes.number,
  ...
}
```


## Requirements

* Validation during debug, but not in production.
* Type information should support layer browser type applications (automatically)
* Prop types should be combined across inheritance chain

Open Issues
* Composite Layers, Prop forwarding...


## Alternatives


Use the React `PropTypes` module

React has recently broken out their PropType system into a separate component. They are making it optional for applications.

PROS:
* Code Size/Familiarity - Many React applications will already have included the module.
CONS:
* Limited specification. The React PropTypes do not contain information on the range of numeric values etc, but perhaps it can be extended to do so.
* "React-specific" - The PropTypes module is still React focused, for non-React bindings of deck.gl it may make less sense to include this dependency. And it might evolve in ways that do not fit deck.gl.


## Proposal - A custom deck.gl PropTypes system

