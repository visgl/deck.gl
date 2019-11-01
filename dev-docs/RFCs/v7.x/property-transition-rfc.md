# RFC: Property Transitions

> Note: This RFC Makes a strong distinction between "animation" and "transitions". For information the distinction, see the introduction, for more information aboutabout property animation, see the complementary RFC about that topic.

* **Authors**: Ib Green, Xiaoji Chen
* **Date**: Aug 2019 (Initial version Aug 2017)
* **Status**: **Draft**


References
* [Animation Roadmap](/dev-docs/roadmaps/animation-roadmap.md)


## Abstract

This RFC proposes a system for *transitions* or *interpolations* (not covering *animation*) of deck.gl layer properties.


## Motivation

Adding animation to an visualization, especially an interactive visualization, can take it from great to extraordinary impact. Well-executed animations add a very deep level of polish and interest. However implementing good animations often requires considerable custom work in applications.

The goal of this RFC is making it much easier for deck.gl users to achieve great animations and almost effortless to achieve good baseline animations, at least for in certain category of visualization property changes.


## Summary

The following proposals are included in this RFC:

* Interpolation based animation - application sets a new state on layers, and they gradually adapt their visuals over time
    * Interpolation of uniforms...
    * Interpolation of gl parameters...


The following types of animations are not included in this RFC.
- **Interpolation of Attributes** - Due to the significant complications related to the interpolation of attributes (performance, matching two structurally different attribute arrays etc) this topic will be discussed in a separate [Attribute Interpolation RFC](/dev-docs/RFCs/v5.1/attribute-transition-rfc.md).
* Declarative configuration of animations
* Support for "Easings" - interpolate values at non-constant speed
* Automatic animation as result of user events (i.e. enter/leave type animations)


### Background - Current State

In deck.gl v7.2:

* layers support attribute transition with the `transitions` prop, where accessor names are used as keys.
* layers are redrawn if:
  - user provided a new layer instance with changed props (as defined by the prop type)
  - the viewport changes
  - there is an ongoing attribute transition
  - an async prop is loaded
  - layer state has changed via calling `setState` internally

## Proposal: Automatic interpolation of properties

The idea here is that setting a new value on an "interpolatable" props would not immediately make the layer take the new value, but would instead slowly animate the value from it's current state to its new.

This way this would work is similar to how the current deck.gl [HexagonLayer demo](https://uber.github.io/deck.gl/#/examples/core-layers/hexagon-layer) on startup slowly increases elevation of the hexagon from zero. Except there would be no application code necessary to achieve this. The layer would be set in interpolation mode, and would start rendering

### Issue: Speed of Interpolation

Once a change in value in an "interpolatable" prop has been detected, how long will the animation last?

Options:
* Constant duration, regardless of delta?
* Depending on range?
* Global speed factor?
* Specified for each prop?


### Issue: Dependence on a PropTypes System

Reference: See the separate [prop-types RFC](/dev-docs/RFCs/v6.3/prop-types-rfc.md)

A prop-types system would allow deck.gl to see if a certain property is interpolatable at all. If the prop is an integer or a float, or a color the interpolation strategy is clear, if a function or string we should not attempt interpolation. And deck.gl could start small, and gradually add interpolation support for more types as the system was built out.

More subtly, an advanced proptypes system would contain information about the allowed ranges of various props, which would enabled the interpolation system to calculate the percentage change of the whole range and use this e.g. to influence the interpolation speed (so that the percentual change range would remain constant, a big change would animate for a longer time).


### Properties suitable for interpolation

* Floats - The easiest to interpolate, just multiply with fractions
* Integers - needs to be interpolated in integer steps
* Colors - can be component-wise interpolated from a start color to and end color


### Controlling interpolation

The application may want the ability to control interpolation, at least in two different ways:
* Controlling if a prop should be interpolated at all (there might be times when the app wants to make a clean/instant transition).
* Controlling parameters of how a prop interpolates (its interpolation speed or easing for instance)

A possible design for handling this could be an object similar to updateTriggers that would enable the app to add params for each prop...
```js
new Layer({
  elevationScale: 100,
  radiusScale: 20,
  transitions: {
    elevationScale: {duration: 2000, easing: QUADRATIC, ...}
    radiusScale: false
  },
  ...
});
```
