# RFC: Property Animation

* **Authors**: Ib Green, ...
* **Date**: Feb 2018 (Initial version Aug 2017)
* **Status**: **Draft**


## Abstract

Describes a system for *animations* and *transitions* of deck.gl layer properties.


## Motivation

Adding animation to an visualization, especially an interactive visualization, can take it from great to extraordinary impact. Well-executed animations add a very deep level of polish and interest. However implementing good animations often requires considerable custom work in applications.

The goal of this RFC is making it much easier for deck.gl users to achieve great animations and almost effortless to achieve good baseline animations, at least for in certain category of visualization property changes.


## Considerations

The topic of animation is quite complex. There are many ways animation can be implemented and facilitated, and people often expect different things. Therefore we anticipate multiple RFCs that address different aspects of animation.

This RFC focused on animation of layer properties and GL parameters (i.e. `props.parameters`). It looks at automatic interpolation and time based animation of such properties.


## Summary

The following proposals are included in this RFC:

* Interpolation based animation - application sets a new state on layers, and they gradually adapt their visuals over time
    * Interpolation of uniforms...
    * Interpolation of gl parameters...

- **Time based animation** - layers respond to time, often "pulsating or undulating" through calling a sine or similar function.


The following types of animations are not included in this RFC.
- **Interpolation of Attributes** - Due to the significant complications related to the interpolation of attributes (performance, matching two structurally different attribute arrays etc) this topic will be discussed in a separate [Attribute Interpolation RFC]().
* Declarative configuration of animations
* Support for "Easings" - interpolate values at non-constant speed
* Automatic animation as result of user events (i.e. enter/leave type animations)


### Background - Current State

In deck.gl v4.1:
* layers are only redrawn when the dirty flag of at least one layer is set, or when the viewport changes.
* layer dirty flags are only set when new layers are actually provided by the application (which typically happens when application state changes).



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

Reference: See the separate [prop-types RFC]()

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
  interpolationParams: {
    elevationScale: {time: 2000, easing: QUADRATIC, ...}
    radiusScale: false
  },
  ...
});
```


## Proposal: Support time-based animation

Animation that is not driven by property updates, but rather the passing of time.

Layers would have the ability to mark themselves as animated. 
```js
new Layer({
  animated: true
});
```
The layers that are marked as animated will be updated every *browser animation frame* (i.e. 60 times per second), even if the application has not rendered (created layers with new props).


### Layer props can now be set to "updater functions"

To make time-based animation work, the idea is that individual props could be set to "updater functions" in addition to constant values. The functions would be called every time the layer is updated (whether through a render or a time-based update).

The updated functions would take a context parameter (see the luma.gl [AnimationLoop](https://uber.github.io/luma.gl/#/documentation/api-reference/animation-loop) for a good reference on how this would work).

```js
const layer = new Layer {
  radius: ({tick}) => Math.sin(tick * 0.1),
  color: ({tick}) => [128, 128, tick % 255, 255]
}
```




## Questions

* Question: Call `updateState` every frame, or provide a new function life cycle function `animateState` to allow for optimized treatment of the animation case?
* **Model matrix interpolation** - Animating the `modelMatrix` `prop` could be very powerful:
    * For time based animations the updater funciton would return updated matrices
    * For interpolations, is there a reasonable way to automatically interpolate matrices that generally give the right visual results? This could be incredibly neat if it worked, but numeric "instability" might make it impractical.
